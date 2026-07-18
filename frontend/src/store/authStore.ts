import { create } from 'zustand';
import { authAPI } from '../api';

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  institution: string;
  department: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  login: async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('token', res.data.access_token);
    set({ user: res.data.user, token: res.data.access_token });
  },
  register: async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('token', res.data.access_token);
    set({ user: res.data.user, token: res.data.access_token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  fetchUser: async () => {
    try {
      const res = await authAPI.me();
      set({ user: res.data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
