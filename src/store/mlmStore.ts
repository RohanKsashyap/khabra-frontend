import { create } from 'zustand';
import { mlmAPI } from '../services/api';

interface MLMState {
  networkTree: any;
  earnings: any[];
  stats: Record<string, number>;
  withdrawals: any[];
  isLoading: boolean;
  error: string | null;
  fetchNetworkTree: () => Promise<void>;
  fetchEarnings: () => Promise<void>;
  fetchWithdrawals: () => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<boolean>;
}

export const useMLMStore = create<MLMState>((set) => ({
  networkTree: null,
  earnings: [],
  stats: {},
  withdrawals: [],
  isLoading: false,
  error: null,

  fetchNetworkTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await mlmAPI.getNetworkTree();
      set({ networkTree: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch network tree', isLoading: false });
    }
  },

  fetchEarnings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await mlmAPI.getUserEarnings();
      set({ earnings: data.earnings, stats: data.stats, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch earnings', isLoading: false });
    }
  },

  fetchWithdrawals: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await mlmAPI.getMyWithdrawals();
      set({ withdrawals: data.requests, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch withdrawals', isLoading: false });
    }
  },

  requestWithdrawal: async (amount: number) => {
    set({ isLoading: true, error: null });
    try {
      await mlmAPI.requestWithdrawal(amount);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message || 'Failed to request withdrawal', isLoading: false });
      return false;
    }
  },
}));