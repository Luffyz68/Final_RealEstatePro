const { query, get, run } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');
const { normalizeEmail, normalizeText, parsePositiveInt, requireEnum } = require('../utils/validation');

const getInquiries = async (req, res, next) => {
  try {
    const user = req.user;
    let sql = `
      SELECT 
        i.*,
        p.title as property_title, p.price as property_price, p.main_image as property_image,
        u.full_name as customer_name, u.email as customer_email
      FROM inquiries i
      JOIN properties p ON i.property_id = p.id
      LEFT JOIN users u ON i.user_id = u.id
    `;
    let params = [];

    if (user.role === 'customer') {
      sql += ' WHERE i.user_id = ?';
      params.push(user.id);
    } else if (user.role === 'agent') {
      sql += ' WHERE p.agent_id = ?';
      params.push(user.id);
    }
    // Admin sees all

    sql += ' ORDER BY i.id DESC';

    const inquiries = await query(sql, params);
    return sendSuccess(res, 'Inquiries retrieved successfully', inquiries);
  } catch (error) {
    next(error);
  }
};

const getInquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        i.*,
        p.title as property_title, p.price as property_price, p.main_image as property_image, p.agent_id
      FROM inquiries i
      JOIN properties p ON i.property_id = p.id
      WHERE i.id = ?
    `;
    const inquiry = await get(sql, [id]);

    if (!inquiry) {
      return sendError(res, 'Inquiry not found', 404);
    }

    if (req.user.role === 'customer' && inquiry.user_id !== req.user.id) {
      return sendError(res, 'Access forbidden', 403);
    }
    if (req.user.role === 'agent' && inquiry.agent_id !== req.user.id) {
      return sendError(res, 'Access forbidden', 403);
    }

    return sendSuccess(res, 'Inquiry retrieved successfully', inquiry);
  } catch (error) {
    next(error);
  }
};

const createInquiry = async (req, res, next) => {
  try {
    const { property_id, name, email, phone, message } = req.body;
    const userId = req.user ? req.user.id : null;
    const safePropertyId = parsePositiveInt(property_id, 'Property ID');
    const safeName = normalizeText(name, 'Name', { required: true, max: 100 });
    const safeEmail = normalizeEmail(email);
    const safePhone = normalizeText(phone, 'Phone', { required: true, max: 30 });
    const safeMessage = normalizeText(message, 'Message', { required: true, max: 3000 });

    const prop = await get("SELECT id FROM properties WHERE id = ? AND status != 'hidden'", [safePropertyId]);
    if (!prop) {
      return sendError(res, 'Property not found', 404);
    }

    const result = await run(
      `INSERT INTO inquiries (user_id, property_id, name, email, phone, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, safePropertyId, safeName, safeEmail, safePhone, safeMessage]
    );

    const newInquiry = await get('SELECT * FROM inquiries WHERE id = ?', [result.id]);
    return sendSuccess(res, 'Inquiry submitted successfully', newInquiry, 201);
  } catch (error) {
    next(error);
  }
};

const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const safeStatus = requireEnum(status, ['pending', 'contacted', 'resolved', 'closed'], 'Status');

    const inquiry = await get(`
      SELECT i.*, p.agent_id 
      FROM inquiries i 
      JOIN properties p ON i.property_id = p.id 
      WHERE i.id = ?
    `, [id]);

    if (!inquiry) {
      return sendError(res, 'Inquiry not found', 404);
    }

    if (req.user.role === 'agent' && inquiry.agent_id !== req.user.id) {
      return sendError(res, 'Access forbidden. You can only update inquiries for your properties.', 403);
    }

    await run('UPDATE inquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [safeStatus, id]);
    const updated = await get('SELECT * FROM inquiries WHERE id = ?', [id]);

    return sendSuccess(res, 'Inquiry status updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

const deleteInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inquiry = await get('SELECT id FROM inquiries WHERE id = ?', [id]);
    if (!inquiry) {
      return sendError(res, 'Inquiry not found', 404);
    }

    await run('DELETE FROM inquiries WHERE id = ?', [id]);
    return sendSuccess(res, 'Inquiry deleted successfully', { id: parseInt(id) });
  } catch (error) {
    next(error);
  }
};

const replyToInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;
    
    if (!replyMessage || replyMessage.trim().length === 0) {
      return sendError(res, 'Reply message is required', 400);
    }

    const inquiry = await get(`
      SELECT i.*, p.agent_id 
      FROM inquiries i 
      JOIN properties p ON i.property_id = p.id 
      WHERE i.id = ?
    `, [id]);

    if (!inquiry) {
      return sendError(res, 'Inquiry not found', 404);
    }

    if (req.user.role === 'agent' && inquiry.agent_id !== req.user.id) {
      return sendError(res, 'Access forbidden. You can only reply to inquiries for your properties.', 403);
    }

    const safeReply = normalizeText(replyMessage, 'Reply Message', { required: true, max: 3000 });

    await run(`
      UPDATE inquiries 
      SET admin_reply = ?, replied_at = CURRENT_TIMESTAMP, status = 'contacted', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [safeReply, id]);

    const updated = await get('SELECT * FROM inquiries WHERE id = ?', [id]);
    return sendSuccess(res, 'Reply sent successfully', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInquiries,
  getInquiryById,
  createInquiry,
  updateInquiryStatus,
  deleteInquiry,
  replyToInquiry
};
