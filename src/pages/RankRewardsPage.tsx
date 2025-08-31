import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rankAPI } from '../services/api';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Award, 
  Zap,
  Crown,
  Gift,
  CheckCircle,
  ArrowUpRight,
  Calendar,
  XCircle
} from 'lucide-react';

interface Rank {
  _id: string;
  name: string;
  level: number;
  requirements: {
    directReferrals: number;
    teamSize: number;
    teamSales: number;
    personalPV: number;
    teamPV: number;
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
    personalPV: number;
    teamPV: number;
  };
  achievements: {
    _id: string;
    name: string;
    description: string;
    date: string;
    reward: number;
  }[];
}

const RankRewardsPage: React.FC = () => {
  const { user } = useAuth();
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data } = await rankAPI.getMyRankStatus();
        setUserRank(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch rank data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRankData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your rank information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userRank) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rank Data</h3>
          <p className="text-gray-600">Rank information not available.</p>
        </div>
      </div>
    );
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getRankColor = (level: number) => {
    const colors = {
      1: 'from-blue-500 to-blue-600',
      2: 'from-green-500 to-green-600',
      3: 'from-purple-500 to-purple-600',
      4: 'from-orange-500 to-orange-600',
      5: 'from-red-500 to-red-600',
      6: 'from-indigo-500 to-indigo-600',
      7: 'from-pink-500 to-pink-600',
      8: 'from-yellow-500 to-yellow-600',
      9: 'from-teal-500 to-teal-600',
      10: 'from-rose-500 to-rose-600'
    };
    return colors[level as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-blue-500 to-blue-600';
    if (percentage >= 40) return 'from-yellow-500 to-orange-600';
    if (percentage >= 20) return 'from-orange-500 to-red-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Rank & Rewards</h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Track your progress, unlock achievements, and climb the ranks to maximize your earnings
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Rank & Progress */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
      {/* Current Rank Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className={`bg-gradient-to-r ${getRankColor(userRank.currentRank.level)} p-8 text-white`}>
                <div className="flex items-center justify-between">
          <div>
                    <h2 className="text-2xl font-bold mb-2">Current Rank</h2>
                    <p className="text-5xl font-bold mb-2">{userRank.currentRank.name}</p>
                    <p className="text-xl opacity-90">Level {userRank.currentRank.level}</p>
          </div>
          <div className="text-right">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                      <Crown className="h-10 w-10" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-600">Commission Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{userRank.currentRank.rewards.commission}%</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-600">Bonus Rate</p>
                    <p className="text-2xl font-bold text-green-600">{userRank.currentRank.rewards.bonus}%</p>
          </div>
        </div>

        {/* Progress to Next Rank */}
        {userRank.nextRank ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
              Progress to {userRank.nextRank.name}
            </h3>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        <span className="text-sm text-accent font-medium">Next Level</span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {[
                        {
                          label: 'Direct Referrals',
                          current: userRank.progress.directReferrals,
                          target: userRank.nextRank.requirements.directReferrals,
                          icon: Users,
                          color: 'blue'
                        },
                        {
                          label: 'Team Size',
                          current: userRank.progress.teamSize,
                          target: userRank.nextRank.requirements.teamSize,
                          icon: Users,
                          color: 'green'
                        },
                        {
                          label: 'Team Sales',
                          current: userRank.progress.teamSales,
                          target: userRank.nextRank.requirements.teamSales,
                          icon: DollarSign,
                          color: 'purple'
                        },
                        {
                          label: 'Personal PV',
                          current: userRank.progress.personalPV || 0,
                          target: userRank.nextRank.requirements.personalPV || 0,
                          icon: Target,
                          color: 'orange'
                        },
                        {
                          label: 'Team PV',
                          current: userRank.progress.teamPV || 0,
                          target: userRank.nextRank.requirements.teamPV || 0,
                          icon: TrendingUp,
                          color: 'indigo'
                        }
                      ].map((item, index) => {
                        const percentage = calculateProgress(item.current, item.target);
                        const IconComponent = item.icon;
                        
                        return (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                                  <IconComponent className={`h-4 w-4 text-${item.color}-600`} />
                                </div>
                                <span className="font-medium text-gray-700">{item.label}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.label.includes('Sales') || item.label.includes('PV') 
                                    ? `₹${item.current.toLocaleString()} / ₹${item.target.toLocaleString()}`
                                    : `${item.current} / ${item.target}`
                                  }
                  </span>
                                <div className="text-xs text-gray-500">
                                  {percentage.toFixed(1)}% Complete
                                </div>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <motion.div
                                  className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(percentage)}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                                />
                              </div>
                              {percentage >= 100 && (
                                <div className="absolute -top-1 -right-1">
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                              )}
                </div>
                          </motion.div>
                        );
                      })}
                </div>
              </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      🎉 Congratulations! 🎉
                    </h3>
                    <p className="text-gray-600">
                      You have achieved the highest rank! You're at the top of the pyramid.
                    </p>
                </div>
                )}
                </div>
              </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
              <div>
                    <p className="text-sm text-gray-600">Total Team</p>
                    <p className="text-2xl font-bold text-gray-900">{userRank.progress.teamSize}</p>
                </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
              <div>
                    <p className="text-sm text-gray-600">Direct Referrals</p>
                    <p className="text-2xl font-bold text-gray-900">{userRank.progress.directReferrals}</p>
                </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-green-600" />
                </div>
              </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center justify-between">
              <div>
                    <p className="text-sm text-gray-600">Team Sales</p>
                    <p className="text-2xl font-bold text-gray-900">₹{userRank.progress.teamSales.toLocaleString()}</p>
                </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Next Rank Preview */}
            {userRank.nextRank && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowUpRight className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Next Rank</h3>
                  <p className="text-3xl font-bold text-accent">{userRank.nextRank.name}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-accent/10 rounded-xl">
                    <p className="text-sm text-gray-600">Commission Rate</p>
                    <p className="text-2xl font-bold text-accent">{userRank.nextRank.rewards.commission}%</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-100 rounded-xl">
                    <p className="text-sm text-gray-600">Bonus Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{userRank.nextRank.rewards.bonus}%</p>
            </div>
          </div>
          </div>
        )}

            {/* Motivation Card */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Stay Motivated!</h3>
                <p className="text-sm opacity-90">
                  Every referral brings you closer to the next rank. Keep building your network!
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Achievements & Milestones</h2>
                  <p className="text-gray-100">Celebrate your success and track your journey</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="h-8 w-8" />
                </div>
              </div>
      </div>

            <div className="p-8">
              {userRank.achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userRank.achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-accent to-purple-600 rounded-lg flex items-center justify-center">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ₹{achievement.reward.toFixed(2)}
                </span>
              </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                        {achievement.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {achievement.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(achievement.date).toLocaleDateString()}</span>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
                    </motion.div>
          ))}
        </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start building your network and completing milestones to earn achievements!
                  </p>
                  <div className="inline-flex items-center space-x-2 text-accent font-medium">
                    <Target className="h-5 w-5" />
                    <span>Set your first goal today</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RankRewardsPage; 