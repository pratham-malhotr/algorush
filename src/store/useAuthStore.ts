import { create } from 'zustand';

export type PlanType = 'Free' | 'Pro' | 'Enterprise';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    plan: PlanType;
  } | null;
  login: (email: string) => void;
  logout: () => void;
  setPlan: (plan: PlanType) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true, // Mocked as logged in for MVP
  user: {
    id: 'user_123',
    email: 'trader@algotext.ai',
    name: 'Demo User',
    plan: 'Free',
  },
  login: (email) => set({ isAuthenticated: true, user: { id: 'mock_id', email, name: 'User', plan: 'Free' } }),
  logout: () => set({ isAuthenticated: false, user: null }),
  setPlan: (plan) => set((state) => ({ user: state.user ? { ...state.user, plan } : null })),
}));
