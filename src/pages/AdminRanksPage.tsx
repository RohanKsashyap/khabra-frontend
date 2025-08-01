import React, { useState, useEffect } from 'react';
import { rankAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Rank {
  _id: string;
  name: string;
  level: number;
  requirements: {
    directReferrals: number;
    teamSize: number;
    teamSales: number;
    personalPV?: number;
    teamPV?: number;
  };
  rewards: {
    commission: number;
    bonus: number;
  };
}

const AdminRanksPage: React.FC = () => {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);

  useEffect(() => {
    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    try {
      setIsLoading(true);
      const { data } = await rankAPI.getRanks();
      setRanks(data);
    } catch (err) {
      setError('Failed to fetch ranks.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (rank: Rank) => {
    setEditingRank({ ...rank });
  };

  const handleSave = async () => {
    if (!editingRank) return;
    try {
      const { _id, ...updateData } = editingRank;
      await rankAPI.updateRank(_id, updateData);
      toast.success('Rank updated successfully!');
      setEditingRank(null);
      fetchRanks(); // Refresh ranks
    } catch (err) {
      toast.error('Failed to update rank.');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, group: 'requirements' | 'rewards') => {
    if (!editingRank) return;
    const { name, value } = e.target;
    setEditingRank({
      ...editingRank,
      [group]: {
        ...editingRank[group],
        [name]: Number(value),
      },
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Ranks</h1>
      {isLoading ? (
        <p>Loading ranks...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            {/* Table Head */}
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Level</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Referrals</th>
                <th className="p-4 text-left">Team Size</th>
                <th className="p-4 text-left">Team Sales (₹)</th>
                <th className="p-4 text-left">Personal PV</th>
                <th className="p-4 text-left">Team PV</th>
                <th className="p-4 text-left">Commission (%)</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {ranks.map(rank => (
                <tr key={rank._id} className="border-t">
                  <td className="p-4">{rank.level}</td>
                  <td className="p-4 font-semibold">{rank.name}</td>
                  <td className="p-4">{rank.requirements.directReferrals}</td>
                  <td className="p-4">{rank.requirements.teamSize}</td>
                  <td className="p-4">{rank.requirements.teamSales.toLocaleString()}</td>
                  <td className="p-4">{rank.requirements.personalPV || 0}</td>
                  <td className="p-4">{rank.requirements.teamPV || 0}</td>
                  <td className="p-4">{rank.rewards.commission}%</td>
                  <td className="p-4">
                    <button onClick={() => handleEdit(rank)} className="text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingRank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Edit Rank: {editingRank.name}</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Requirements */}
              <div>
                <h3 className="font-bold mb-2">Requirements</h3>
                <label className="block mb-2">
                  Direct Referrals:
                  <input type="number" name="directReferrals" value={editingRank.requirements.directReferrals} onChange={e => handleInputChange(e, 'requirements')} className="w-full mt-1 p-2 border rounded"/>
                </label>
                <label className="block mb-2">
                  Team Size:
                  <input type="number" name="teamSize" value={editingRank.requirements.teamSize} onChange={e => handleInputChange(e, 'requirements')} className="w-full mt-1 p-2 border rounded"/>
                </label>
                <label className="block mb-2">
                  Team Sales (₹):
                  <input type="number" name="teamSales" value={editingRank.requirements.teamSales} onChange={e => handleInputChange(e, 'requirements')} className="w-full mt-1 p-2 border rounded"/>
                </label>
                <label className="block mb-2">
                  Personal PV:
                  <input type="number" name="personalPV" value={editingRank.requirements.personalPV || 0} onChange={e => handleInputChange(e, 'requirements')} className="w-full mt-1 p-2 border rounded"/>
                </label>
                <label className="block mb-2">
                  Team PV:
                  <input type="number" name="teamPV" value={editingRank.requirements.teamPV || 0} onChange={e => handleInputChange(e, 'requirements')} className="w-full mt-1 p-2 border rounded"/>
                </label>
              </div>
              {/* Rewards */}
              <div>
                <h3 className="font-bold mb-2">Rewards</h3>
                <label className="block mb-2">
                  Commission (%):
                  <input type="number" name="commission" value={editingRank.rewards.commission} onChange={e => handleInputChange(e, 'rewards')} className="w-full mt-1 p-2 border rounded"/>
                </label>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <button onClick={() => setEditingRank(null)} className="px-6 py-2 mr-4 rounded text-gray-700 bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 rounded text-white bg-blue-600 hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRanksPage; 