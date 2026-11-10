import api from './api';

export default {
  async register(credentials) {
    const res = await api.post('/auth/register', credentials);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  async refreshToken() {
    const res = await api.get('/auth/refresh-token');
    return res.data;
  }
};
