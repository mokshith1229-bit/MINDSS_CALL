import api from '../utils/api';

// Simple pub/sub store for Auth State
const listeners = new Set();

let authState = {
  isAuthenticated: !!localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  error: null,
  loading: false,
};

const notify = () => listeners.forEach((listener) => listener(authState));

export const authStore = {
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  
  getState: () => authState,

  login: async (email, password) => {
    authState = { ...authState, loading: true, error: null };
    notify();

    try {
      const res = await api.post('/auth/login', { email, password });
      
      const { token, refreshToken } = res.data.data;
      
      // Since our login endpoint doesn't return user profile directly, we might need to fetch /users/me
      // But for now, let's decode the JWT or rely on a subsequent fetch.
      // Wait, let me check backend login endpoint. It returns token and refreshToken.
      // We need to fetch /auth/me or /users/me to get the user details.
      
      localStorage.setItem('token', token);
      
      try {
        const userRes = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = userRes.data.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        
        authState = {
          isAuthenticated: true,
          user,
          token,
          loading: false,
          error: null,
        };
      } catch (e) {
        throw new Error('Failed to fetch user profile');
      }

    } catch (err) {
      authState = {
        ...authState,
        loading: false,
        error: err.response?.data?.error || err.message || 'Invalid credentials',
      };
    }
    notify();
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authState = {
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
    };
    notify();
  },
};
