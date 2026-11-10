const express = require('express');
const router = express.Router();
const { submitAgentRequest, getAgentRequests, updateAgentRequest, getMyAgentRequest } = require('../controllers/agentRequestController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// Customer endpoints
router.post('/', authorizeRoles('customer'), submitAgentRequest);
router.get('/my-request', authorizeRoles('customer', 'agent'), getMyAgentRequest);

// Admin endpoints
router.get('/', authorizeRoles('admin'), getAgentRequests);
router.put('/:id', authorizeRoles('admin'), updateAgentRequest);

module.exports = router;
