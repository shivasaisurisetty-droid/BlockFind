import api from './api';
import { mockDataStore } from './mockDataStore';
import { authService } from './authService';

export const assetService = {
  async getAssets(params = {}) {
    try {
      const response = await api.get('/assets', { params });
      return response.data;
    } catch {
      return mockDataStore.getAssets(params);
    }
  },

  async getMyAssets() {
    try {
      const response = await api.get('/assets/my');
      return response.data;
    } catch {
      const user = authService.getCurrentUser();
      return mockDataStore.getMyAssets(user?.id);
    }
  },

  async getAssetById(id) {
    try {
      const response = await api.get(`/assets/${id}`);
      return response.data;
    } catch {
      return mockDataStore.getAssetById(id);
    }
  },

  async createAsset(formData) {
    try {
      const response = await api.post('/assets', formData, {
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
      return mockDataStore.createAsset(data, user);
    }
  },

  async updateAsset(id, formData) {
    try {
      const response = await api.put(`/assets/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch {
      return { success: true, message: 'Asset updated' };
    }
  }
};

