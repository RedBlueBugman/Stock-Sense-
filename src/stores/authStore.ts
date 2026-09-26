import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (userUpdate: Partial<User>) => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Nithin (Admin)',
        email: 'admin@stocksense.local',
        role: 'ADMIN',
        isActive: true,
      },
      token: 'demo_token_admin',
      refreshToken: 'demo_refresh_token',
      isAuthenticated: true,

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true }),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-store');
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      updateUser: (userUpdate) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdate } : null,
        })),

      hasPermission: (requiredRoles: UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        return requiredRoles.includes(user.role);
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
