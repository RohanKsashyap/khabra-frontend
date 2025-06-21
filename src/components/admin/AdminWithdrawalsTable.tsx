import React, { useEffect, useState } from 'react';
import { mlmAPI } from '../../services/api';

const AdminWithdrawalsTable: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (status) params.status = status;
      const data = await mlmAPI.getAllWithdrawals(params);
      setWithdrawals(data.requests || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch withdrawals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    // eslint-disable-next-line
  }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setActionLoading(id + action);
    try {
      await mlmAPI.updateWithdrawalStatus(id, action);
      fetchWithdrawals();
    } catch (err: any) {
      alert(err.message || 'Failed to update withdrawal status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWithdrawals();
  };

  return (
    <div className="bg-white rounded shadow p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">All Withdrawal Requests</h2>
      <form onSubmit={handleFilter} className="flex flex-wrap gap-2 mb-4">
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
      </form>
      {isLoading && <div>Loading withdrawals...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!isLoading && !error && (
        withdrawals.length === 0 ? (
          <div>No withdrawal requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">User</th>
                  <th className="px-2 py-1 text-left">Amount</th>
                  <th className="px-2 py-1 text-left">Status</th>
                  <th className="px-2 py-1 text-left">Requested At</th>
                  <th className="px-2 py-1 text-left">Processed At</th>
                  <th className="px-2 py-1 text-left">Admin Notes</th>
                  <th className="px-2 py-1 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w: any) => (
                  <tr key={w._id}>
                    <td className="px-2 py-1">{w.user?.name || '-'}<br /><span className="text-xs text-gray-500">{w.user?.email || w.user}</span></td>
                    <td className="px-2 py-1">₹{w.amount.toFixed(2)}</td>
                    <td className="px-2 py-1 capitalize">{w.status}</td>
                    <td className="px-2 py-1">{new Date(w.requestedAt).toLocaleDateString()}</td>
                    <td className="px-2 py-1">{w.processedAt ? new Date(w.processedAt).toLocaleDateString() : '-'}</td>
                    <td className="px-2 py-1">{w.adminNotes || '-'}</td>
                    <td className="px-2 py-1">
                      {w.status === 'pending' && (
                        <>
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded mr-2 disabled:opacity-50"
                            disabled={!!actionLoading}
                            onClick={() => handleAction(w._id, 'approved')}
                          >
                            {actionLoading === w._id + 'approved' ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            className="bg-red-600 text-white px-2 py-1 rounded disabled:opacity-50"
                            disabled={!!actionLoading}
                            onClick={() => handleAction(w._id, 'rejected')}
                          >
                            {actionLoading === w._id + 'rejected' ? 'Rejecting...' : 'Reject'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default AdminWithdrawalsTable; 