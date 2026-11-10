const { query, get, run } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');
const { requireEnum, normalizeText, validateIsoDate, parsePositiveInt } = require('../utils/validation');
const { canEditServiceRequest } = require('../utils/accessPolicies');

const getServiceRequests = async (req, res, next) => {
  try {
    const user = req.user;
    let sql = `
      SELECT 
        sr.*,
        p.title as property_title, p.price as property_price, p.main_image as property_image,
        u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM service_requests sr
      LEFT JOIN properties p ON sr.property_id = p.id
      JOIN users u ON sr.user_id = u.id
    `;
    let params = [];

    if (user.role === 'customer') {
      sql += ' WHERE sr.user_id = ?';
      params.push(user.id);
    } else if (user.role === 'agent') {
      sql += ' WHERE p.agent_id = ?';
      params.push(user.id);
    }
    // Agents & Admins can view all service requests

    sql += ' ORDER BY sr.id DESC';

    const requests = await query(sql, params);
    return sendSuccess(res, 'Service requests retrieved successfully', requests);
  } catch (error) {
    next(error);
  }
};

const getServiceRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        sr.*,
        p.title as property_title, p.price as property_price, p.main_image as property_image,
        u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM service_requests sr
      LEFT JOIN properties p ON sr.property_id = p.id
      JOIN users u ON sr.user_id = u.id
      WHERE sr.id = ?
    `;
    const request = await get(sql, [id]);
    if (!request) {
      return sendError(res, 'Service request not found', 404);
    }

    if (req.user.role === 'customer' && request.user_id !== req.user.id) {
      return sendError(res, 'Access forbidden', 403);
    }

    return sendSuccess(res, 'Service request retrieved successfully', request);
  } catch (error) {
    next(error);
  }
};

const createServiceRequest = async (req, res, next) => {
  try {
    const { property_id, service_type, description, preferred_date } = req.body;
    const userId = req.user.id;

    const validTypes = ['property_inspection', 'property_maintenance', 'cleaning', 'valuation', 'legal_consultation', 'other'];
    const safeType = requireEnum(service_type, validTypes, 'Service type');
    const safeDescription = normalizeText(description, 'Description', { required: true, max: 3000 });
    const safeDate = preferred_date ? validateIsoDate(preferred_date, 'Preferred date') : null;

    if (property_id) {
      const prop = await get('SELECT id FROM properties WHERE id = ?', [parsePositiveInt(property_id, 'Property ID')]);
      if (!prop) {
        return sendError(res, 'Property not found', 404);
      }
    }

    const result = await run(
      `INSERT INTO service_requests (user_id, property_id, service_type, description, preferred_date, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [userId, property_id || null, safeType, safeDescription, safeDate]
    );

    const newRequest = await get('SELECT * FROM service_requests WHERE id = ?', [result.id]);
    return sendSuccess(res, 'Service request created successfully', newRequest, 201);
  } catch (error) {
    next(error);
  }
};

const updateServiceRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, service_type, description, preferred_date } = req.body;

    const request = await get('SELECT * FROM service_requests WHERE id = ?', [id]);
    if (!request) {
      return sendError(res, 'Service request not found', 404);
    }

    if (!canEditServiceRequest(req.user, request)) return sendError(res, 'You are not allowed to edit this service request.', 403);

    let updateFields = [];
    let params = [];

    if (status) {
      const safeStatus = requireEnum(status, ['pending', 'in_progress', 'completed', 'cancelled'], 'Status');
      if (req.user.role === 'customer' && safeStatus !== 'cancelled') return sendError(res, 'Customers can only cancel pending requests.', 403);
      updateFields.push('status = ?');
      params.push(safeStatus);
    }
    if (service_type) {
      updateFields.push('service_type = ?');
      params.push(requireEnum(service_type, ['property_inspection', 'property_maintenance', 'cleaning', 'valuation', 'legal_consultation', 'other'], 'Service type'));
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      params.push(normalizeText(description, 'Description', { required: true, max: 3000 }));
    }
    if (preferred_date !== undefined) {
      updateFields.push('preferred_date = ?');
      params.push(preferred_date ? validateIsoDate(preferred_date, 'Preferred date') : null);
    }

    if (updateFields.length === 0) {
      return sendError(res, 'No fields provided for update', 400);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await run(`UPDATE service_requests SET ${updateFields.join(', ')} WHERE id = ?`, params);
    const updated = await get('SELECT * FROM service_requests WHERE id = ?', [id]);

    return sendSuccess(res, 'Service request updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

const deleteServiceRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await get('SELECT * FROM service_requests WHERE id = ?', [id]);

    if (!request) {
      return sendError(res, 'Service request not found', 404);
    }

    if (req.user.role !== 'admin') return sendError(res, 'Only administrators can permanently delete service requests.', 403);

    await run('DELETE FROM service_requests WHERE id = ?', [id]);
    return sendSuccess(res, 'Service request deleted successfully', { id: parseInt(id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServiceRequests,
  getServiceRequestById,
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest
};
