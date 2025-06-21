import React, { useEffect, useState } from 'react';
import { useMLMStore } from '../../store/mlmStore';

const WithdrawalPanel: React.FC = () => {
  const {
    withdrawals,
    isLoading,
    error,
    fetchWithdrawals,
    requestWithdrawal,
  } = useMLMStore();
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    const ok = await requestWithdrawal(Number(amount));
    if (ok) {
      setSuccess('Withdrawal request submitted!');
      setAmount('');
      fetchWithdrawals();
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">Withdraw Earnings</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col sm:flex-row gap-2 items-start sm:items-end">
        <input
          type="number"
          min="1"
          step="0.01"
          className="border rounded px-3 py-2 w-40"
          placeholder="Amount (₹)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={isLoading || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
        >
          Request Withdrawal
        </button>
      </form>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <h3 className="text-lg font-semibold mb-2">Withdrawal History</h3>
      {isLoading && <div>Loading withdrawals...</div>}
      {!isLoading && withdrawals.length === 0 && <div>No withdrawal requests yet.</div>}
      {!isLoading && withdrawals.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Amount</th>
                <th className="px-2 py-1 text-left">Status</th>
                <th className="px-2 py-1 text-left">Requested At</th>
                <th className="px-2 py-1 text-left">Processed At</th>
                <th className="px-2 py-1 text-left">Admin Notes</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w: any) => (
                <tr key={w._id}>
                  <td className="px-2 py-1">₹{w.amount.toFixed(2)}</td>
                  <td className="px-2 py-1 capitalize">{w.status}</td>
                  <td className="px-2 py-1">{new Date(w.requestedAt).toLocaleDateString()}</td>
                  <td className="px-2 py-1">{w.processedAt ? new Date(w.processedAt).toLocaleDateString() : '-'}</td>
                  <td className="px-2 py-1">{w.adminNotes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WithdrawalPanel; 