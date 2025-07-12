import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import FranchiseNetworkTree from '../components/franchise/FranchiseNetworkTree';
import { ArrowLeft, Users, DollarSign, Package, TrendingUp, Calendar } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

interface FranchiseDetail {
  franchise: {
    _id: string;
    name: string;
    district: string;
    address: string;
    contactPerson: string;
    phone: string;
    email: string;
    status: 'active' | 'inactive';
    commissionPercentage: number;
    createdAt: string;
    ownerId: {
      _id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
  orders: Array<{
    _id: string;
    totalAmount: number;
    status: string;
    orderType: 'online' | 'offline';
    paymentMethod: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
    createdBy: {
      name: string;
      email: string;
    };
  }>;
  downlineMembers: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
  }>;
  statistics: {
    totalOrders: number;
    onlineSales: number;
    offlineSales: number;
    totalSales: number;
    totalCommission: number;
    downlineCount: number;
  };
}

const AdminFranchiseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<FranchiseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'downline' | 'network'>('overview');
  const [orderFilter, setOrderFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchFranchiseDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(`${API_BASE}/api/v1/franchises/${id}/details`, config);
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load franchise details');
      } finally {
        setLoading(false);
      }
    };

    fetchFranchiseDetails();
  }, [id]);

  const filteredOrders = data?.orders.filter(order => {
    const matchesSearch = order.user.name.toLowerCase().includes(orderFilter.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(orderFilter.toLowerCase()) ||
                         order._id.toLowerCase().includes(orderFilter.toLowerCase());
    const matchesStatus = !orderStatusFilter || order.status === orderStatusFilter;
    const matchesDate = !dateFrom || new Date(order.createdAt) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(order.createdAt) <= new Date(dateTo);
    
    return matchesSearch && matchesStatus && matchesDate && matchesDateTo;
  }) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <Link to="/dashboard/franchises">
          <Button>Back to Franchises</Button>
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600 mb-4">Franchise not found</div>
        <Link to="/dashboard/franchises">
          <Button>Back to Franchises</Button>
        </Link>
      </div>
    );
  }

  const { franchise, statistics } = data;

  const TabButton: React.FC<{ tab: string; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === tab 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard/franchises">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Franchises
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{franchise.name}</h1>
          <p className="text-gray-600">{franchise.district}, {franchise.address}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold">₹{statistics.totalSales.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{statistics.totalOrders}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Downline Members</p>
              <p className="text-2xl font-bold">{statistics.downlineCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Commission Earned</p>
              <p className="text-2xl font-bold">₹{statistics.totalCommission.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Franchise Info */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Franchise Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Basic Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {franchise.name}</p>
              <p><span className="font-medium">District:</span> {franchise.district}</p>
              <p><span className="font-medium">Address:</span> {franchise.address}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  franchise.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {franchise.status}
                </span>
              </p>
              <p><span className="font-medium">Commission:</span> {franchise.commissionPercentage}%</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Contact Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Owner:</span> {franchise.ownerId.name}</p>
              <p><span className="font-medium">Contact Person:</span> {franchise.contactPerson}</p>
              <p><span className="font-medium">Phone:</span> {franchise.phone}</p>
              <p><span className="font-medium">Email:</span> {franchise.email}</p>
              <p><span className="font-medium">Created:</span> {new Date(franchise.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <TabButton tab="overview" label="Overview" icon={<TrendingUp className="h-4 w-4" />} />
        <TabButton tab="orders" label="Orders" icon={<Package className="h-4 w-4" />} />
        <TabButton tab="downline" label="Downline" icon={<Users className="h-4 w-4" />} />
        <TabButton tab="network" label="Network" icon={<Users className="h-4 w-4" />} />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Online Sales:</span>
                <span className="font-semibold">₹{statistics.onlineSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Offline Sales:</span>
                <span className="font-semibold">₹{statistics.offlineSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total Sales:</span>
                <span className="font-semibold">₹{statistics.totalSales.toLocaleString()}</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Orders:</span>
                <span className="font-semibold">{statistics.totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span>Downline Members:</span>
                <span className="font-semibold">{statistics.downlineCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Commission Earned:</span>
                <span className="font-semibold">₹{statistics.totalCommission.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'orders' && (
        <Card className="p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Search orders..."
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border text-left">Order ID</th>
                  <th className="px-4 py-2 border text-left">Customer</th>
                  <th className="px-4 py-2 border text-left">Amount</th>
                  <th className="px-4 py-2 border text-left">Type</th>
                  <th className="px-4 py-2 border text-left">Status</th>
                  <th className="px-4 py-2 border text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-sm">{order._id.slice(-8)}</td>
                    <td className="px-4 py-2 border">
                      <div>
                        <div className="font-medium">{order.user.name}</div>
                        <div className="text-sm text-gray-600">{order.user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2 border">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.orderType === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {order.orderType}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">No orders found</div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'downline' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Downline Members ({data.downlineMembers.length})</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border text-left">Name</th>
                  <th className="px-4 py-2 border text-left">Email</th>
                  <th className="px-4 py-2 border text-left">Phone</th>
                  <th className="px-4 py-2 border text-left">Role</th>
                  <th className="px-4 py-2 border text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.downlineMembers.map(member => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border font-medium">{member.name}</td>
                    <td className="px-4 py-2 border">{member.email}</td>
                    <td className="px-4 py-2 border">{member.phone}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${
                        member.role === 'distributor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-sm">{new Date(member.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.downlineMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">No downline members found</div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'network' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Network Tree</h3>
          <FranchiseNetworkTree franchiseId={franchise._id} />
        </Card>
      )}
    </div>
  );
};

export default AdminFranchiseDetailPage; 