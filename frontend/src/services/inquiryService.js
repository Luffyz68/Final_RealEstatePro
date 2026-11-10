import api from './api';

export default {
  async getInquiries() {
    const res = await api.get('/inquiries');
    return res.data;
  },

  async createInquiry(data) {
    const res = await api.post('/inquiries', data);
    return res.data;
  },

  async updateInquiryStatus(id, status) {
    const res = await api.put(`/inquiries/${id}/status`, { status });
    return res.data;
  },

  async replyToInquiry(id, replyMessage) {
    const res = await api.put(`/inquiries/${id}/reply`, { replyMessage });
    return res.data;
  },

  async deleteInquiry(id) {
    const res = await api.delete(`/inquiries/${id}`);
    return res.data;
  }
};
