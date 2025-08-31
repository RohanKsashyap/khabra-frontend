import React, { useEffect } from 'react';
import { useMLMStore } from '../../store/mlmStore';
import '../../styles/TreeNode.css';
import { motion } from 'framer-motion';
import { User, Mail, Award, Calendar, Users, TrendingUp } from 'lucide-react';
import { formatDate } from '../../lib/utils';

const UserNode = ({ user, level, upline }: { user: any; level: number; upline?: any }) => (
  <motion.div 
    className="node bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-3 hover:shadow-md transition-all duration-200"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
        {user.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user.name}</div>
        <div className="text-xs text-gray-500">Level {level} • ID: {user.referralCode}</div>
      </div>
    </div>
    
    <div className="text-xs sm:text-sm text-gray-600 mb-3 truncate">{user.email}</div>
    
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <div className="px-2 sm:px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
        {user.role}
      </div>
      {user.createdAt && (
        <div className="text-xs text-gray-500 flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span className="hidden sm:inline">{formatDate(user.createdAt)}</span>
          <span className="sm:hidden">{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      )}
    </div>
    
    {upline && (
      <div className="text-xs mb-3 p-2 bg-gray-50 rounded-lg text-gray-600">
        <span className="font-medium">Upline:</span> {upline.name} ({upline.referralCode})
      </div>
    )}
    
    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
      <div className="text-center p-2 bg-blue-50 rounded-lg">
        <div className="font-bold text-blue-700 text-sm sm:text-base">{user.directReferrals || 0}</div>
        <div className="text-blue-600 text-xs">Direct Ref</div>
      </div>
      <div className="text-center p-2 bg-green-50 rounded-lg">
        <div className="font-bold text-green-700 text-sm sm:text-base">{user.teamSize || 0}</div>
        <div className="text-green-600 text-xs">Team Size</div>
      </div>
    </div>
  </motion.div>
);

function renderTree(nodes: any[], level = 1): React.ReactElement | null {
  if (!nodes || nodes.length === 0) return null;
  return (
    <ul className="ml-3 sm:ml-6 border-l-2 border-gray-200 pl-2 sm:pl-4">
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

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-6 sm:p-12"
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-base sm:text-lg">Loading your network tree...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-6 sm:p-12"
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-red-600 mb-2">Error Loading Network</h3>
        <p className="text-red-500 mb-4 text-sm sm:text-base">{error}</p>
        <button
          onClick={fetchNetworkTree}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm sm:text-base"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  if (!networkTree) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-6 sm:p-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
      >
        <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">No referrals in your network yet</h3>
        <p className="text-gray-500 mb-4 text-sm sm:text-base">Share your referral ID to start building your team!</p>
        <div className="bg-accent/10 text-accent px-3 sm:px-4 py-2 rounded-lg font-mono text-xs sm:text-sm">
          {'REFERRAL_CODE'}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {networkTree.tree && networkTree.tree.length > 0 ? (
        <div className="tree">
          <ul>
            <li>
              <UserNode user={networkTree.root} level={0} upline={networkTree.upline} />
              {renderTree(networkTree.tree, 1)}
            </li>
          </ul>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
        >
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No referrals in your network yet</h3>
          <p className="text-gray-500 mb-4">Share your referral ID to start building your team!</p>
          <div className="bg-accent/10 text-accent px-4 py-2 rounded-lg font-mono text-sm">
            {networkTree.root?.referralCode || 'REFERRAL_CODE'}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NetworkTree;