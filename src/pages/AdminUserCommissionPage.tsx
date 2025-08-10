import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface UserCommissionData {
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    referralCode: string;
    status: string;
    joinedAt: string;
    franchiseId?: {
      name: string;
      district: string;
    };
  };
  summary: {
    totalOrders: number;
    totalSalesAmount: number;
    totalSelfCommissions: number;
    pendingSelfCommissions: number;
    paidSelfCommissions: number;
    avgCommissionRate: number;
    avgOrderValue: number;
  };
  statusBreakdown: Record<string, {
    count: number;
    amount: number;
    commissions: number;
  }>;
  productBreakdown: Array<{
    productName: string;
    totalCommissions: number;
    count: number;
    averagePercentage: number;
    pending: number;
    paid: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    totalCommissions: number;
    totalSales: number;
    orderCount: number;
    pending: number;
    paid: number;
    commissionRate: number;
  }>;
  detailedCommissions: {
    records: Array<{
      orderId: string;
      orderDate: string;
      orderStatus: string;
      orderAmount: number;
      productName: string;
      commissionAmount: number;
      commissionPercentage: number;
      commissionStatus: string;
      paidAt?: string;
      franchise?: {
        name: string;
        district: string;
      };
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  recentEarnings: Array<{
    _id: string;
    amount: number;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

const AdminUserCommissionPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<UserCommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchUserCommissionData();
  }, [userId, dateFrom, dateTo, statusFilter, page]);

  const fetchUserCommissionData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        status: statusFilter,
        page: page.toString(),
        limit: limit.toString(),
      });
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dashboard/admin/user-commission/${userId}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user commission data');
      }
      
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!data) return;
    
    const csvData = data.detailedCommissions.records.map(record => ({
      'Order ID': record.orderId,
      'Order Date': formatDate(record.orderDate),
      'Order Status': record.orderStatus,
      'Order Amount': record.orderAmount,
      'Product Name': record.productName,
      'Commission Amount': record.commissionAmount,
      'Commission %': record.commissionPercentage,
      'Commission Status': record.commissionStatus,
      'Paid At': record.paidAt ? formatDate(record.paidAt) : 'N/A',
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.user.name}_commissions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500 mb-4">❌</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchUserCommissionData()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/users')}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
              >
                <span className="mr-2">←</span>
                Back to Users
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {data.user.name}'s Commission Details
                </h1>
                <p className="text-gray-600">{data.user.email} • {data.user.role}</p>
              </div>
            </div>
            <button 
              onClick={exportData} 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <span className="mr-2">⬇</span>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm">From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40 px-3 py-1 border rounded"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm">To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40 px-3 py-1 border rounded"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm">Status:</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-32 px-3 py-1 border rounded"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">₹{data.summary.totalSalesAmount.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 text-blue-600">💰</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                <p className="text-2xl font-bold">₹{data.summary.totalSelfCommissions.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 text-green-600">📈</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Commissions</p>
                <p className="text-2xl font-bold">₹{data.summary.pendingSelfCommissions.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 text-yellow-600">⏰</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="text-2xl font-bold">{data.summary.avgCommissionRate}%</p>
              </div>
              <div className="h-8 w-8 text-purple-600">📦</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'commissions'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Commission Details
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'analytics'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Info */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">User Information</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{data.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{data.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{data.user.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className={`px-2 py-1 rounded text-sm border ${getStatusColor(data.user.role)}`}>
                        {data.user.role}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(data.user.status)}`}>
                        {data.user.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joined:</span>
                      <span className="font-medium">
                        {formatDate(data.user.joinedAt)}
                      </span>
                    </div>
                    {data.user.franchiseId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Franchise:</span>
                        <span className="font-medium">
                          {data.user.franchiseId.name} ({data.user.franchiseId.district})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Order Status Breakdown</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {Object.entries(data.statusBreakdown).map(([status, info]) => (
                      <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(status)}`}>
                            {status}
                          </span>
                          <span className="text-sm text-gray-600">
                            {info.count} orders
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{info.commissions.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">
                            ₹{info.amount.toLocaleString()} sales
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Commission Records</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Order Date</th>
                        <th className="text-left p-3">Product</th>
                        <th className="text-left p-3">Order Amount</th>
                        <th className="text-left p-3">Commission</th>
                        <th className="text-left p-3">Rate</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Paid At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.detailedCommissions.records.map((record, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {formatDate(record.orderDate)}
                          </td>
                          <td className="p-3">{record.productName}</td>
                          <td className="p-3">₹{record.orderAmount.toLocaleString()}</td>
                          <td className="p-3 font-medium">₹{record.commissionAmount.toLocaleString()}</td>
                          <td className="p-3">{record.commissionPercentage}%</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-sm ${getStatusColor(record.commissionStatus)}`}>
                              {record.commissionStatus}
                            </span>
                          </td>
                          <td className="p-3">
                            {record.paidAt ? formatDate(record.paidAt) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {data.detailedCommissions.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Showing {data.detailedCommissions.records.length} of{' '}
                      {data.detailedCommissions.pagination.totalRecords} records
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={!data.detailedCommissions.pagination.hasPrev}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm">
                        Page {data.detailedCommissions.pagination.currentPage} of{' '}
                        {data.detailedCommissions.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={!data.detailedCommissions.pagination.hasNext}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend - Simplified */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Monthly Sales & Commission Trend</h3>
                </div>
                <div className="p-6">
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Monthly trend chart would be displayed here
                    <br />
                    (Chart.js integration needed)
                  </div>
                </div>
              </div>

              {/* Commission by Status - Simplified */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Commission by Order Status</h3>
                </div>
                <div className="p-6">
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Status breakdown chart would be displayed here
                    <br />
                    (Chart.js integration needed)
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow lg:col-span-2">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Top Products by Commission</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {data.productBreakdown.slice(0, 5).map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{product.productName}</div>
                          <div className="text-sm text-gray-600">
                            {product.count} orders • {product.averagePercentage.toFixed(1)}% avg rate
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹{product.totalCommissions.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">
                            Pending: ₹{product.pending.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserCommissionPage;
