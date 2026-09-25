import api from './api';
import { mockDataStore } from './mockDataStore';
import { authService } from './authService';

export const claimService = {
  async getClaims(params = {}) {
    try {
      const response = await api.get('/claims', { params });
      return response.data;
    } catch {
      return mockDataStore.getClaims(params);
    }
  },

  async getClaimById(id) {
    try {
      const response = await api.get(`/claims/${id}`);
      return response.data;
    } catch {
      return mockDataStore.getClaimById(id);
    }
  },

  async createClaim(formData) {
    try {
      const response = await api.post('/claims', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch {
      const user = authService.getCurrentUser();
      let data = {};
      if (formData instanceof FormData) {
        formData.forEach((value, key) => { data[key] = value; });
      } else {
        data = formData;
      }
      return mockDataStore.createClaim(data, user);
    }
  },

  async approveClaim(id, verificationRemarks) {
    try {
      const response = await api.put(`/claims/${id}/approve`, { verificationRemarks });
      return response.data;
    } catch {
      return mockDataStore.approveClaim(id, verificationRemarks);
    }
  },

  async rejectClaim(id, rejectionReason) {
    try {
      const response = await api.put(`/claims/${id}/reject`, { rejectionReason });
      return response.data;
    } catch {
      return mockDataStore.rejectClaim(id, rejectionReason);
    }
  }
};

