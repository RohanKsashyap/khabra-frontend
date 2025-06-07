import React, { useEffect } from 'react';
import { useMLMStore } from '../../store/mlmStore';
import { formatCurrency } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Clock, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function CommissionCard() {
  const { commissions, fetchCommissions, isLoading } = useMLMStore();
  
  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);
  
  const totalEarnings = commissions.reduce((total, commission) => {
    return total + (commission.status !== 'cancelled' ? commission.amount : 0);
  }, 0);
  
  const pendingAmount = commissions.reduce((total, commission) => {
    return total + (commission.status === 'pending' ? commission.amount : 0);
  }, 0);
  
  const getCommissionTypeIcon = (type: string) => {
    switch (type) {
      case 'direct':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'level':
        return <Clock className="h-4 w-4 text-purple-500" />;
      case 'matching':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Commissions & Earnings</CardTitle>
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <p className="text-lg font-semibold">{formatCurrency(totalEarnings)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-lg font-semibold">{formatCurrency(pendingAmount)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : commissions.length > 0 ? (
          <div className="space-y-4">
            {commissions.map((commission) => (
              <div 
                key={commission.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getCommissionTypeIcon(commission.type)}
                  <div>
                    <p className="font-medium capitalize">{commission.type} Commission</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(commission.createdAt), 'dd MMM yyyy')}
                      {commission.level && ` • Level ${commission.level}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="font-semibold">{formatCurrency(commission.amount)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                    commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {commission.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No commission history available yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}