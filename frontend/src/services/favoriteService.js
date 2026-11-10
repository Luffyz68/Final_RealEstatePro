import api from './api';

export default {
  async getFavorites() {
    const res = await api.get('/favorites');
    return res.data;
  },

  async addFavorite(property_id) {
    const res = await api.post('/favorites', { property_id });
    return res.data;
  },

  async removeFavorite(propertyId) {
    const res = await api.delete(`/favorites/${propertyId}`);
    return res.data;
  }
};
