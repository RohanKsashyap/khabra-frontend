import React, { useEffect, useState } from 'react';
import { mlmAPI } from '../../services/api';

const AdminEarningsTable: React.FC = () => {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [status, setStatus] = useState('');

  const fetchEarnings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (userEmail) params.user = userEmail;
      if (status) params.status = status;
      const data = await mlmAPI.getAllEarnings(params);
      setEarnings(data.earnings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch earnings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
    // eslint-disable-next-line
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEarnings();
  };

  return (
    <div className="bg-white rounded shadow p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">All User Earnings</h2>
      <form onSubmit={handleFilter} className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          className="border rounded px-3 py-2"
          placeholder="User Email or ID"
          value={userEmail}
          onChange={e => setUserEmail(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
      </form>
      {isLoading && <div>Loading earnings...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!isLoading && !error && (
        earnings.length === 0 ? (
          <div>No earnings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">User</th>
                  <th className="px-2 py-1 text-left">Amount</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-left">Description</th>
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e: any) => (
                  <tr key={e._id}>
                    <td className="px-2 py-1">{e.user?.name || '-'}<br /><span className="text-xs text-gray-500">{e.user?.email || e.user}</span></td>
                    <td className="px-2 py-1">₹{e.amount.toFixed(2)}</td>
                    <td className="px-2 py-1 capitalize">{e.type}</td>
                    <td className="px-2 py-1">{e.description}</td>
                    <td className="px-2 py-1">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-2 py-1 capitalize">{e.status}</td>
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

export default AdminEarningsTable; 