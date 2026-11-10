import api from './api';

export default {
  async getAgentRequests() {
    const res = await api.get('/agent-requests');
    return res.data;
  },

  async getMyAgentRequest() {
    const res = await api.get('/agent-requests/my-request');
    return res.data;
  },

  async submitAgentRequest() {
    const res = await api.post('/agent-requests');
    return res.data;
  },

  async updateAgentRequest(id, status) {
    const res = await api.put(`/agent-requests/${id}`, { status });
    return res.data;
  }
};
