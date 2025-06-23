import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Users, ShoppingBag, CreditCard, TrendingUp, Award } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { CommissionCard } from './CommissionCard';
import api from '../../services/api';
import { Skeleton } from '../ui/Skeleton';
import { useApiCache } from '../../hooks/useApiCache';

interface DashboardData {
  earnings: { total: number; thisMonth: number };
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error || 'No data available.'}</div>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Team</p>
                <p className="text-2xl font-bold mt-1">{data.team.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{data.team.newThisMonth} new</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Personal PV</p>
                <p className="text-2xl font-bold mt-1">{data.personalPV.total.toFixed(2)} PV</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{data.personalPV.thisMonth.toFixed(2)} PV</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold mt-1">{data.orders.total}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-amber-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{data.orders.thisMonth}</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Earnings</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(data.earnings.total)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">{formatCurrency(data.earnings.thisMonth)}</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rank Progress Card */}
      {data.rank && data.rank.current && (
        <Card>
          <CardHeader>
            <CardTitle>Rank Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{data.rank.current.name}</span>
              {data.rank.next && <span className="text-sm font-medium">{data.rank.next.name}</span>}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(rankProgressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>Current: {data.rank.progress.teamSales.toLocaleString()} PV</span>
              {data.rank.next && <span>Goal: {data.rank.next.requirements.teamSales.toLocaleString()} PV</span>}
            </div>
            {/* Personal PV Progress Bar */}
            {data.rank.next && (
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Personal PV</span>
                  <span className="text-sm font-medium text-gray-700">
                    {data.rank.progress.personalPV || 0} / {data.rank.next.requirements.personalPV || 0}
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((data.rank.progress.personalPV || 0) / (data.rank.next.requirements.personalPV || 1) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
            {/* Team PV Progress Bar */}
            {data.rank.next && (
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Team PV</span>
                  <span className="text-sm font-medium text-gray-700">
                    {data.rank.progress.teamPV || 0} / {data.rank.next.requirements.teamPV || 0}
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((data.rank.progress.teamPV || 0) / (data.rank.next.requirements.teamPV || 1) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
            {data.rank.current.benefits && data.rank.current.benefits.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Rank Benefits:</h4>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                {data.rank.current.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Commission Card */}
      <CommissionCard />
    </div>
  );
}