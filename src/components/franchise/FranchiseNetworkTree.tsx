import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/TreeNode.css';

interface UserNodeData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  children?: UserNodeData[];
}

interface FranchiseNetworkTreeProps {
  franchiseId: string;
}

const UserNode: React.FC<{ user: UserNodeData; level: number }> = ({ user, level }) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="node">
      <div className="flex items-center">
        {user.children && user.children.length > 0 && (
          <button
            className="mr-2 text-xs bg-gray-200 rounded px-1"
            onClick={() => setExpanded(e => !e)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '-' : '+'}
          </button>
        )}
        <span className="name">{user.name} ({user.role})</span>
      </div>
      <div className="id">Email: {user.email}</div>
      <div className="id">Phone: {user.phone}</div>
      <div className="id text-xs text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
      {expanded && user.children && user.children.length > 0 && (
        <ul>
          {user.children.map(child => (
            <li key={child._id}>
              <UserNode user={child} level={level + 1} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FranchiseNetworkTree: React.FC<FranchiseNetworkTreeProps> = ({ franchiseId }) => {
  const [tree, setTree] = useState<UserNodeData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const API_BASE = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_BASE}/api/v1/franchises/${franchiseId}/network`, config);
        setTree(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load network tree');
      } finally {
        setLoading(false);
      }
    };
    if (franchiseId) fetchTree();
  }, [franchiseId]);

  return (
    <div className="bg-white rounded shadow p-4 mt-4 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Franchise Downline Network</h2>
      {loading && <div className="text-center p-8">Loading network tree...</div>}
      {error && <div className="text-center p-8 text-red-500">{error}</div>}
      {!loading && !error && tree && tree.length > 0 && (
        <div className="tree">
          <ul>
            {tree.map(root => (
              <li key={root._id}>
                <UserNode user={root} level={0} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {!loading && !error && tree && tree.length === 0 && (
        <div className="text-center p-8 text-gray-500">No downline members found for this franchise.</div>
      )}
    </div>
  );
};

export default FranchiseNetworkTree; 