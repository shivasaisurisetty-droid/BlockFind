import api from './api';

export const claimService = {
  async getClaims(params = {}) {
    const response = await api.get('/claims', { params });
    return response.data;
  },

  async getClaimById(id) {
    const response = await api.get(`/claims/${id}`);
    return response.data;
  },

  async createClaim(formData) {
    const response = await api.post('/claims', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async approveClaim(id, verificationRemarks) {
    const response = await api.put(`/claims/${id}/approve`, { verificationRemarks });
    return response.data;
  },

  async rejectClaim(id, rejectionReason) {
    const response = await api.put(`/claims/${id}/reject`, { rejectionReason });
    return response.data;
  }
};
