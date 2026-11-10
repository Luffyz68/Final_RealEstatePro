import api from './api';

export default {
  async getProperties(params = {}) {
    const res = await api.get('/properties', { params });
    return res.data;
  },

  async getProperty(id) {
    const res = await api.get(`/properties/${id}`);
    return res.data;
  },

  async createProperty(data) {
    const res = await api.post('/properties', data);
    return res.data;
  },

  async updateProperty(id, data) {
    const res = await api.put(`/properties/${id}`, data);
    return res.data;
  },

  async deleteProperty(id) {
    const res = await api.delete(`/properties/${id}`);
    return res.data;
  },

  async uploadImages(propertyId, formData) {
    const res = await api.post(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  async deleteImage(imageId) {
    const res = await api.delete(`/properties/images/${imageId}`);
    return res.data;
  },

  async approveProperty(id, approval_status) {
    const res = await api.put(`/properties/${id}/approve`, { approval_status });
    return res.data;
  }
};
