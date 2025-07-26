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
      // If input is not a MongoDB ObjectId, assume it's an email and find the user
      if (!/^[a-f\d]{24}$/i.test(userIdOrEmail)) {
        const users = await userAPI.getUsers({ search: userIdOrEmail });
        if (Array.isArray(users) && users.length > 0) {
          userId = users[0]._id;
        } else {
          throw new Error('User with that email not found.');
        }
      }
      
      const data = await mlmAPI.getNetworkTreeByUser(userId);

      // Check if the returned data or the root of the tree is empty/null
      if (!data || !data.root) {
        // Set a specific error message for this case
        setError('No downline found for this user.');
      } else {
        setTreeData(data);
      }

    } catch (err: any) {
      // Handle 404 from API specifically
      if (err.response && err.response.status === 404) {
        setError('User not found or has no network information.');
      } else {
        // Handle other errors, including the custom one thrown above
        setError(err.message || 'Failed to fetch network tree');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 mt-4 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">View Any User's Network Tree</h2>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Admin Access:</strong> You can view infinite downline levels for any user. 
          Regular users are limited to 5 levels.
        </p>
      </div>
      <form onSubmit={handleFetch} className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          className="border rounded px-3 py-2"
          placeholder="User ID or Email"
          value={userIdOrEmail}
          onChange={e => setUserIdOrEmail(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'View Tree'}
        </button>
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
      
      {/* Initial state message */}
      {!isLoading && !error && !treeData && (
        <div className="text-center p-8 text-gray-500">
            Enter a user ID or email to view their network tree.
        </div>
      )}
    </div>
  );
};

export default AdminNetworkTreeViewer;