import api from './api';
import { mockDataStore } from './mockDataStore';

export const adminService = {
  async getStatistics() {
    try {
      const response = await api.get('/admin/statistics');
      return response.data;
    } catch {
      return mockDataStore.getAdminStats();
    }
  },

  async getUsers(params = {}) {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch {
      return mockDataStore.getUsers();
    }
  },

  async updateUserRole(id, role) {
    try {
      const response = await api.put(`/admin/users/${id}/role`, { role });
      return response.data;
    } catch {
      return mockDataStore.updateUserRole(id, role);
    }
  },

  async getAuditLogs(params = {}) {
    try {
      const response = await api.get('/audit-logs', { params });
      return response.data;
    } catch {
      return mockDataStore.getAuditLogs();
    }
  }
};

