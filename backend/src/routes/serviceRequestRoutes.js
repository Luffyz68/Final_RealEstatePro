const express = require('express');
const router = express.Router();
const { getServiceRequests, getServiceRequestById, createServiceRequest, updateServiceRequest, deleteServiceRequest } = require('../controllers/serviceRequestController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getServiceRequests);
router.get('/:id', getServiceRequestById);
router.post('/', createServiceRequest);
router.put('/:id', updateServiceRequest);
router.delete('/:id', deleteServiceRequest);

module.exports = router;
