import api from './api';

export default {
  async getServiceRequests() {
    const res = await api.get('/service-requests');
    return res.data;
  },

  async createServiceRequest(data) {
    const res = await api.post('/service-requests', data);
    return res.data;
  },

  async updateServiceRequest(id, data) {
    const res = await api.put(`/service-requests/${id}`, data);
    return res.data;
  },

  async deleteServiceRequest(id) {
    const res = await api.delete(`/service-requests/${id}`);
    return res.data;
  }
};
