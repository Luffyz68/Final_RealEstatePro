import { defineStore } from 'pinia';
import authService from '@/services/authService';

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: readStoredUser(),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isAgent: (state) => state.user?.role === 'agent',
    isCustomer: (state) => state.user?.role === 'customer',
    currentUser: (state) => state.user
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const res = await authService.login(credentials);
        if (res.success && res.data) {
          this.token = res.data.token;
          this.user = res.data.user;
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          return res;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const res = await authService.register(credentials);
        if (res.success && res.data) {
          this.token = res.data.token;
          this.user = res.data.user;
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          return res;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      if (!this.token) return;
      try {
        const res = await authService.getProfile();
        if (res.success && res.data) {
          this.user = res.data;
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    },

    async updateProfile(data) {
      this.loading = true;
      try {
        const res = await authService.updateProfile(data);
        if (res.success && res.data) {
          this.user = res.data;
          localStorage.setItem('user', JSON.stringify(res.data));
          return res;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Profile update failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async refreshSession() {
      try {
        const res = await authService.refreshToken();
        if (res.success && res.data) {
          this.token = res.data.token;
          this.user = res.data.user;
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          return res;
        }
      } catch (err) {
        console.error('Failed to refresh session:', err);
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
