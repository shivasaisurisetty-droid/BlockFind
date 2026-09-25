import api from './api';

export const chatService = {
  getMyConversations: async () => {
    const res = await api.get('/chat/conversations');
    return res.data;
  },

  getOrCreateConversation: async (data) => {
    const res = await api.post('/chat/conversations', data);
    return res.data;
  },

  getConversationById: async (id) => {
    const res = await api.get(`/chat/conversations/${id}`);
    return res.data;
  },

  sendMessage: async (id, formData) => {
    const res = await api.post(`/chat/conversations/${id}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  requestVerification: async (id, data) => {
    const res = await api.post(`/chat/conversations/${id}/request-verification`, data);
    return res.data;
  },

  submitVerificationProof: async (id, data) => {
    const res = await api.post(`/chat/conversations/${id}/submit-verification`, data);
    return res.data;
  },

  verifyOwner: async (id) => {
    const res = await api.put(`/chat/conversations/${id}/verify-owner`);
    return res.data;
  },

  markAsReturned: async (id) => {
    const res = await api.put(`/chat/conversations/${id}/mark-returned`);
    return res.data;
  },

  confirmReturn: async (id) => {
    const res = await api.put(`/chat/conversations/${id}/confirm-return`);
    return res.data;
  },

  reportDispute: async (id, data) => {
    const res = await api.put(`/chat/conversations/${id}/dispute`, data);
    return res.data;
  },

  getDisputes: async () => {
    const res = await api.get('/chat/disputes');
    return res.data;
  }
};
