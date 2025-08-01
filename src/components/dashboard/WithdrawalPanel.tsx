import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useMLMStore } from '../../store/mlmStore';

interface WithdrawalFormData {
  amount: number;
  paymentMethod: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

const WithdrawalPanel: React.FC = () => {
  const { user } = useAuth();
  const { earnings, fetchEarnings } = useMLMStore();
  const [requests, setRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const balanceBreakdown = useMemo(() => {
    const totalEarnings = earnings
      .filter(earning => earning.amount > 0)
      .reduce((acc, earning) => acc + earning.amount, 0);
    
    const totalWithdrawals = earnings
      .filter(earning => earning.amount < 0)
      .reduce((acc, earning) => acc + Math.abs(earning.amount), 0);
    
    return {
      totalEarnings,
      totalWithdrawals,
      availableBalance: totalEarnings - totalWithdrawals
    };
  }, [earnings]);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<WithdrawalFormData>();
  const watchAmount = watch("amount", 0);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/api/withdrawals/my-requests');
      setRequests(data.data);
    } catch (error) {
      toast.error('Failed to fetch withdrawal history.');
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchEarnings();
  }, [fetchEarnings]);

  const onSubmit = async (formData: WithdrawalFormData) => {
    if (formData.amount > balanceBreakdown.availableBalance) {
      toast.error("Withdrawal amount cannot exceed available balance.");
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentDetails = {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        accountHolderName: formData.accountHolderName,
      };

      await api.post('/api/withdrawals/request', {
        amount: formData.amount,
        paymentMethod: 'Bank Transfer',
        paymentDetails,
      });
      toast.success('Withdrawal request submitted successfully!');
      reset();
      fetchRequests(); // Refresh the list
      fetchEarnings(); // Refresh balance
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to submit request.';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3">Amount</th>
                    <th scope="col" className="px-6 py-3">Method</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length > 0 ? requests.map((req: any) => (
                    <tr key={req._id} className="bg-white border-b">
                      <td className="px-6 py-4">{formatDate(req.createdAt)}</td>
                      <td className="px-6 py-4">{formatCurrency(req.amount)}</td>
                      <td className="px-6 py-4">{req.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4">No withdrawal requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Request a Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(balanceBreakdown.availableBalance)}</p>
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium">Amount</label>
                <input
                  type="number"
                  id="amount"
                  {...register('amount', { 
                    required: 'Amount is required', 
                    valueAsNumber: true, 
                    min: { value: 1, message: "Amount must be at least ₹1" },
                    max: { value: balanceBreakdown.availableBalance, message: "Amount cannot exceed available balance" }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
              </div>
              
              <div>
                <label htmlFor="accountHolderName" className="block text-sm font-medium">Account Holder Name</label>
                <input
                  type="text"
                  id="accountHolderName"
                  defaultValue={user?.name || ''}
                  {...register('accountHolderName', { required: 'Account holder name is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                {errors.accountHolderName && <p className="text-red-500 text-sm mt-1">{errors.accountHolderName.message}</p>}
              </div>

              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium">Account Number</label>
                <input
                  type="text"
                  id="accountNumber"
                  {...register('accountNumber', { required: 'Account number is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber.message}</p>}
              </div>
              
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium">Bank Name</label>
                <input
                  type="text"
                  id="bankName"
                  {...register('bankName', { required: 'Bank name is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName.message}</p>}
              </div>

              <div>
                <label htmlFor="ifscCode" className="block text-sm font-medium">IFSC Code</label>
                <input
                  type="text"
                  id="ifscCode"
                  {...register('ifscCode', { required: 'IFSC code is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode.message}</p>}
              </div>

              <div className="flex justify-center">
                <Button type="submit" disabled={isSubmitting || watchAmount > balanceBreakdown.availableBalance}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WithdrawalPanel; 