import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('blockfind_token', response.data.token);
      localStorage.setItem('blockfind_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('blockfind_token', response.data.token);
      localStorage.setItem('blockfind_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.user;
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
