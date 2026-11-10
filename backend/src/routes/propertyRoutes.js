const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  getPropertyImages,
  deletePropertyImage
} = require('../controllers/propertyController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { optionalAuth } = require('../middleware/optionalAuthMiddleware');
const { validateUploadedImages } = require('../middleware/uploadSecurity');

// Public routes
router.get('/', optionalAuth, getProperties);
router.get('/:id', optionalAuth, getPropertyById);
router.get('/:id/images', optionalAuth, getPropertyImages);

// Protected Admin / Agent routes
router.post('/', authenticateToken, authorizeRoles('admin', 'agent'), createProperty);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'agent'), updateProperty);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'agent'), deleteProperty);

// Admin-only approval route
router.put('/:id/approve', authenticateToken, authorizeRoles('admin'), require('../controllers/propertyController').approveProperty);

// Image Upload routes
router.post('/:id/images', authenticateToken, authorizeRoles('admin', 'agent'), upload.array('images', 10), validateUploadedImages, uploadPropertyImages);
router.delete('/images/:imageId', authenticateToken, authorizeRoles('admin', 'agent'), deletePropertyImage);

module.exports = router;
