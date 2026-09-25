import api from './api';
import { mockDataStore } from './mockDataStore';

export const authService = {
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data?.token) {
        localStorage.setItem('blockfind_token', response.data.token);
        localStorage.setItem('blockfind_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (err) {
      console.warn('Backend API unavailable. Using browser mock database fallback:', err.message);
      const res = mockDataStore.register(userData);
      localStorage.setItem('blockfind_token', res.token);
      localStorage.setItem('blockfind_user', JSON.stringify(res.user));
      return res;
    }
  },

  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.token) {
        localStorage.setItem('blockfind_token', response.data.token);
        localStorage.setItem('blockfind_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (err) {
      console.warn('Backend API unavailable. Using browser mock database fallback:', err.message);
      const res = mockDataStore.login(email, password);
      localStorage.setItem('blockfind_token', res.token);
      localStorage.setItem('blockfind_user', JSON.stringify(res.user));
      return res;
    }
  },

  async getMe() {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (err) {
      return this.getCurrentUser();
    }
  },

  logout() {
    localStorage.removeItem('blockfind_token');
    localStorage.removeItem('blockfind_user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('blockfind_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('blockfind_token');
  }
};
