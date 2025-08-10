import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { Navigate, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

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

const roles = ['user', 'franchise', 'admin'];

function exportToCSV(users: User[]) {
  const headers = ['Name', 'Email', 'Phone', 'Role', 'Referral Code', 'Referred By'];
  const rows = users.map(u => [
    u.name,
    u.email,
    u.phone || '-',
    u.role,
    u.referralCode || '-',
    u.referredBy ? `${u.referredBy.name} (${u.referredBy.email})` : '-'
  ]);
  const csvContent = [headers, ...rows].map(e => e.map(x => `"${x}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'users.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [processingDelete, setProcessingDelete] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [salesOverviewUser, setSalesOverviewUser] = useState<User | null>(null);
  const [salesOverview, setSalesOverview] = useState<SalesOverview | null>(null);
  const [loadingSalesOverview, setLoadingSalesOverview] = useState(false);
  const [salesDateRange, setSalesDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    axios.get('/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUsers(res.data);
        setError(null);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to fetch users');
      })
      .finally(() => setLoading(false));
  }, []);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Search and filter logic
  const filteredUsers = users.filter(u => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(searchText) ||
      u.email.toLowerCase().includes(searchText) ||
      (u.referralCode?.toLowerCase().includes(searchText) ?? false) ||
      (u.referredBy?.name?.toLowerCase().includes(searchText) ?? false) ||
      (u.referredBy?.email?.toLowerCase().includes(searchText) ?? false);
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // Bulk selection handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  // Delete user handler
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setProcessingDelete(true);
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users => users.filter(u => u._id !== id));
      toast.success('User deleted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setProcessingDelete(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected for deletion.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected users?`)) return;

    setProcessingDelete(true);
    const token = localStorage.getItem('token');
    try {
      await axios.delete('/users', {
        headers: { Authorization: `Bearer ${token}` },
        data: { userIds: selectedUsers },
      });
      setUsers(users => users.filter(u => !selectedUsers.includes(u._id)));
      toast.success(`${selectedUsers.length} users deleted successfully!`);
      setSelectedUsers([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete selected users.');
    } finally {
      setProcessingDelete(false);
    }
  };

  // Edit user handler (opens modal)
  const handleEdit = (user: User) => {
    setEditUser({ ...user });
  };

  // Save edit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSavingEdit(true);
    const token = localStorage.getItem('token');
    try {
      const { name, phone, role } = editUser;
      const res = await axios.put(`/users/${editUser._id}`, { name, phone, role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users => users.map(u => u._id === editUser._id ? res.data.user : u));
      setEditUser(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSavingEdit(false);
    }
  };

  // Close edit modal
  const closeEditModal = () => setEditUser(null);

  // Sales Overview functionality
  const handleSalesOverview = async (user: User) => {
    setSalesOverviewUser(user);
    setLoadingSalesOverview(true);
    const token = localStorage.getItem('token');
    
    try {
      const params = new URLSearchParams();
      if (salesDateRange.startDate) params.append('startDate', salesDateRange.startDate);
      if (salesDateRange.endDate) params.append('endDate', salesDateRange.endDate);
      
      const response = await axios.get(`/dashboard/admin/user-sales/${user._id}?${params}`, {
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
      <h2 className="text-2xl font-bold mb-4">All Users</h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={processingDelete}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-600/90 disabled:bg-red-400"
            >
              {processingDelete ? 'Deleting...' : `Delete Selected (${selectedUsers.length})`}
            </button>
          )}
          <button
            onClick={() => exportToCSV(filteredUsers)}
            className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                  disabled={filteredUsers.length === 0}
                />
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referral Code</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referred By</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredUsers.map(u => (
              <tr key={u._id}>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u._id)}
                    onChange={() => handleSelectOne(u._id)}
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{u.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.phone || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.role}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.referralCode || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {u.referredBy ? `${u.referredBy.name} (${u.referredBy.email})` : '-'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                  <button
                    className="text-blue-600 hover:underline text-xs"
                    onClick={() => handleEdit(u)}
                  >Edit</button>
                  <button
                    className="text-green-600 hover:underline text-xs"
                    onClick={() => handleSalesOverview(u)}
                  >Sales</button>
                  <button
                    className="text-purple-600 hover:underline text-xs"
                    onClick={() => navigate(`/dashboard/user-commission/${u._id}`)}
                  >Commission</button>
                  <button
                    className="text-red-600 hover:underline text-xs"
                    onClick={() => handleDelete(u._id)}
                    disabled={processingDelete}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <form onSubmit={handleEditSave}>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input className="border rounded px-3 py-2 w-full" value={editUser.name}
                  onChange={e => setEditUser({ ...editUser, name: e.target.value })} required />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className="border rounded px-3 py-2 w-full" value={editUser.phone || ''}
                  onChange={e => setEditUser({ ...editUser, phone: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select className="border rounded px-3 py-2 w-full" value={editUser.role}
                  onChange={e => setEditUser({ ...editUser, role: e.target.value })} required>
                  {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={closeEditModal} disabled={savingEdit}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-primary text-white" disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
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
                    <h4 className="text-md font-semibold mb-3">Top 3 Performers</h4>
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
                          {salesOverview.topPerformers.map((performer, index) => (
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
                    <h4 className="text-md font-semibold mb-3">Recent Orders (Last 10)</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {salesOverview.recentOrders.map((order) => (
                            <tr key={order._id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">{order._id}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(order.totalAmount)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{order.user.name} ({order.user.email})</td>
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
    </div>
  );
}
