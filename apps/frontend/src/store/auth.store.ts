import { create } from 'zustand';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RECRUITER' | 'HIRING_MANAGER';
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, accessToken });
  },

  clearAuth: () => {
    localStorage.clear();
    set({ user: null, accessToken: null });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (raw && token) {
      try { set({ user: JSON.parse(raw), accessToken: token }); } catch { /* ignore */ }
    }
  },
}));
