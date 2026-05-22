import { create } from 'zustand';
import { api } from './api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  ready: false,

  async init() {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ ready: true });
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, token, ready: true });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, ready: true });
    }
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token });
  },

  async register(email, password, name) {
    const { data } = await api.post('/auth/register', { email, password, name });
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token });
  },

  logout() {
    localStorage.removeItem('token');
    set({ user: null, token: null });
    window.location.reload();
  },
}));
