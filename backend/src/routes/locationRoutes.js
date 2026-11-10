const express = require('express');
const router = express.Router();
const { getLocations, getLocationById, createLocation, updateLocation, deleteLocation } = require('../controllers/locationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getLocations);
router.get('/:id', getLocationById);

router.post('/', authenticateToken, authorizeRoles('admin'), createLocation);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateLocation);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteLocation);

module.exports = router;
