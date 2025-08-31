import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { Navigate, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import Modal from '../components/ui/Modal';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  referralCode?: string;
  referredBy?: {
    _id: string;
    name: string;
    email: string;
    referralCode?: string;
  } | null;
}

interface SalesOverview {
  targetUser: {
    _id: string;
    name: string;
    email: string;
    role: string;
    personalSales: {
      _id: string | null;
      totalOrders: number;
      totalAmount: number;
      totalCommission: number;
      avgOrderValue: number;
      statusBreakdown: Array<{
        status: string;
        amount: number;
      }>;
      statusSummary: {
        [key: string]: {
          count: number;
          amount: number;
        };
      };
    };
  };
  networkSummary: {
    totalNetworkSize: number;
    maxLevel: number;
    totalNetworkSales: {
      totalOrders: number;
      totalAmount: number;
      totalCommission: number;
    };
  };
  levelSummary: {
    [key: string]: {
      userCount: number;
      totalOrders: number;
      totalAmount: number;
      totalCommission: number;
    };
  };
  topPerformers: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    uplineId: string;
    createdAt: string;
    level: number;
    sales: {
      totalOrders: number;
      totalAmount: number;
      totalCommission: number;
    };
  }>;
}

interface Commission {
  _id: string;
  amount: number;
  type: 'direct' | 'level' | 'rank' | 'reward';
  description: string;
  date: string;
  status: 'pending' | 'completed';
}

interface SalesOverviewExtended extends SalesOverview {
  downlineDetails: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    uplineId: string;
    createdAt: string;
    level: number;
    sales: {
      totalOrders: number;
      totalAmount: number;
      totalCommission: number;
    };
  }>;
  recentOrders: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    items: Array<any>;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    [key: string]: any;
  }>;
  filters: {
    dateFrom: string | null;
    dateTo: string | null;
    levels: string;
  };
}

