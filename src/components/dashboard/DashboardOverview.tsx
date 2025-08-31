import  { useMemo } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Users, ShoppingBag, CreditCard, Award, Target, Crown, Star, Gift, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { CommissionCard } from './CommissionCard';
import api from '../../services/api';
import { Skeleton } from '../ui/Skeleton';
import { useApiCache } from '../../hooks/useApiCache';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardData {
  earnings: { total: number; pending: number; paid: number; thisMonth: number };
  orders: { total: number; thisMonth: number };
  team: { total: number; newThisMonth: number };
  personalPV: { total: number; thisMonth: number };
  rank: {
    current: { name: string; benefits: string[] };
    next: { name: string; requirements: { teamSales: number; personalPV?: number; teamPV?: number } };
    progress: { teamSales: number; personalPV?: number; teamPV?: number };
  };
}

export function DashboardOverview() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApiCache<DashboardData>(
    'dashboard-overview',
    async () => {
      const response = await api.get('/api/dashboard/overview');
      return response.data.data;
    },
    { cacheTime: 2 * 60 * 1000 } // Cache for 2 minutes
  );

  // Memoize expensive calculations
  const rankProgressPercentage = useMemo(() => {
    if (!data?.rank?.next?.requirements?.teamSales || !data?.rank?.progress?.teamSales) {
      return 0;
    }
    return (data.rank.progress.teamSales / data.rank.next.requirements.teamSales) * 100;
  }, [data?.rank?.next?.requirements?.teamSales, data?.rank?.progress?.teamSales]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8"
      >
        <div className="text-red-500 mb-4 text-lg">{error || 'No data available.'}</div>
        <button 
          onClick={refetch}
          className="px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl p-8"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Crown className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name.toUpperCase() || 'Member'}!</h1>
            <p className="text-blue-100 text-lg">Here's your business overview and performance metrics</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="h-full hover:shadow-lg transition-all duration-200 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Team</p>
                  <p className="text-3xl font-bold text-gray-900">{data.team.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center space-x-1">
                  {data.team.newThisMonth > 0 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-semibold">+{data.team.newThisMonth}</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-semibold">{data.team.newThisMonth}</span>
                    </>
                  )}
                  <span className="text-gray-500">new this month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="h-full hover:shadow-lg transition-all duration-200 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Personal PV</p>
                  <p className="text-3xl font-bold text-gray-900">{data.personalPV.total.toFixed(2)} PV</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center space-x-1">
                  {data.personalPV.thisMonth > 0 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-semibold">+{data.personalPV.thisMonth.toFixed(2)} PV</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-semibold">{data.personalPV.thisMonth.toFixed(2)} PV</span>
                    </>
                  )}
                  <span className="text-gray-500">this month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="h-full hover:shadow-lg transition-all duration-200 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{data.orders.total}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <ShoppingBag className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center space-x-1">
                  {data.orders.thisMonth > 0 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-semibold">+{data.orders.thisMonth}</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-semibold">{data.orders.thisMonth}</span>
                    </>
                  )}
                  <span className="text-gray-500">this month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="h-full hover:shadow-lg transition-all duration-200 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.earnings.total)}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full font-medium">
                      Pending: {formatCurrency(data.earnings.pending)}
                    </span>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                      Paid: {formatCurrency(data.earnings.paid)}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center space-x-1">
                  {data.earnings.thisMonth > 0 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-semibold">{formatCurrency(data.earnings.thisMonth)}</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-semibold">{formatCurrency(data.earnings.thisMonth)}</span>
                    </>
                  )}
                  <span className="text-gray-500">this month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rank Progress Card */}
      {data.rank && data.rank.current && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Rank Progress</h2>
                  <p className="text-purple-100">Track your journey to the next level</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500 mb-1">Current Rank</p>
                  <p className="text-xl font-bold text-gray-900">{data.rank.current.name}</p>
                </div>
                {data.rank.next && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 mb-1">Next Rank</p>
                    <p className="text-xl font-bold text-accent">{data.rank.next.name}</p>
                  </div>
                )}
              </div>
              
              {/* Team Sales Progress */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Team Sales Progress</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round(rankProgressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-accent to-purple-500 h-3 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${Math.min(rankProgressPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>Current: {data.rank.progress.teamSales.toLocaleString()} PV</span>
                  {data.rank.next && <span>Goal: {data.rank.next.requirements.teamSales.toLocaleString()} PV</span>}
                </div>
              </div>

              {/* Personal PV Progress */}
              {data.rank.next && data.rank.next.requirements.personalPV && (
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Personal PV</span>
                    <span className="text-sm font-medium text-gray-700">
                      {Math.round((data.rank.progress.personalPV || 0) / (data.rank.next.requirements.personalPV || 1) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min((data.rank.progress.personalPV || 0) / (data.rank.next.requirements.personalPV || 1) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>Current: {data.rank.progress.personalPV || 0} PV</span>
                    <span>Goal: {data.rank.next.requirements.personalPV || 0} PV</span>
                  </div>
                </div>
              )}

              {/* Team PV Progress */}
              {data.rank.next && data.rank.next.requirements.teamPV && (
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Team PV</span>
                    <span className="text-sm font-medium text-gray-700">
                      {Math.round((data.rank.progress.teamPV || 0) / (data.rank.next.requirements.teamPV || 1) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min((data.rank.progress.teamPV || 0) / (data.rank.next.requirements.teamPV || 1) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>Current: {data.rank.progress.teamPV || 0} PV</span>
                    <span>Goal: {data.rank.next.requirements.teamPV || 0} PV</span>
                  </div>
                </div>
              )}

              {/* Rank Benefits */}
              {data.rank.current.benefits && data.rank.current.benefits.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Gift className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Current Rank Benefits</h4>
                  </div>
                  <ul className="space-y-2">
                    {data.rank.current.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Commission Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <CommissionCard />
      </motion.div>
    </div>
  );
}