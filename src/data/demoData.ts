export const demoNetworkData = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  level: 1,
  joinDate: '2024-01-01',
  status: 'active',
  directReferrals: 3,
  totalTeamSize: 8,
  totalSales: 25000,
  children: [
    {
      id: '2',
      name: 'Alice Smith',
      email: 'alice@example.com',
      level: 2,
      joinDate: '2024-01-15',
      status: 'active',
      directReferrals: 2,
      totalTeamSize: 3,
      totalSales: 15000,
      children: []
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      level: 2,
      joinDate: '2024-01-20',
      status: 'active',
      directReferrals: 1,
      totalTeamSize: 2,
      totalSales: 10000,
      children: []
    }
  ]
};

export const demoRankData = {
  currentRank: 'silver',
  nextRank: 'gold',
  progress: 65,
  requirements: {
    personalPV: 200,
    groupPV: 5000,
    directReferrals: 4
  },
  currentStats: {
    personalPV: 150,
    groupPV: 3500,
    directReferrals: 3
  },
  rewards: [
    {
      rank: 'bronze',
      benefits: ['Basic Commission', 'Level 1-3 Earnings'],
      achieved: true
    },
    {
      rank: 'silver',
      benefits: ['Higher Commission', 'Level 1-5 Earnings', 'Matching Bonus'],
      achieved: true
    },
    {
      rank: 'gold',
      benefits: ['Premium Commission', 'Level 1-7 Earnings', 'Leadership Bonus'],
      achieved: false
    }
  ]
}; 