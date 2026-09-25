import api from './api';

export const reportService = {
  // Lost Reports
  async getLostReports(params = {}) {
    const response = await api.get('/lost-reports', { params });
    return response.data;
  },

  async getLostReportById(id) {
    const response = await api.get(`/lost-reports/${id}`);
    return response.data;
  },

  async createLostReport(formData) {
    const response = await api.post('/lost-reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Found Reports
  async getFoundReports(params = {}) {
    const response = await api.get('/found-reports', { params });
    return response.data;
  },

  async getFoundReportById(id) {
    const response = await api.get(`/found-reports/${id}`);
    return response.data;
  },

  async createFoundReport(formData) {
    const response = await api.post('/found-reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
