import React, { useState, useEffect } from 'react';
import { useMLMStore } from '../../store/mlmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { formatCurrency, formatDate } from '../../lib/utils';
import { mlmAPI } from '../../services/api';
import '../../styles/TreeNode.css';
import { LoadingState } from '../ui/LoadingState';

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
    <div className="node relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="name">{user.name} (Level {level})</div>
          <div className="id">ID: {user.referralCode}</div>
          <div className="id">Email: {user.email}</div>
          <div className="rank" style={{ color: '#c0392b' }}>Rank: {user.role}</div>
          {user.createdAt && (
            <div className="text-xs text-gray-500">Joined: {formatDate(user.createdAt)}</div>
          )}
        </div>
        {hasChildren && (
          <Button 
            onClick={onToggle}
            className="ml-2 px-2 py-1 text-xs"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        )}
      </div>
      
      {upline && (
        <div className="text-xs mt-2 text-gray-500">
          Upline: {upline.name} ({upline.referralCode})
        </div>
      )}
      
      <div className="mt-2 text-xs">
        <div className="flex justify-between">
          <span>Direct Ref:</span>
          <span className="font-medium">{user.directReferrals || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Team Size:</span>
          <span className="font-medium">{user.teamSize || 0}</span>
        </div>
        {user.totalSales && (
          <div className="flex justify-between">
            <span>Sales:</span>
            <span className="font-medium">{formatCurrency(user.totalSales)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

function renderTree(nodes: any[], level = 1, expandedNodes: Set<string>, onToggleNode: (nodeId: string) => void): React.ReactElement | null {
  if (!nodes || nodes.length === 0) return null;
  return (
    <ul>
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
      <LoadingState message="Loading your downline network..." size="md" />
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center p-8 text-red-500">{error?.toString() || 'An error occurred.'}</div>
        </CardContent>
      </Card>
    );
  }

  if (!networkTree) {
    return (
      <Card>
        <CardContent>
          <div className="text-center p-8 text-gray-500">
            No network data found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{analytics?.totalMembers || downlineStats?.totalMembers || 0}</div>
            <div className="text-sm text-gray-500">Total Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{analytics?.activeMembers || downlineStats?.activeMembers || 0}</div>
            <div className="text-sm text-gray-500">Active Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(analytics?.totalSales || downlineStats?.totalSales || 0)}</div>
            <div className="text-sm text-gray-500">Total Sales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{networkTree.stats?.direct || 0}</div>
            <div className="text-sm text-gray-500">Direct Referrals</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Downline Visualizer</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex border rounded-md">
                <Button
                  className={viewMode === 'tree' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}
                  onClick={() => setViewMode('tree')}
                >
                  Tree View
                </Button>
                <Button
                  className={viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}
                  onClick={() => setViewMode('list')}
                >
                  List View
                </Button>
                <Button
                  className={viewMode === 'stats' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}
                  onClick={() => setViewMode('stats')}
                >
                  Stats View
                </Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={expandAll}>Expand All</Button>
                <Button onClick={collapseAll}>Collapse All</Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                            <span className="font-bold">{count}</span>
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