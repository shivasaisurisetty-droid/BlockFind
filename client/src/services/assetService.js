import api from './api';

export const assetService = {
  async getAssets(params = {}) {
    const response = await api.get('/assets', { params });
    return response.data;
  },

  async getMyAssets() {
    const response = await api.get('/assets/my');
    return response.data;
  },

  async getAssetById(id) {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  async createAsset(formData) {
    const response = await api.post('/assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async updateAsset(id, formData) {
    const response = await api.put(`/assets/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
