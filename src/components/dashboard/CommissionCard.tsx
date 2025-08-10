import  { useEffect, useMemo, useCallback } from 'react';
import { useMLMStore } from '../../store/mlmStore';
import { formatCurrency } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Clock, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function CommissionCard() {
  const { earnings, fetchEarnings, isLoading } = useMLMStore();
  const earningsArr = earnings || [];
  
  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);
  
  // Memoize expensive calculations
  const { totalEarnings, pendingAmount } = useMemo(() => {
    const total = earningsArr.reduce((sum, earning) => {
      return sum + (earning.status !== 'cancelled' ? earning.amount : 0);
    }, 0);
    
    const pending = earningsArr.reduce((sum, earning) => {
      return sum + (earning.status === 'pending' ? earning.amount : 0);
    }, 0);
    
    return { totalEarnings: total, pendingAmount: pending };
  }, [earningsArr]);
  
  const getCommissionTypeIcon = useCallback((type: string) => {
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
  }, []);
  
  const getStatusStyles = useCallback((status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  }, []);
  
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
        ) : earningsArr.length > 0 ? (
          <div className="space-y-4">
            {earningsArr.map((earning) => (
              <div 
                key={earning._id || earning.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getCommissionTypeIcon(earning.type)}
                  <div>
                    <p className="font-medium capitalize">{earning.type} Commission</p>
                    <p className="text-xs text-muted-foreground">
                      {earning.date ? format(new Date(earning.date), 'dd MMM yyyy') : ''}
                      {earning.level && ` • Level ${earning.level}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="font-semibold">{formatCurrency(earning.amount)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyles(earning.status)}`}>
                    {earning.status}
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