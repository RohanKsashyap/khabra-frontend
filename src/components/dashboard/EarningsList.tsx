import React, { useEffect } from 'react';
import { useMLMStore } from '../../store/mlmStore';

const EarningsList: React.FC = () => {
  const { earnings, isLoading, error, fetchEarnings } = useMLMStore();

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  return (
    <div className="bg-white rounded shadow p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">My Earnings</h2>
      {isLoading && <div>Loading earnings...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!isLoading && !error && (
        earnings.length === 0 ? (
          <div>No earnings yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
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

export default EarningsList; 