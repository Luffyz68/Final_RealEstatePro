const { query, get, run } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');
const { parsePositiveInt, validateIsoDate, normalizeText, requireEnum } = require('../utils/validation');
const { canManageAppointment } = require('../utils/accessPolicies');

const getAppointments = async (req, res, next) => {
  try {
    const user = req.user;
    let sql = `
      SELECT 
        a.*,
        p.title as property_title, p.price as property_price, p.main_image as property_image,
        u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
        ag.full_name as agent_name, ag.email as agent_email, ag.phone as agent_phone
      FROM appointments a
      JOIN properties p ON a.property_id = p.id
      JOIN users u ON a.user_id = u.id
      JOIN users ag ON a.agent_id = ag.id
    `;
    let params = [];

    if (user.role === 'customer') {
      sql += ' WHERE a.user_id = ?';
      params.push(user.id);
    } else if (user.role === 'agent') {
      sql += ' WHERE a.agent_id = ?';
      params.push(user.id);
    }

    sql += ' ORDER BY a.id DESC';

    const appointments = await query(sql, params);
    return sendSuccess(res, 'Appointments retrieved successfully', appointments);
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        a.*,
        p.title as property_title, p.price as property_price, p.main_image as property_image,
        u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
        ag.full_name as agent_name, ag.email as agent_email
      FROM appointments a
      JOIN properties p ON a.property_id = p.id
      JOIN users u ON a.user_id = u.id
      JOIN users ag ON a.agent_id = ag.id
      WHERE a.id = ?
    `;
    const appt = await get(sql, [id]);
    if (!appt) {
      return sendError(res, 'Appointment not found', 404);
    }

    if (req.user.role === 'customer' && appt.user_id !== req.user.id) {
      return sendError(res, 'Access forbidden', 403);
    }
    if (req.user.role === 'agent' && appt.agent_id !== req.user.id) {
      return sendError(res, 'Access forbidden', 403);
    }

    return sendSuccess(res, 'Appointment retrieved successfully', appt);
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const { property_id, appointment_date, appointment_time, message } = req.body;
    const userId = req.user.id;

    const safePropertyId = parsePositiveInt(property_id, 'Property ID');
    const safeDate = validateIsoDate(appointment_date, 'Appointment date');
    const safeTime = normalizeText(appointment_time, 'Appointment time', { required: true, max: 20 });
    if (new Date(`${safeDate}T23:59:59`) < new Date()) return sendError(res, 'Appointment date must be in the future', 400);

    const prop = await get("SELECT id, agent_id FROM properties WHERE id = ? AND status = 'available'", [safePropertyId]);
    if (!prop) {
      return sendError(res, 'Property not found', 404);
    }

    const result = await run(
      `INSERT INTO appointments (user_id, property_id, agent_id, appointment_date, appointment_time, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, safePropertyId, prop.agent_id, safeDate, safeTime, normalizeText(message, 'Message', { max: 2000 })]
    );

    const newAppt = await get('SELECT * FROM appointments WHERE id = ?', [result.id]);
    return sendSuccess(res, 'Appointment requested successfully', newAppt, 201);
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, appointment_date, appointment_time, message } = req.body;

    const appt = await get('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!appt) {
      return sendError(res, 'Appointment not found', 404);
    }

    const nextStatus = status ? requireEnum(status, ['pending', 'approved', 'rejected', 'completed', 'cancelled'], 'Status') : null;
    if (!canManageAppointment(req.user, appt, nextStatus)) return sendError(res, 'You are not allowed to make this appointment change.', 403);

    let updateFields = [];
    let params = [];

    if (status) {
      updateFields.push('status = ?');
      params.push(nextStatus);
    }
    if (appointment_date) {
      updateFields.push('appointment_date = ?');
      if (req.user.role === 'customer') return sendError(res, 'Customers cannot reschedule an appointment after submission.', 403);
      params.push(validateIsoDate(appointment_date, 'Appointment date'));
    }
    if (appointment_time) {
      updateFields.push('appointment_time = ?');
      if (req.user.role === 'customer') return sendError(res, 'Customers cannot reschedule an appointment after submission.', 403);
      params.push(normalizeText(appointment_time, 'Appointment time', { required: true, max: 20 }));
    }
    if (message !== undefined) {
      updateFields.push('message = ?');
      if (req.user.role === 'customer') return sendError(res, 'Customers cannot edit an appointment after submission.', 403);
      params.push(normalizeText(message, 'Message', { max: 2000 }));
    }

    if (updateFields.length === 0) {
      return sendError(res, 'No fields provided for update', 400);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await run(`UPDATE appointments SET ${updateFields.join(', ')} WHERE id = ?`, params);
    const updated = await get('SELECT * FROM appointments WHERE id = ?', [id]);

    return sendSuccess(res, 'Appointment updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appt = await get('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!appt) {
      return sendError(res, 'Appointment not found', 404);
    }

    if (req.user.role !== 'admin') return sendError(res, 'Only administrators can permanently delete appointments.', 403);

    await run('DELETE FROM appointments WHERE id = ?', [id]);
    return sendSuccess(res, 'Appointment deleted successfully', { id: parseInt(id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
