import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { mlmAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useMLMStore } from '../store/mlmStore';
import { useLocation, useNavigate } from 'react-router-dom';

interface Earning {
  _id: string;
  amount: number;
  type: 'direct' | 'level' | 'rank' | 'reward';
  description: string;
  date: string;
  status: 'pending' | 'completed';
}

const EarningsPage: React.FC = () => {
  const { user } = useAuth();
  const { earnings, stats, fetchEarnings, isLoading, error } = useMLMStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    setViewingUserId(userId);
    
    // Fetch earnings for the specified user or current user
    fetchEarnings(userId || undefined);
  }, [location.search, fetchEarnings]);

  const handleClearHistory = async () => {
    if (user?.role === 'admin') {
      if (window.confirm('Are you sure you want to delete ALL users\' earnings history? This action cannot be undone.')) {
        try {
          await mlmAPI.clearAllEarnings();
          fetchEarnings(); // Refetch after clearing
          toast.success('All users\' earnings history cleared successfully.');
        } catch (err) {
          toast.error('Failed to clear all users\' earnings history.');
        }
      }
    }
  };

  if (isLoading) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Earnings</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
          <p className="text-2xl font-bold text-gray-900">₹{(stats.totalEarnings ?? 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Pending Earnings</h3>
          <p className="text-2xl font-bold text-gray-900">₹{(stats.pendingEarnings ?? 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">This Month</h3>
          <p className="text-2xl font-bold text-gray-900">₹{(stats.thisMonth ?? 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Last Month</h3>
          <p className="text-2xl font-bold text-gray-900">₹{(stats.lastMonth ?? 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium">Earnings History</h2>
          {user?.role === 'admin' && (
            <Button
              onClick={handleClearHistory}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear History
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earnings && earnings.map((earning : Earning) => (
                <tr key={earning._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(earning.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {earning.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {earning.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{earning.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      earning.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {earning.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage; 