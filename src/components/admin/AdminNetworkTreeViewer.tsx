import React, { useState } from 'react';
import { mlmAPI, userAPI } from '../../services/api';
import '../../styles/TreeNode.css';

const UserNode = ({ user, level, upline }: { user: any; level: number; upline?: any }) => (
  <div className="node">
    <div className="name">{user.name} (Level {level})</div>
    <div className="id">ID: {user.referralCode}</div>
    <div className="id">Email: {user.email}</div>
    <div className="rank" style={{ color: '#c0392b' }}>Rank: {user.role}</div>
    {upline && (
      <div className="text-xs mt-2 text-gray-500">
        Upline: {upline.name} ({upline.referralCode})
      </div>
    )}
  </div>
);

function renderTree(nodes: any[], level = 1): React.ReactElement | null {
  if (!nodes || nodes.length === 0) return null;
  return (
    <ul>
      {nodes.map((child: any) => (
        <li key={child._id}>
          <UserNode user={child} level={level} />
          {child.downline && child.downline.length > 0 ? renderTree(child.downline, level + 1) : null}
        </li>
      ))}
    </ul>
  );
}

const AdminNetworkTreeViewer: React.FC = () => {
  const [userIdOrEmail, setUserIdOrEmail] = useState('');
  const [treeData, setTreeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTreeData(null);
    try {
      let userId = userIdOrEmail;
      if (!/^[a-f\d]{24}$/i.test(userIdOrEmail)) {
        const users = await userAPI.getUsers({ email: userIdOrEmail });
        if (Array.isArray(users) && users.length > 0) {
          userId = users[0]._id;
        } else {
          throw new Error('User not found');
        }
      }
      const data = await mlmAPI.getNetworkTreeByUser(userId);
      setTreeData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch network tree');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 mt-4 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">View Any User's Network Tree</h2>
      <form onSubmit={handleFetch} className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          className="border rounded px-3 py-2"
          placeholder="User ID or Email"
          value={userIdOrEmail}
          onChange={e => setUserIdOrEmail(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">View Tree</button>
      </form>
      {isLoading && <div className="text-center p-8">Loading network tree...</div>}
      {error && <div className="text-center p-8 text-red-500">{error}</div>}
      {!isLoading && !error && treeData && (
        <div className="tree">
          <ul>
            <li>
              <UserNode user={treeData.root} level={0} upline={treeData.upline} />
              {renderTree(treeData.tree, 1)}
            </li>
          </ul>
        </div>
      )}
      {!isLoading && !error && !treeData && <div className="text-center p-8">Enter a user ID or email to view their network tree.</div>}
    </div>
  );
};

export default AdminNetworkTreeViewer; 