import api from './api';

export const blockchainService = {
  async getStats() {
    const response = await api.get('/blockchain/stats');
    return response.data;
  },

  async getBlocks(params = {}) {
    const response = await api.get('/blockchain/blocks', { params });
    return response.data;
  },

  async getAssetBlockchain(assetId) {
    const response = await api.get(`/blockchain/asset/${assetId}`);
    return response.data;
  },

  async verifyHash(txHash) {
    const response = await api.post('/blockchain/verify-hash', { txHash });
    return response.data;
  }
};
