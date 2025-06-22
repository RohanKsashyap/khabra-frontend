import React, { useEffect } from 'react';
import { useMLMStore } from '../../store/mlmStore';
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

const NetworkTree: React.FC = () => {
  const { networkTree, isLoading, error, fetchNetworkTree } = useMLMStore();

  useEffect(() => {
    fetchNetworkTree();
  }, [fetchNetworkTree]);

  return (
    <div className="bg-white rounded shadow p-4 mt-4 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">My Network Tree</h2>
      {isLoading && <div className="text-center p-8">Loading network tree...</div>}
      {error && <div className="text-center p-8 text-red-500">{error}</div>}
      {!isLoading && !error && networkTree && (
        <div className="tree">
          <ul>
            <li>
              <UserNode user={networkTree.root} level={0} upline={networkTree.upline} />
              {networkTree.tree && networkTree.tree.length > 0 ? (
                renderTree(networkTree.tree, 1)
              ) : (
                <div className="text-center p-8 text-gray-500">
                  You have no referrals in your downline.
                  <br />
                  Share your referral ID to add new members!
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
      {!isLoading && !error && !networkTree && <div className="text-center p-8">No network data found.</div>}
    </div>
  );
};

export default NetworkTree;