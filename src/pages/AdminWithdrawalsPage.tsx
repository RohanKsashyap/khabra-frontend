import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatCurrency, formatDate } from '../lib/utils';

const AdminWithdrawalsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/withdrawals');
      setRequests(data.data);
    } catch (error) {
      toast.error('Failed to fetch withdrawal requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const isApproving = status === 'approved';
    const confirmationText = isApproving 
      ? 'Are you sure you want to approve this withdrawal? This will transfer funds.'
      : 'Are you sure you want to reject this withdrawal?';

    if (!window.confirm(confirmationText)) {
      return;
    }

    try {
      await api.put(`/api/withdrawals/${id}`, { status });
      toast.success(`Request ${status} successfully.`);
      fetchRequests(); // Refresh list
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        'Failed to update status.';
      toast.error(errorMessage);
    }
  };

  const filteredRequests = requests.filter((req: any) => filter === 'all' || req.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Withdrawal Requests</CardTitle>
        <div className="flex space-x-2 pt-4">
          <Button onClick={() => setFilter('all')} className={filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}>All</Button>
          <Button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}>Pending</Button>
          <Button onClick={() => setFilter('approved')} className={filter === 'approved' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}>Approved</Button>
          <Button onClick={() => setFilter('rejected')} className={filter === 'rejected' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}>Rejected</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading requests...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">User</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Method</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req: any) => (
                  <tr key={req._id} className="bg-white border-b">
                    <td className="px-6 py-4">{req.user?.name || 'N/A'} <br/> <span className="text-xs text-gray-500">{req.user?.email}</span></td>
                    <td className="px-6 py-4">{formatDate(req.createdAt)}</td>
                    <td className="px-6 py-4">{formatCurrency(req.amount)}</td>
                    <td className="px-6 py-4">{req.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {req.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button onClick={() => handleUpdateStatus(req._id, 'approved')} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs">Approve</Button>
                          <Button onClick={() => handleUpdateStatus(req._id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs">Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminWithdrawalsPage; 