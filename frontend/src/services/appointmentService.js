import api from './api';

export default {
  async getAppointments() {
    const res = await api.get('/appointments');
    return res.data;
  },

  async createAppointment(data) {
    const res = await api.post('/appointments', data);
    return res.data;
  },

  async updateAppointment(id, data) {
    const res = await api.put(`/appointments/${id}`, data);
    return res.data;
  },

  async deleteAppointment(id) {
    const res = await api.delete(`/appointments/${id}`);
    return res.data;
  }
};
