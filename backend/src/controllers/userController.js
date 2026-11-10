const bcrypt = require('bcryptjs');
const { query, get, run } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');
const { normalizeEmail, normalizeText, validatePassword, requireEnum, parsePagination } = require('../utils/validation');

const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    const pagination = parsePagination({ page, limit });
    const offset = pagination.offset;

    let where = [];
    let params = [];

    if (search) {
      where.push('(full_name ILIKE ? OR email ILIKE ? OR phone ILIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (role) {
      where.push('role = ?');
      params.push(role);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countResult = await get(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
    const total = countResult ? countResult.total : 0;

    const sql = `
      SELECT id, full_name, email, phone, bio, role, profile_image, status, created_at, updated_at 
      FROM users ${whereClause} 
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `;
    const users = await query(sql, [...params, pagination.limit, offset]);

    return sendSuccess(res, 'Users retrieved successfully', users, 200, {
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await get('SELECT id, full_name, email, phone, bio, role, profile_image, status, created_at, updated_at FROM users WHERE id = ?', [id]);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, 'User retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, bio, role = 'customer', status = 'active' } = req.body;

    const safeName = normalizeText(full_name, 'Full name', { required: true, max: 100 });
    const safeEmail = normalizeEmail(email);
    validatePassword(password);
    const safeRole = requireEnum(role, ['admin', 'agent', 'customer'], 'Role');
    const safeStatus = requireEnum(status, ['active', 'inactive'], 'Status');

    const existing = await get('SELECT id FROM users WHERE email = ?', [safeEmail]);
    if (existing) {
      return sendError(res, 'Email is already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const safeBio = bio !== undefined ? normalizeText(bio, 'Bio', { max: 500 }) : null;
    const result = await run(
      `INSERT INTO users (full_name, email, password, phone, bio, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [safeName, safeEmail, hashedPassword, normalizeText(phone, 'Phone', { max: 30 }), safeBio, safeRole, safeStatus]
    );

    const newUser = await get('SELECT id, full_name, email, phone, bio, role, profile_image, status, created_at FROM users WHERE id = ?', [result.id]);
    return sendSuccess(res, 'User created successfully', newUser, 201);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, bio, profile_image, role, status, password } = req.body;

    const user = await get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    let updateFields = [];
    let params = [];

    if (full_name) {
      updateFields.push('full_name = ?');
      params.push(normalizeText(full_name, 'Full name', { required: true, max: 100 }));
    }
    if (email) {
      const safeEmail = normalizeEmail(email);
      const emailCheck = await get('SELECT id FROM users WHERE email = ? AND id != ?', [safeEmail, id]);
      if (emailCheck) {
        return sendError(res, 'Email is already in use by another user', 409);
      }
      updateFields.push('email = ?');
      params.push(safeEmail);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      params.push(phone ? normalizeText(phone, 'Phone', { max: 30 }) : null);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      params.push(bio ? normalizeText(bio, 'Bio', { max: 500 }) : null);
    }
    if (profile_image !== undefined) {
      updateFields.push('profile_image = ?');
      params.push(profile_image ? normalizeText(profile_image, 'Profile image', { max: 10000000 }) : null);
    }
    if (role) {
      const nextRole = requireEnum(role, ['admin', 'agent', 'customer'], 'Role');
      if (user.role === 'admin' && nextRole !== 'admin') {
        const activeAdmins = await get("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'");
        if (activeAdmins.count <= 1) return sendError(res, 'Cannot change the role of the last active administrator', 400);
      }
      updateFields.push('role = ?');
      params.push(nextRole);
    }
    if (status) {
      if (Number(id) === Number(req.user.id) && status === 'inactive') return sendError(res, 'You cannot deactivate your own account', 400);
      // Prevent deactivating final admin
      if (user.role === 'admin' && status === 'inactive') {
        const activeAdmins = await get("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'");
        if (activeAdmins && activeAdmins.count <= 1) {
          return sendError(res, 'Cannot deactivate the last active admin user', 400);
        }
      }
      updateFields.push('status = ?');
      params.push(requireEnum(status, ['active', 'inactive'], 'Status'));
    }
    if (password) {
      validatePassword(password);
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      params.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return sendError(res, 'No fields provided for update', 400);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await run(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, params);

    const updatedUser = await get('SELECT id, full_name, email, phone, bio, role, profile_image, status, created_at, updated_at FROM users WHERE id = ?', [id]);
    return sendSuccess(res, 'User updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    if (Number(id) === Number(req.user.id)) return sendError(res, 'You cannot delete your own account', 400);

    const propertyCount = await get('SELECT COUNT(*) AS count FROM properties WHERE agent_id = ?', [id]);
    if (propertyCount.count > 0) return sendError(res, `Cannot delete this account because it manages ${propertyCount.count} properties. Reassign them first.`, 400);

    if (user.role === 'admin') {
      const adminCount = await get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
      if (adminCount && adminCount.count <= 1) {
        return sendError(res, 'Cannot delete the final admin account', 400);
      }
    }

    await run('DELETE FROM users WHERE id = ?', [id]);
    return sendSuccess(res, 'User deleted successfully', { id: parseInt(id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
