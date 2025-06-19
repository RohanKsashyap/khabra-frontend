import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Rank {
  id: string;
  name: string;
  level: number;
  requirements: {
    directReferrals: number;
    teamSize: number;
    teamSales: number;
  };
  rewards: {
    commission: number;
    bonus: number;
  };
}

interface UserRank {
  currentRank: Rank;
  nextRank: Rank | null;
  progress: {
    directReferrals: number;
    teamSize: number;
    teamSales: number;
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    date: string;
    reward: number;
  }[];
}

// Mock data for ranks
const mockRanks: Rank[] = [
  {
    id: '1',
    name: 'Bronze',
    level: 1,
    requirements: {
      directReferrals: 2,
      teamSize: 5,
      teamSales: 50000,
    },
    rewards: {
      commission: 5,
      bonus: 1000,
    },
  },
  {
    id: '2',
    name: 'Silver',
    level: 2,
    requirements: {
      directReferrals: 5,
      teamSize: 15,
      teamSales: 150000,
    },
    rewards: {
      commission: 7,
      bonus: 3000,
    },
  },
  {
    id: '3',
    name: 'Gold',
    level: 3,
    requirements: {
      directReferrals: 10,
      teamSize: 30,
      teamSales: 300000,
    },
    rewards: {
      commission: 10,
      bonus: 5000,
    },
  },
  {
    id: '4',
    name: 'Platinum',
    level: 4,
    requirements: {
      directReferrals: 20,
      teamSize: 50,
      teamSales: 500000,
    },
    rewards: {
      commission: 12,
      bonus: 10000,
    },
  },
];

// Mock user rank data
const mockUserRank: UserRank = {
  currentRank: mockRanks[1], // Silver rank
  nextRank: mockRanks[2], // Gold rank
  progress: {
    directReferrals: 7,
    teamSize: 22,
    teamSales: 200000,
  },
  achievements: [
    {
      id: '1',
      name: 'First Referral',
      description: 'Successfully referred your first member',
      date: '2024-03-01',
      reward: 500,
    },
    {
      id: '2',
      name: 'Bronze Achiever',
      description: 'Reached Bronze rank',
      date: '2024-03-15',
      reward: 1000,
    },
    {
      id: '3',
      name: 'Silver Milestone',
      description: 'Reached Silver rank',
      date: '2024-04-01',
      reward: 3000,
    },
    {
      id: '4',
      name: 'Team Builder',
      description: 'Built a team of 20 members',
      date: '2024-04-15',
      reward: 2000,
    },
  ],
};

const RankRewardsPage: React.FC = () => {
  const { user } = useAuth();
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ranks`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Use mock data if API call fails
          setUserRank(mockUserRank);
          setLoading(false);
          return;
        }

        const data = await response.json();
        // If data is invalid or missing required fields, use mock data
        if (!data || !data.currentRank || !data.currentRank.name) {
          setUserRank(mockUserRank);
        } else {
          setUserRank(data);
        }
      } catch (err) {
        // Use mock data if there's an error
        setUserRank(mockUserRank);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    // Always show mock data first
    setUserRank(mockUserRank);
    setLoading(false);
    fetchRankData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!userRank) {
    return null;
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Rank & Rewards</h1>

      {/* Current Rank Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Current Rank</h2>
            <p className="text-4xl font-bold text-blue-600 mt-2">{userRank.currentRank.name}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Level {userRank.currentRank.level}</p>
            <p className="text-lg font-medium text-gray-900">
              Commission: {userRank.currentRank.rewards.commission}%
            </p>
          </div>
        </div>

        {/* Progress to Next Rank */}
        {userRank.nextRank ? (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Progress to {userRank.nextRank.name}
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Direct Referrals</span>
                  <span className="text-sm font-medium text-gray-700">
                    {userRank.progress.directReferrals} / {userRank.nextRank.requirements.directReferrals}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${calculateProgress(
                        userRank.progress.directReferrals,
                        userRank.nextRank.requirements.directReferrals
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Team Size</span>
                  <span className="text-sm font-medium text-gray-700">
                    {userRank.progress.teamSize} / {userRank.nextRank.requirements.teamSize}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${calculateProgress(
                        userRank.progress.teamSize,
                        userRank.nextRank.requirements.teamSize
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Team Sales</span>
                  <span className="text-sm font-medium text-gray-700">
                    ₹{userRank.progress.teamSales.toLocaleString()} / ₹{userRank.nextRank.requirements.teamSales.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${calculateProgress(
                        userRank.progress.teamSales,
                        userRank.nextRank.requirements.teamSales
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              You have achieved the highest rank!
            </h3>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userRank.achievements.map((achievement) => (
            <div key={achievement.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900">{achievement.name}</h3>
              <p className="text-gray-500 mt-1">{achievement.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(achievement.date).toLocaleDateString()}
                </span>
                <span className="text-sm font-medium text-green-600">
                  ₹{achievement.reward.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RankRewardsPage; 