import api from './api';

export default {
  async getDashboardStats() {
    const res = await api.get('/dashboard/stats');
    return res.data;
  }
};
