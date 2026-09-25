import api from './api';
import { mockDataStore } from './mockDataStore';

export const blockchainService = {
  async getStats() {
    try {
      const response = await api.get('/blockchain/stats');
      return response.data;
    } catch {
      return mockDataStore.getBlockchainStats();
    }
  },

  async getBlocks(params = {}) {
    try {
      const response = await api.get('/blockchain/blocks', { params });
      return response.data;
    } catch {
      return mockDataStore.getBlocks();
    }
  },

  async getAssetBlockchain(assetId) {
    try {
      const response = await api.get(`/blockchain/asset/${assetId}`);
      return response.data;
    } catch {
      const assetRes = mockDataStore.getAssetById(assetId);
      return { success: true, history: [], asset: assetRes.asset };
    }
  },

  async verifyHash(txHash) {
    try {
      const response = await api.post('/blockchain/verify-hash', { txHash });
      return response.data;
    } catch {
      return mockDataStore.verifyHash(txHash);
    }
  }
};

