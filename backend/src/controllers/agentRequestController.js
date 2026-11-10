const { get, query, run } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

const submitAgentRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    if (req.user.role !== 'customer') {
      return sendError(res, 'Only customers can apply to be agents', 400);
    }

    const existingRequest = await get('SELECT * FROM agent_requests WHERE user_id = ? AND status = ?', [userId, 'pending']);
    if (existingRequest) {
      return sendError(res, 'You already have a pending agent request', 400);
    }

    await run('INSERT INTO agent_requests (user_id, status) VALUES (?, ?)', [userId, 'pending']);
    return sendSuccess(res, 'Agent request submitted successfully', { status: 'pending' }, 201);
  } catch (error) {
    next(error);
  }
};

const getAgentRequests = async (req, res, next) => {
  try {
    const requests = await query(`
      SELECT ar.*, u.full_name, u.email 
      FROM agent_requests ar 
      JOIN users u ON ar.user_id = u.id 
      ORDER BY ar.created_at DESC
    `);
    return sendSuccess(res, 'Agent requests retrieved', requests);
  } catch (error) {
    next(error);
  }
};

const updateAgentRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return sendError(res, 'Invalid status', 400);
    }

    const request = await get('SELECT * FROM agent_requests WHERE id = ?', [id]);
    if (!request) {
      return sendError(res, 'Request not found', 404);
    }

    if (request.status !== 'pending') {
      return sendError(res, 'Request has already been processed', 400);
    }

    // Update the agent request status
    await run('UPDATE agent_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

    if (status === 'approved') {
      // Update the user's role to agent
      const result = await run('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['agent', request.user_id]);
      
      // Verify the role was actually updated
      const updatedUser = await get('SELECT id, full_name, email, role FROM users WHERE id = ?', [request.user_id]);
      if (!updatedUser || updatedUser.role !== 'agent') {
        // Rollback the request status if user update failed
        await run('UPDATE agent_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['pending', id]);
        return sendError(res, 'Failed to update user role. Please try again.', 500);
      }

      return sendSuccess(res, `Agent request approved. ${updatedUser.full_name} is now an agent.`, { 
        id, 
        status, 
        user: updatedUser 
      });
    }

    return sendSuccess(res, `Agent request ${status}`, { id, status });
  } catch (error) {
    next(error);
  }
};

const getMyAgentRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const request = await get('SELECT * FROM agent_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
    return sendSuccess(res, 'My agent request retrieved', request || null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAgentRequest,
  getAgentRequests,
  updateAgentRequest,
  getMyAgentRequest
};