export default function UserNetworkManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [downlineUsers, setDownlineUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [salesOverviewUser, setSalesOverviewUser] = useState<User | null>(null);
  const [salesOverview, setSalesOverview] = useState<SalesOverview | null>(null);
  const [loadingSalesOverview, setLoadingSalesOverview] = useState(false);
  const [salesDateRange, setSalesDateRange] = useState({ startDate: '', endDate: '' });
  
  // Commission modal state
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionUser, setCommissionUser] = useState<User | null>(null);
  const [commissionData, setCommissionData] = useState<Commission[]>([]);
  const [loadingCommission, setLoadingCommission] = useState(false);
  const [commissionStats, setCommissionStats] = useState<{
    totalEarnings: number;
    pendingEarnings: number;
    thisMonth: number;
    lastMonth: number;
  }>({
    totalEarnings: 0,
    pendingEarnings: 0,
    thisMonth: 0,
    lastMonth: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    
    // Fetch only downline users for the current user
    axios.get('/network/downline', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setDownlineUsers(res.data.data);
        setError(null);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to fetch downline users');
      })
      .finally(() => setLoading(false));
  }, []);

  // Function to fetch commission data for a user
  const handleCommissionView = async (user: User) => {
    setCommissionUser(user);
    setShowCommissionModal(true);
    setLoadingCommission(true);
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await axios.get(`/earnings?userId=${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCommissionData(response.data.earnings || []);
      setCommissionStats(response.data.stats || {
        totalEarnings: 0,
        pendingEarnings: 0,
        thisMonth: 0,
        lastMonth: 0
      });
    } catch (error: any) {
      // Ensure UI does not show stale upline data if request fails
      setCommissionData([]);
      setCommissionStats({ totalEarnings: 0, pendingEarnings: 0, thisMonth: 0, lastMonth: 0 });
      toast.error(error.response?.data?.message || 'Failed to fetch commission data');
    } finally {
      setLoadingCommission(false);
    }
  };

  // Search logic
  const filteredUsers = downlineUsers.filter(u => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(searchText) ||
      u.email.toLowerCase().includes(searchText) ||
      (u.referralCode?.toLowerCase().includes(searchText) ?? false);
    return matchesSearch;
  });

  // Sales Overview functionality
  const handleSalesOverview = async (user: User) => {
    setSalesOverviewUser(user);
    setLoadingSalesOverview(true);
    const token = localStorage.getItem('token');
    
    try {
      const params = new URLSearchParams();
      if (salesDateRange.startDate) params.append('dateFrom', salesDateRange.startDate);
      if (salesDateRange.endDate) params.append('dateTo', salesDateRange.endDate);
      
      const response = await axios.get(`/dashboard/user-sales/${user._id}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalesOverview(response.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch sales overview');
      setSalesOverview(null);
    } finally {
      setLoadingSalesOverview(false);
    }
  };

  const closeSalesOverviewModal = () => {
    setSalesOverviewUser(null);
    setSalesOverview(null);
    setSalesDateRange({ startDate: '', endDate: '' });
  };
  
  const closeCommissionModal = () => {
    setShowCommissionModal(false);
    setCommissionUser(null);
    setCommissionData([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[300px]"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <h2 className="text-2xl font-bold mb-4">My Network Users</h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
      
      {downlineUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">You don't have any downline users yet.</p>
          <p>Share your referral code to start building your network!</p>
          <div className="mt-4 p-3 bg-gray-100 rounded-lg inline-block">
            <span className="font-semibold">{user?.referralCode}</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referral Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredUsers.map(u => (
                <tr key={u._id}>
                  <td className="px-4 py-2 whitespace-nowrap">{u.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{u.email}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{u.phone || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{u.role}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{u.referralCode || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button
                      className="text-green-600 hover:underline text-xs"
                      onClick={() => handleSalesOverview(u)}
                    >Sales</button>
                    <button
                      className="text-purple-600 hover:underline text-xs"
                      onClick={() => handleCommissionView(u)}
                    >Commission</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Sales Overview Modal */}
      {salesOverviewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Sales Overview - {salesOverviewUser.name}</h3>
              <button
                onClick={closeSalesOverviewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {/* Date Range Filter */}
            <div className="mb-4 flex gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={salesDateRange.startDate}
                  onChange={(e) => setSalesDateRange({ ...salesDateRange, startDate: e.target.value })}
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={salesDateRange.endDate}
                  onChange={(e) => setSalesDateRange({ ...salesDateRange, endDate: e.target.value })}
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => handleSalesOverview(salesOverviewUser)}
                  className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90"
                  disabled={loadingSalesOverview}
                >
                  {loadingSalesOverview ? 'Loading...' : 'Apply Filter'}
                </button>
              </div>
            </div>
            
            {loadingSalesOverview ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : salesOverview ? (
              <div className="space-y-6">
                {/* Personal Sales */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-blue-800 mb-3">Personal Sales</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(salesOverview.targetUser.personalSales.totalAmount)}</p>
                      <p className="text-sm text-gray-600">Total Sales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{salesOverview.targetUser.personalSales.totalOrders}</p>
                      <p className="text-sm text-gray-600">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(salesOverview.targetUser.personalSales.avgOrderValue)}</p>
                      <p className="text-sm text-gray-600">Avg Order Value</p>
                    </div>
                  </div>
                </div>
                
                {/* Network Sales */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-green-800 mb-3">Network Sales</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(salesOverview.networkSummary.totalNetworkSales.totalAmount)}</p>
                      <p className="text-sm text-gray-600">Total Sales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{salesOverview.networkSummary.totalNetworkSales.totalOrders}</p>
                      <p className="text-sm text-gray-600">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{salesOverview.networkSummary.totalNetworkSize}</p>
                      <p className="text-sm text-gray-600">Network Size</p>
                    </div>
                  </div>
                </div>
                
                {/* Sales by Level */}
                {Object.keys(salesOverview.levelSummary).length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold mb-3">Sales by Level</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(salesOverview.levelSummary).map(([level, data]) => (
                            <tr key={level}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">Level {level}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(data.totalAmount)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{data.totalOrders}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{data.userCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Top Performers */}
                {salesOverview.topPerformers.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold mb-3">Top Performers</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {salesOverview.topPerformers.map((performer) => (
                            <tr key={performer._id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{performer.name}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{performer.email}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(performer.sales.totalAmount)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{performer.sales.totalOrders}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">Level {performer.level}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Recent Orders */}
                {salesOverview.recentOrders.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold mb-3">Recent Orders</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {salesOverview.recentOrders.map((order) => (
                            <tr key={order._id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">{order._id}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(order.totalAmount)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{order.user.name}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{order.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sales data available for this user.
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Commission Modal */}
      {showCommissionModal && commissionUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Commission Details - {commissionUser.name}</h3>
              <button
                onClick={closeCommissionModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {loadingCommission ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-gray-500 text-sm font-medium">Total Earnings</h4>
                    <p className="text-xl font-bold text-gray-900">₹{(commissionStats.totalEarnings || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-gray-500 text-sm font-medium">Pending Earnings</h4>
                    <p className="text-xl font-bold text-gray-900">₹{(commissionStats.pendingEarnings || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-gray-500 text-sm font-medium">This Month</h4>
                    <p className="text-xl font-bold text-gray-900">₹{(commissionStats.thisMonth || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-gray-500 text-sm font-medium">Last Month</h4>
                    <p className="text-xl font-bold text-gray-900">₹{(commissionStats.lastMonth || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                {/* Earnings History */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h4 className="text-md font-semibold">Earnings History</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {commissionData.length > 0 ? (
                          commissionData.map((earning) => (
                            <tr key={earning._id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(earning.date), 'MMM dd, yyyy')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">
                                {earning.type}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {earning.description}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₹{earning.amount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  earning.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {earning.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                              No earnings history found for this user.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}