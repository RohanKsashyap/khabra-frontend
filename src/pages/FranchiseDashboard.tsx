import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/Card';
import FranchiseNetworkTree from '../components/franchise/FranchiseNetworkTree';
import { Link } from 'react-router-dom';
import FranchiseCreateOrderPage from './FranchiseCreateOrderPage';
import { saveAs } from 'file-saver';

const API_BASE = import.meta.env.VITE_API_URL;

interface Franchise {
  _id: string;
  name: string;
  commissionPercentage: number;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: string;
  openingDate: string;
  location?: string;
  district?: string;
  ownerId?: string;
  totalDownline?: number;
  totalCommission?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Sales {
  online: number;
  offline: number;
  total: number;
  totalProductsSold?: number;
}

interface FranchiseSalesData {
  franchise: Franchise;
  sales: Sales;
  totalCommission: number;
  downlineCount: number;
  downlineMembers?: any[];
  orders?: any[];
}

const FranchiseDashboard: React.FC = () => {
  const [data, setData] = useState<FranchiseSalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'createOrder' | 'orders'>('overview');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderDetailModal, setOrderDetailModal] = useState<any | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(`${API_BASE}/api/v1/franchises/my/sales`, config);
        setData(response.data.data);
      } catch (err) {
        setError('Failed to load franchise sales data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!data?.orders) return [];
    return data.orders.filter(order =>
      (!orderStatusFilter || order.status === orderStatusFilter) &&
      (!orderSearch || ((order.guestName || (order.user && order.user.name) || '').toLowerCase().includes(orderSearch.toLowerCase()))) &&
      (!paymentMethodFilter || order.paymentMethod === paymentMethodFilter) &&
      (!dateFrom || (order.createdAt && new Date(order.createdAt) >= new Date(dateFrom))) &&
      (!dateTo || (order.createdAt && new Date(order.createdAt) <= new Date(dateTo + 'T23:59:59')))
    );
  }, [data?.orders, orderStatusFilter, orderSearch, paymentMethodFilter, dateFrom, dateTo]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data || !data.franchise) return <div className="p-8 text-center">No franchise data found.</div>;

  const { franchise, sales, totalCommission, downlineCount } = data;
  const totalSales = sales?.total ?? 0;
  const commission = totalCommission ?? 0;
  // If totalProductsSold is not present in sales, default to 0
  const totalProductsSold = sales?.totalProductsSold ?? 0;

  // Export CSV logic
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Amount', 'Status', 'Payment', 'Date'];
    const rows = filteredOrders.map(order => [
      order._id,
      order.guestName || (order.user && order.user.name) || 'N/A',
      order.totalAmount,
      order.status,
      order.paymentMethod,
      order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `franchise_orders_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Welcome, {franchise.contactPerson || franchise.name}!</h2>
      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`px-6 py-2 font-semibold border-b-2 transition-colors duration-150 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-600'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-6 py-2 font-semibold border-b-2 transition-colors duration-150 ${activeTab === 'createOrder' ? 'border-primary text-primary' : 'border-transparent text-gray-600'}`}
          onClick={() => setActiveTab('createOrder')}
        >
          Create Order
        </button>
        <button
          className={`px-6 py-2 font-semibold border-b-2 transition-colors duration-150 ${activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-gray-600'}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Card className="p-8 max-w-2xl mx-auto shadow-lg border border-gray-200">
          <h3 className="text-2xl font-semibold mb-4 text-primary">{franchise.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="mb-1"><strong>Commission Percentage:</strong> {franchise.commissionPercentage ?? 0}%</p>
              <p className="mb-1"><strong>Status:</strong> <span className={franchise.status === 'active' ? 'text-green-600' : 'text-red-600'}>{franchise.status}</span></p>
              <p className="mb-1"><strong>Opening Date:</strong> {franchise.openingDate ? new Date(franchise.openingDate).toLocaleDateString() : '-'}</p>
            </div>
            <div>
              <p className="mb-1"><strong>Contact Person:</strong> {franchise.contactPerson}</p>
              <p className="mb-1"><strong>Phone:</strong> {franchise.phone}</p>
              <p className="mb-1"><strong>Email:</strong> {franchise.email}</p>
              <p className="mb-1"><strong>Address:</strong> {franchise.address}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mt-6 justify-center">
            <div className="bg-gray-50 rounded-lg p-6 flex-1 text-center border border-gray-100">
              <div className="text-lg font-medium text-gray-600 mb-2">Total Sales</div>
              <div className="text-2xl font-bold text-primary mb-1">₹{(totalSales ?? 0).toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 flex-1 text-center border border-gray-100">
              <div className="text-lg font-medium text-gray-600 mb-2">Products Sold</div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{totalProductsSold ?? 0}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 flex-1 text-center border border-gray-100">
              <div className="text-lg font-medium text-gray-600 mb-2">Commission Earned</div>
              <div className="text-2xl font-bold text-green-600 mb-1">₹{(commission ?? 0).toLocaleString()}</div>
            </div>
          </div>
        </Card>
      )}
      {activeTab === 'overview' && franchise && franchise._id && (
        <FranchiseNetworkTree franchiseId={franchise._id} />
      )}
      {activeTab === 'createOrder' && (
        <FranchiseCreateOrderPage />
      )}
      {activeTab === 'orders' && (
        <Card className="p-6 max-w-4xl mx-auto shadow-lg border border-gray-200">
          <h3 className="text-2xl font-semibold mb-4 text-primary">Order History</h3>
          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white rounded-md font-semibold"
              onClick={handleExportCSV}
            >
              Export CSV
            </button>
            <input
              type="text"
              placeholder="Search by customer name"
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={orderStatusFilter}
              onChange={e => setOrderStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
            <select
              value={paymentMethodFilter}
              onChange={e => setPaymentMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Payment Methods</option>
              <option value="cod">Cash/UPI/Card (In-store)</option>
              <option value="card">Card (Online)</option>
              <option value="upi">UPI (Online)</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="From"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="To"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Order ID</th>
                  <th className="px-4 py-2 border">Customer</th>
                  <th className="px-4 py-2 border">Amount</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Payment</th>
                  <th className="px-4 py-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setOrderDetailModal(order)}>
                    <td className="px-4 py-2 border">{order._id}</td>
                    <td className="px-4 py-2 border">{order.guestName || (order.user && order.user.name) || 'N/A'}</td>
                    <td className="px-4 py-2 border">₹{order.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-2 border capitalize">{order.status}</td>
                    <td className="px-4 py-2 border">{order.paymentMethod}</td>
                    <td className="px-4 py-2 border">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Order Detail Modal */}
          {orderDetailModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setOrderDetailModal(null)}>&times;</button>
                <h4 className="text-xl font-bold mb-2">Order Details</h4>
                <div className="mb-2"><strong>Order ID:</strong> {orderDetailModal._id}</div>
                <div className="mb-2"><strong>Customer:</strong> {orderDetailModal.guestName || (orderDetailModal.user && orderDetailModal.user.name) || 'N/A'}</div>
                <div className="mb-2"><strong>Status:</strong> {orderDetailModal.status}</div>
                <div className="mb-2"><strong>Payment:</strong> {orderDetailModal.paymentMethod}</div>
                <div className="mb-2"><strong>Date:</strong> {orderDetailModal.createdAt ? new Date(orderDetailModal.createdAt).toLocaleString() : '-'}</div>
                <div className="mb-2"><strong>Total Amount:</strong> ₹{orderDetailModal.totalAmount?.toLocaleString()}</div>
                <div className="mb-2"><strong>Shipping Address:</strong> {orderDetailModal.shippingAddress ? `${orderDetailModal.shippingAddress.fullName}, ${orderDetailModal.shippingAddress.addressLine1}, ${orderDetailModal.shippingAddress.city}` : '-'}</div>
                <div className="mb-2"><strong>Billing Address:</strong> {orderDetailModal.billingAddress ? `${orderDetailModal.billingAddress.fullName}, ${orderDetailModal.billingAddress.addressLine1}, ${orderDetailModal.billingAddress.city}` : '-'}</div>
                <div className="mb-2"><strong>Items:</strong></div>
                <ul className="mb-2 pl-4 list-disc">
                  {orderDetailModal.items?.map((item: any, idx: number) => (
                    <li key={idx}>
                      {item.productName} × {item.quantity} — ₹{item.productPrice} each
                    </li>
                  ))}
                </ul>
                {orderDetailModal.notes && <div className="mb-2"><strong>Notes:</strong> {orderDetailModal.notes}</div>}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default FranchiseDashboard; 