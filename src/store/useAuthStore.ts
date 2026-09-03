import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlanType = 'Free' | 'Pro' | 'Enterprise';

export interface UserPaymentReceipt {
  invoiceId: string;
  plan: string;
  amountUSD: number;
  amountBTC: number;
  txHash: string;
  timestamp: number;
  walletAddress: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    plan: PlanType;
    isVipActive?: boolean;
    lastPaymentReceipt?: UserPaymentReceipt | null;
  } | null;
  login: (email: string) => void;
  logout: () => void;
  setPlan: (plan: PlanType) => void;
  recordPayment: (receipt: UserPaymentReceipt) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: true, // Mocked as logged in for MVP
      user: {
        id: 'user_123',
        email: 'trader@algotext.ai',
        name: 'Demo Quant Trader',
        plan: 'Free',
        isVipActive: false,
        lastPaymentReceipt: null,
      },
      login: (email) => set({ 
        isAuthenticated: true, 
        user: { id: 'user_123', email, name: 'Trader', plan: 'Free', isVipActive: false } 
      }),
      logout: () => set({ isAuthenticated: false, user: null }),
      setPlan: (plan) => set((state) => ({ 
        user: state.user ? { ...state.user, plan, isVipActive: plan !== 'Free' } : null 
      })),
      recordPayment: (receipt) => set((state) => ({
        user: state.user ? {
          ...state.user,
          plan: 'Pro',
          isVipActive: true,
          lastPaymentReceipt: receipt
        } : null
      }))
    }),
    {
      name: 'algotext_auth_store',
    }
  )
);
