import React, { useState, useEffect } from 'react';
import { useMLMStore } from '../../store/mlmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { formatCurrency, formatDate } from '../../lib/utils';
import { mlmAPI } from '../../services/api';
import '../../styles/TreeNode.css';
import { LoadingState } from '../ui/LoadingState';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  GitBranch, 
  Eye, 
  List, 
  BarChart3, 
  ChevronDown, 
  ChevronRight, 
  Crown, 
  Target, 
  Calendar,
  Star,
  Award,
  Network,
  UserPlus,
  Activity
} from 'lucide-react';

interface DownlineStats {
  totalMembers: number;
  activeMembers: number;
  totalSales: number;
  topPerformers: any[];
}

interface DownlineAnalytics {
  totalMembers: number;
  activeMembers: number;
  totalSales: number;
  monthlySales: number;
  levelDistribution: { [key: number]: number };
  topPerformers: any[];
  rankDistribution: { [key: string]: number };
  averageTeamSize: number;
}

const UserNode = ({ user, level, upline, isExpanded, onToggle }: { 
  user: any; 
  level: number; 
  upline?: any;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const hasChildren = user.downline && user.downline.length > 0;
  
  return (
    <motion.div 
      className="node bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-3 hover:shadow-md transition-all duration-200"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user.name}</div>
              <div className="text-xs text-gray-500">Level {level} • ID: {user.referralCode}</div>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 mb-2 truncate">{user.email}</div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
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
        </div>
        {hasChildren && (
          <Button 
            onClick={onToggle}
            className="ml-2 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex-shrink-0"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />}
          </Button>
        )}
      </div>
      
      {upline && (
        <div className="text-xs mb-3 p-2 bg-gray-50 rounded-lg text-gray-600">
          <span className="font-medium">Upline:</span> {upline.name} ({upline.referralCode})
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="font-bold text-blue-700 text-sm sm:text-base">{user.directReferrals || 0}</div>
          <div className="text-blue-600 text-xs">Direct Ref</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="font-bold text-green-700 text-sm sm:text-base">{user.teamSize || 0}</div>
          <div className="text-green-600 text-xs">Team Size</div>
        </div>
        {user.totalSales && (
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <div className="font-bold text-orange-700 text-sm sm:text-base">{formatCurrency(user.totalSales)}</div>
            <div className="text-orange-600 text-xs">Sales</div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

function renderTree(nodes: any[], level = 1, expandedNodes: Set<string>, onToggleNode: (nodeId: string) => void): React.ReactElement | null {
  if (!nodes || nodes.length === 0) return null;
  return (
    <ul className="ml-6 border-l-2 border-gray-200 pl-4">
      {nodes.map((child: any) => (
        <li key={child._id}>
          <UserNode 
            user={child} 
            level={level} 
            isExpanded={expandedNodes.has(child._id)}
            onToggle={() => onToggleNode(child._id)}
          />
          {child.downline && child.downline.length > 0 && expandedNodes.has(child._id) ? 
            renderTree(child.downline, level + 1, expandedNodes, onToggleNode) : null}
        </li>
      ))}
    </ul>
  );
}

const DownlineVisualizer: React.FC = () => {
  const { networkTree, isLoading, error, fetchNetworkTree } = useMLMStore() as { networkTree: any, isLoading: boolean, error: string | null, fetchNetworkTree: () => void };
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'stats'>('tree');
  const [downlineStats, setDownlineStats] = useState<DownlineStats | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    fetchNetworkTree();
    fetchAnalytics();
  }, [fetchNetworkTree]);

  useEffect(() => {
    if (networkTree) {
      calculateDownlineStats();
    }
  }, [networkTree]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await mlmAPI.getDownlineAnalytics();
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const calculateDownlineStats = () => {
    if (!networkTree?.tree) return;

    let totalMembers = 0;
    let activeMembers = 0;
    let totalSales = 0;
    const performers: any[] = [];

    const traverse = (nodes: any[]) => {
      nodes.forEach(node => {
        totalMembers++;
        if (node.status === 'active') activeMembers++;
        if (node.totalSales) {
          totalSales += node.totalSales;
          performers.push({
            name: node.name,
            sales: node.totalSales,
            rank: node.role
          });
        }
        if (node.downline) traverse(node.downline);
      });
    };

    traverse(networkTree.tree);

    setDownlineStats({
      totalMembers,
      activeMembers,
      totalSales,
      topPerformers: performers.sort((a, b) => b.sales - a.sales).slice(0, 5)
    });
  };

  const handleToggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectIds = (nodes: any[]) => {
      nodes.forEach(node => {
        allNodeIds.add(node._id);
        if (node.downline) collectIds(node.downline);
      });
    };
    if (networkTree?.tree) {
      collectIds(networkTree.tree);
    }
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Network className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Downline Network</h1>
              <p className="text-green-100 text-lg">Visualize and analyze your team structure and performance</p>
            </div>
          </div>
        </motion.div>

        {/* Loading Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center p-12">
                <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading your downline network...</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Network className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Downline Network</h1>
              <p className="text-green-100 text-lg">Visualize and analyze your team structure and performance</p>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center p-8"
        >
          <div className="text-red-500 mb-4 text-lg">{error?.toString() || 'An error occurred.'}</div>
          <button
            onClick={fetchNetworkTree}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  if (!networkTree) {
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Network className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Downline Network</h1>
              <p className="text-green-100 text-lg">Visualize and analyze your team structure and performance</p>
            </div>
          </div>
        </motion.div>

        {/* No Data Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center p-8"
        >
          <div className="text-gray-500 text-lg mb-4">No network data found.</div>
          <button
            onClick={fetchNetworkTree}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Refresh
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-4 sm:p-6 lg:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
              <Network className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Downline Network</h1>
              <p className="text-green-100 text-base sm:text-lg">Visualize and analyze your team structure and performance</p>
            </div>
          </div>
      </motion.div>

      {/* Stats Cards - Modern Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total Members</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{analytics?.totalMembers || downlineStats?.totalMembers || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Active Members</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{analytics?.activeMembers || downlineStats?.activeMembers || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total Sales</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(analytics?.totalSales || downlineStats?.totalSales || 0)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Direct Referrals</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{networkTree.stats?.direct || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Card>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Network Visualization</h2>
                  <p className="text-sm sm:text-base text-gray-600">Choose your preferred view mode</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <Button
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-200 ${
                      viewMode === 'tree' 
                        ? 'bg-accent text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setViewMode('tree')}
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Tree View</span>
                    <span className="sm:hidden">Tree</span>
                  </Button>
                  <Button
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-accent text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">List View</span>
                    <span className="sm:hidden">List</span>
                  </Button>
                  <Button
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all duration-200 ${
                      viewMode === 'stats' 
                        ? 'bg-accent text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setViewMode('stats')}
                  >
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Stats View</span>
                    <span className="sm:hidden">Stats</span>
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={expandAll}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors"
                  >
                    <span className="hidden sm:inline">Expand All</span>
                    <span className="sm:hidden">Expand</span>
                  </Button>
                  <Button 
                    onClick={collapseAll}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors"
                  >
                    <span className="hidden sm:inline">Collapse All</span>
                    <span className="sm:hidden">Collapse</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        <CardContent className="p-6">
          {viewMode === 'tree' && (
            <div className="overflow-x-auto">
              <div className="tree">
                <ul>
                  <li>
                    <UserNode 
                      user={networkTree.root} 
                      level={0} 
                      upline={networkTree.upline}
                      isExpanded={true}
                      onToggle={() => {}}
                    />
                    {networkTree.tree && networkTree.tree.length > 0 ? (
                      renderTree(networkTree.tree, 1, expandedNodes, handleToggleNode)
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
            </div>
          )}

          {viewMode === 'stats' && (analytics || downlineStats) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analytics?.topPerformers || downlineStats?.topPerformers || []).map((performer: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{performer.name}</div>
                          <div className="text-sm text-gray-500">{performer.rank}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(performer.sales)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.levelDistribution && Object.entries(analytics.levelDistribution).map(([level, count]) => (
                      <div key={level} className="flex justify-between items-center">
                        <span>Level {level}</span>
                        <span className="font-bold">{count as number}</span>
                      </div>
                    ))}
                    {!analytics?.levelDistribution && networkTree.stats?.levels && Object.entries(networkTree.stats.levels).map(([level, count]) => (
                      <div key={level} className="flex justify-between items-center">
                        <span>Level {level}</span>
                        <span className="font-bold">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {analytics && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Rank Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(analytics.rankDistribution).map(([rank, count]) => (
                          <div key={rank} className="flex justify-between items-center">
                            <span className="capitalize">{rank}</span>
                            <span className="font-bold">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Team Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Average Team Size</span>
                          <span className="font-bold">{analytics.averageTeamSize.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Monthly Sales</span>
                          <span className="font-bold">{formatCurrency(analytics.monthlySales)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
          
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Level</th>
                    <th className="px-6 py-3">Rank</th>
                    <th className="px-6 py-3">Direct Ref</th>
                    <th className="px-6 py-3">Team Size</th>
                    <th className="px-6 py-3">Sales</th>
                    <th className="px-6 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {networkTree.tree?.map((member: any) => (
                    <tr key={member._id} className="bg-white border-b">
                      <td className="px-6 py-4">{member.name}</td>
                      <td className="px-6 py-4">1</td>
                      <td className="px-6 py-4">{member.role}</td>
                      <td className="px-6 py-4">{member.directReferrals || 0}</td>
                      <td className="px-6 py-4">{member.teamSize || 0}</td>
                      <td className="px-6 py-4">{formatCurrency(member.totalSales || 0)}</td>
                      <td className="px-6 py-4">{formatDate(member.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DownlineVisualizer; 