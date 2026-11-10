const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');
const { normalizeEmail, normalizeText, validatePassword } = require('../utils/validation');
const { getConfig } = require('../config/env');

const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone } = req.body;

    const safeName = normalizeText(full_name, 'Full name', { required: true, max: 100 });
    const safeEmail = normalizeEmail(email);
    validatePassword(password);

    const existing = await get('SELECT id FROM users WHERE email = ?', [safeEmail]);
    if (existing) {
      return sendError(res, 'Email is already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Force role to customer for public registration
    const result = await run(
      `INSERT INTO users (full_name, email, password, phone, role, status) VALUES (?, ?, ?, ?, 'customer', 'active')`,
      [safeName, safeEmail, hashedPassword, normalizeText(phone, 'Phone', { max: 30 })]
    );

    const newUser = await get('SELECT id, full_name, email, phone, bio, role, profile_image, status, created_at FROM users WHERE id = ?', [result.id]);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      getConfig().jwtSecret,
      { expiresIn: getConfig().jwtExpiresIn }
    );

    return sendSuccess(res, 'User registered successfully', { token, user: newUser }, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (username || email || '').trim();

    if (!identifier || !password) {
      return sendError(res, 'Username or email and password are required', 400);
    }

    const lowerId = identifier.toLowerCase();

    // Match by full email, or by the local-part before '@'
    // (e.g. "admin" matches "admin@example.com")
    const user = await get(
      `SELECT * FROM users 
       WHERE LOWER(email) = ? 
          OR LOWER(SPLIT_PART(email, '@', 1)) = ?`,
      [lowerId, lowerId]
    );

    if (!user) {
      return sendError(res, 'Invalid username/email or password', 401);
    }

    if (user.status !== 'active') {
      return sendError(res, 'Your account is deactivated. Contact administrator.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid username/email or password', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getConfig().jwtSecret,
      { expiresIn: getConfig().jwtExpiresIn }
    );

    delete user.password;

    return sendSuccess(res, 'Login successful', { token, user });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await get('SELECT id, full_name, email, phone, bio, role, profile_image, status, created_at, updated_at FROM users WHERE id = ?', [req.user.id]);
    return sendSuccess(res, 'Profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { full_name, email, phone, bio, profile_image, password, current_password } = req.body;
    const userId = req.user.id;

    let updateFields = [];
    let params = [];

    if (full_name) {
      updateFields.push('full_name = ?');
      params.push(normalizeText(full_name, 'Full name', { required: true, max: 100 }));
    }
    if (email) {
      const safeEmail = normalizeEmail(email);
      const emailCheck = await get('SELECT id FROM users WHERE email = ? AND id != ?', [safeEmail, userId]);
      if (emailCheck) {
        return sendError(res, 'Email is already in use by another user', 409);
      }
      updateFields.push('email = ?');
      params.push(safeEmail);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      params.push(normalizeText(phone, 'Phone', { max: 30 }));
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      params.push(normalizeText(bio, 'Bio', { max: 500 }));
    }
    if (profile_image !== undefined) {
      updateFields.push('profile_image = ?');
      params.push(normalizeText(profile_image, 'Profile image', { max: 10000000 }));
    }
    if (password) {
      validatePassword(password);
      if (!current_password) return sendError(res, 'Current password is required to set a new password', 400);
      const current = await get('SELECT password FROM users WHERE id = ?', [userId]);
      if (!current || !(await bcrypt.compare(current_password, current.password))) return sendError(res, 'Current password is incorrect', 400);
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      params.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return sendError(res, 'No fields provided for update', 400);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(userId);

    await run(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, params);

    const updatedUser = await get('SELECT id, full_name, email, phone, bio, role, profile_image, status, created_at, updated_at FROM users WHERE id = ?', [userId]);

    return sendSuccess(res, 'Profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const user = await get('SELECT id, full_name, email, phone, bio, role, profile_image, status, created_at, updated_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getConfig().jwtSecret,
      { expiresIn: getConfig().jwtExpiresIn }
    );

    return sendSuccess(res, 'Token refreshed', { token, user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  refreshToken
};
