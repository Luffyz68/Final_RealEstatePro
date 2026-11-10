const express = require('express');
const router = express.Router();
const { getPropertyTypes, getPropertyTypeById, createPropertyType, updatePropertyType, deletePropertyType } = require('../controllers/propertyTypeController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getPropertyTypes);
router.get('/:id', getPropertyTypeById);

router.post('/', authenticateToken, authorizeRoles('admin'), createPropertyType);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updatePropertyType);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deletePropertyType);

module.exports = router;
