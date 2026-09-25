import api from './api';
import { mockDataStore } from './mockDataStore';
import { authService } from './authService';

export const reportService = {
  // Lost Reports
  async getLostReports(params = {}) {
    try {
      const response = await api.get('/lost-reports', { params });
      return response.data;
    } catch {
      return mockDataStore.getLostReports(params);
    }
  },

  async getLostReportById(id) {
    try {
      const response = await api.get(`/lost-reports/${id}`);
      return response.data;
    } catch {
      return mockDataStore.getLostReportById(id);
    }
  },

  async createLostReport(formData) {
    try {
      const response = await api.post('/lost-reports', formData, {
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
      return mockDataStore.createLostReport(data, user);
    }
  },

  // Found Reports
  async getFoundReports(params = {}) {
    try {
      const response = await api.get('/found-reports', { params });
      return response.data;
    } catch {
      return mockDataStore.getFoundReports(params);
    }
  },

  async getFoundReportById(id) {
    try {
      const response = await api.get(`/found-reports/${id}`);
      return response.data;
    } catch {
      return mockDataStore.getFoundReportById(id);
    }
  },

  async createFoundReport(formData) {
    try {
      const response = await api.post('/found-reports', formData, {
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
      return mockDataStore.createFoundReport(data, user);
    }
  }
};

