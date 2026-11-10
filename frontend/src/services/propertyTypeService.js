import api from './api';

export default {
  async getPropertyTypes() {
    const res = await api.get('/property-types');
    return res.data;
  },

  async createPropertyType(data) {
    const res = await api.post('/property-types', data);
    return res.data;
  },

  async updatePropertyType(id, data) {
    const res = await api.put(`/property-types/${id}`, data);
    return res.data;
  },

  async deletePropertyType(id) {
    const res = await api.delete(`/property-types/${id}`);
    return res.data;
  }
};
