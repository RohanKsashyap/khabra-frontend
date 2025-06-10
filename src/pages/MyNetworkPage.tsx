import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { demoNetworkData } from '../data/demoData';

interface NetworkMember {
  id: string;
  name: string;
  email: string;
  level: number;
  joinDate: string;
  status: 'active' | 'inactive';
  directReferrals: number;
  totalTeamSize: number;
  totalSales: number;
  children?: NetworkMember[];
}

const MyNetworkPage: React.FC = () => {
  const { user } = useAuth();
  const [network, setNetwork] = useState<NetworkMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<NetworkMember | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<number[]>([1]);

  useEffect(() => {
    // Simulate API call with demo data
    const fetchNetwork = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNetwork(demoNetworkData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch network data');
      } finally {
        setLoading(false);
      }
    };

    fetchNetwork();
  }, []);

  const toggleLevel = (level: number) => {
    setExpandedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  const renderNetworkTree = (member: NetworkMember, level: number = 1) => {
    if (!expandedLevels.includes(level)) {
      return (
        <div
          key={member.id}
          className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
          onClick={() => toggleLevel(level)}
        >
          <div className="w-4 h-4 mr-2">▶</div>
          <span className="text-sm font-medium">{member.name}</span>
          <span className="ml-2 text-xs text-gray-500">
            ({member.directReferrals} direct, {member.totalTeamSize} total)
          </span>
        </div>
      );
    }

    return (
      <div key={member.id} className="ml-4">
        <div
          className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
          onClick={() => {
            toggleLevel(level);
            setSelectedMember(member);
          }}
        >
          <div className="w-4 h-4 mr-2">▼</div>
          <span className="text-sm font-medium">{member.name}</span>
          <span className="ml-2 text-xs text-gray-500">
            ({member.directReferrals} direct, {member.totalTeamSize} total)
          </span>
        </div>
        {member.children?.map((child) => renderNetworkTree(child, level + 1))}
      </div>
    );
  };

  if (loading) {
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
      <h1 className="text-3xl font-bold mb-8">My Network</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Network Tree */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Network Tree</h2>
            <div className="overflow-x-auto">
              {network && renderNetworkTree(network)}
            </div>
          </div>
        </div>

        {/* Member Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Member Details</h2>
            {selectedMember ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedMember.name}</h3>
                  <p className="text-sm text-gray-500">{selectedMember.email}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Level</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedMember.level}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Join Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(selectedMember.joinDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedMember.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {selectedMember.status}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Direct Referrals</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedMember.directReferrals}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Team Size</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedMember.totalTeamSize}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Sales</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        ₹{selectedMember.totalSales.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a member to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyNetworkPage; 