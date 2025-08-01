import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  Building, 
  ShoppingCart,
  UserCheck,
  UserX,
  Calendar,
  BarChart3,
  Download,
  Boxes
} from 'lucide-react';
import { dashboardAPI } from '../../services/api';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalFranchises: number;
  activeUsers: number;
  inactiveUsers: number;
  onlineSales: number;
  offlineSales: number;
  franchiseSales: number;
  directSales: number;
  totalCommissions: number;
  pendingWithdrawals: number;
  totalProducts: number;
  recentOrders: any[];
  topFranchises: any[];
  topProducts: any[];
  salesByMonth: any[];
}

const AdminDashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month, year

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data using the new API
      const response = await dashboardAPI.getAdminOverview(dateRange);
      const data = response.data;

      setStats({
        totalSales: data.sales.totalSales,
        totalOrders: data.sales.totalOrders,
        totalUsers: data.users.totalUsers,
        totalFranchises: data.franchises.totalFranchises,
        activeUsers: data.users.activeUsers,
        inactiveUsers: data.users.inactiveUsers,
        onlineSales: data.sales.onlineSales,
        offlineSales: data.sales.offlineSales,
        franchiseSales: data.sales.franchiseSales,
        directSales: data.sales.directSales,
        totalCommissions: data.franchises.totalCommissions,
        pendingWithdrawals: data.withdrawals.pendingWithdrawals,
        totalProducts: data.products.totalProducts,
        recentOrders: data.recentOrders,
        topFranchises: data.topFranchises,
        topProducts: data.topProducts,
        salesByMonth: data.salesByMonth
      });

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const exportDashboardData = () => {
    if (!stats) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Sales', `₹${stats.totalSales.toLocaleString()}`],
      ['Total Orders', stats.totalOrders],
      ['Total Users', stats.totalUsers],
      ['Total Franchises', stats.totalFranchises],
      ['Active Users', stats.activeUsers],
      ['Inactive Users', stats.inactiveUsers],
      ['Online Sales', `₹${stats.onlineSales.toLocaleString()}`],
      ['Offline Sales', `₹${stats.offlineSales.toLocaleString()}`],
      ['Franchise Sales', `₹${stats.franchiseSales.toLocaleString()}`],
      ['Direct Sales', `₹${stats.directSales.toLocaleString()}`],
      ['Total Commissions', `₹${stats.totalCommissions.toLocaleString()}`],
      ['Pending Withdrawals', `₹${stats.pendingWithdrawals.toLocaleString()}`],
      ['Total Products', stats.totalProducts]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>{error}</p>
        <Button onClick={fetchDashboardData} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-gray-600 p-8">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-gray-600">Complete overview of your MLM system</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <Button onClick={exportDashboardData} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold">₹{stats.totalSales.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Total Franchises</p>
              <p className="text-2xl font-bold">{stats.totalFranchises}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = '/dashboard/inventory'}>
          <div className="flex items-center gap-3">
            <Boxes className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-600">Inventory Management</p>
              <p className="text-sm text-gray-500">Manage stock levels</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = '/dashboard/products'}>
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-sm text-gray-500">Manage product catalog</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = '/dashboard/users'}>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Users</p>
              <p className="text-sm text-gray-500">Manage user accounts</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = '/dashboard/franchises'}>
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Franchises</p>
              <p className="text-sm text-gray-500">Manage franchises</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sales Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Online Sales:</span>
              <span className="font-semibold">₹{stats.onlineSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Offline Sales:</span>
              <span className="font-semibold">₹{stats.offlineSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Franchise Sales:</span>
              <span className="font-semibold">₹{stats.franchiseSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Direct Sales:</span>
              <span className="font-semibold">₹{stats.directSales.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total Sales:</span>
                <span className="font-semibold">₹{stats.totalSales.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            User Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Active Users:</span>
              <span className="font-semibold text-green-600">{stats.activeUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Inactive Users:</span>
              <span className="font-semibold text-red-600">{stats.inactiveUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Commissions:</span>
              <span className="font-semibold">₹{stats.totalCommissions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Withdrawals:</span>
              <span className="font-semibold">₹{stats.pendingWithdrawals.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Products:</span>
              <span className="font-semibold">{stats.totalProducts}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Franchises by Sales</h3>
          <div className="space-y-3">
            {stats.topFranchises.map((franchise: any, index: number) => (
              <div key={franchise._id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <span>{franchise.name}</span>
                </div>
                <span className="font-semibold">₹{(franchise.totalSales || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products by Sales</h3>
          <div className="space-y-3">
            {stats.topProducts.map((product: any, index: number) => (
              <div key={product.productId || index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <span className="truncate max-w-32">{product.productName}</span>
                </div>
                <span className="font-semibold">₹{(product.totalSales || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Orders
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Order ID</th>
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: any) => (
                <tr key={order._id} className="border-b">
                  <td className="py-2 text-sm">{order._id.slice(-8)}</td>
                  <td className="py-2 text-sm">{order.user?.name || 'N/A'}</td>
                  <td className="py-2 text-sm">₹{order.totalAmount?.toLocaleString()}</td>
                  <td className="py-2 text-sm capitalize">{order.orderType}</td>
                  <td className="py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardOverview; 