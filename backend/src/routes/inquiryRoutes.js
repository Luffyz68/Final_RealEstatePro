const express = require('express');
const router = express.Router();
const { getInquiries, getInquiryById, createInquiry, updateInquiryStatus, deleteInquiry, replyToInquiry } = require('../controllers/inquiryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public or Authenticated can submit inquiry
router.post('/', (req, res, next) => {
  // Allow anonymous or token authenticated
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateToken(req, res, () => createInquiry(req, res, next));
  } else {
    return createInquiry(req, res, next);
  }
});

// Protected routes
router.use(authenticateToken);
router.get('/', getInquiries);
router.get('/:id', getInquiryById);
router.put('/:id/status', authorizeRoles('admin', 'agent'), updateInquiryStatus);
router.put('/:id/reply', authorizeRoles('admin', 'agent'), replyToInquiry);
router.delete('/:id', authorizeRoles('admin'), deleteInquiry);

module.exports = router;
