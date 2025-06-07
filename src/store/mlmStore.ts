import { create } from 'zustand';
import { MLMNode, Commission } from '../types';

interface MLMState {
  networkStructure: MLMNode | null;
  commissions: Commission[];
  rankProgress: {
    currentRank: string;
    nextRank: string;
    progress: number;
    requiredPV: number;
    currentPV: number;
  };
  isLoading: boolean;
  fetchNetworkStructure: () => Promise<void>;
  fetchCommissions: () => Promise<void>;
}

// Mock data for demonstration
const mockNetworkData: MLMNode = {
  userId: '1',
  username: 'John Doe',
  level: 0,
  personalPV: 500,
  groupPV: 5000,
  rank: 'gold',
  children: [
    {
      userId: '2',
      username: 'Alice Smith',
      level: 1,
      position: 'left',
      personalPV: 300,
      groupPV: 2000,
      rank: 'silver',
      children: [
        {
          userId: '4',
          username: 'Emily Brown',
          level: 2,
          position: 'left',
          personalPV: 150,
          groupPV: 150,
          rank: 'bronze',
          children: []
        },
        {
          userId: '5',
          username: 'Michael Wilson',
          level: 2,
          position: 'right',
          personalPV: 200,
          groupPV: 200,
          rank: 'bronze',
          children: []
        }
      ]
    },
    {
      userId: '3',
      username: 'Bob Johnson',
      level: 1,
      position: 'right',
      personalPV: 400,
      groupPV: 1200,
      rank: 'silver',
      children: [
        {
          userId: '6',
          username: 'Sarah Davis',
          level: 2,
          position: 'left',
          personalPV: 250,
          groupPV: 800,
          rank: 'bronze',
          children: []
        }
      ]
    }
  ]
};

const mockCommissions: Commission[] = [
  {
    id: 'c1',
    userId: '1',
    fromUserId: '4',
    orderId: 'o123',
    amount: 250,
    type: 'level',
    level: 2,
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: 'c2',
    userId: '1',
    fromUserId: '2',
    orderId: 'o124',
    amount: 500,
    type: 'direct',
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'c3',
    userId: '1',
    fromUserId: '3',
    orderId: 'o125',
    amount: 350,
    type: 'matching',
    status: 'pending',
    createdAt: new Date()
  }
];

export const useMLMStore = create<MLMState>((set) => ({
  networkStructure: null,
  commissions: [],
  rankProgress: {
    currentRank: 'gold',
    nextRank: 'platinum',
    progress: 65,
    requiredPV: 10000,
    currentPV: 6500
  },
  isLoading: false,
  
  fetchNetworkStructure: async () => {
    set({ isLoading: true });
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ 
      networkStructure: mockNetworkData,
      isLoading: false
    });
  },
  
  fetchCommissions: async () => {
    set({ isLoading: true });
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ 
      commissions: mockCommissions,
      isLoading: false
    });
  }
}));