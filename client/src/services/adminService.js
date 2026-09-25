import api from './api';

export const adminService = {
  async getStatistics() {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateUserRole(id, role) {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  async getAuditLogs(params = {}) {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  }
};
