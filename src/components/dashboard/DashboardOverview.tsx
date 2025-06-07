import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Users, ShoppingBag, CreditCard, TrendingUp, Award } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { CommissionCard } from './CommissionCard';

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Team</p>
                <p className="text-2xl font-bold mt-1">7</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+3 new</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Personal PV</p>
                <p className="text-2xl font-bold mt-1">500 PV</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+120 PV</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-amber-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+3</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Earnings</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(12500)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">{formatCurrency(2500)}</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rank Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Rank Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Gold</span>
            <span className="text-sm font-medium">Platinum</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
            <span>Current: 6,500 PV</span>
            <span>Goal: 10,000 PV</span>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Rank Benefits:</h4>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>10% commission on all levels</li>
              <li>Leadership bonus pool access</li>
              <li>Monthly reward of ₹10,000</li>
              <li>Annual international trip</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Commission Card */}
      <CommissionCard />
    </div>
  );
}