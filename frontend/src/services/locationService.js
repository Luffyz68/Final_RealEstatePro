import api from './api';

export default {
  async getLocations() {
    const res = await api.get('/locations');
    return res.data;
  },

  async createLocation(data) {
    const res = await api.post('/locations', data);
    return res.data;
  },

  async updateLocation(id, data) {
    const res = await api.put(`/locations/${id}`, data);
    return res.data;
  },

  async deleteLocation(id) {
    const res = await api.delete(`/locations/${id}`);
    return res.data;
  }
};
