const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, refreshToken } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/securityMiddleware');

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/refresh-token', authenticateToken, refreshToken);

module.exports = router;

