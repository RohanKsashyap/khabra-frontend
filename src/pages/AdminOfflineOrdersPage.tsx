import React, { useState, useEffect } from 'react';
import { orderAPI, franchiseAPI } from '../services/api';
import { format } from 'date-fns';
import AdminAddOrderPage from './AdminAddOrderPage';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const AdminOfflineOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [franchiseFilter, setFranchiseFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const { user } = useAuth();

  const fetchOfflineOrders = async () => {
    try {
      setIsLoading(true);
      const [ordersRes, franchisesRes] = await Promise.all([
        orderAPI.fetchOrders(true),
        franchiseAPI.getAllFranchises()
      ]);
      const offlineOrders = ordersRes.data.filter(
        (order: any) => order.orderType === 'offline'
      );
      setAllOrders(offlineOrders);
      setOrders(offlineOrders);
      setFranchises(franchisesRes.data || []);
    } catch (err) {
      setError('Failed to fetch offline orders.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfflineOrders();
    // eslint-disable-next-line
  }, []);

  // Filter orders based on selected filters
  useEffect(() => {
    let filtered = allOrders;
    
    if (franchiseFilter) {
      filtered = filtered.filter((order: any) => 
        order.franchise && order.franchise.name === franchiseFilter
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter((order: any) => order.status === statusFilter);
    }
    
    if (dateFrom) {
      filtered = filtered.filter((order: any) => 
        new Date(order.createdAt) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      filtered = filtered.filter((order: any) => 
        new Date(order.createdAt) <= new Date(dateTo)
      );
    }
    
    setOrders(filtered);
  }, [allOrders, franchiseFilter, statusFilter, dateFrom, dateTo]);

  // Modal overlay
  const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full relative p-4">
        <button
          className="absolute top-4 right-12 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="text-center p-8">Loading offline orders...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center justify-between">
        <span>Manage Offline Orders</span>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowAddOrderModal(true)}>
            Add Order
          </Button>
        )}
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Franchise</label>
            <select
              value={franchiseFilter}
              onChange={(e) => setFranchiseFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Franchises</option>
              {franchises.map(franchise => (
                <option key={franchise._id} value={franchise.name}>
                  {franchise.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Franchise</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Total Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(order => (
                <tr key={order._id} className="bg-white border-b">
                  <td className="px-6 py-4 font-medium text-gray-900">{order._id}</td>
                  <td className="px-6 py-4">{order.user?.name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    {order.franchise?.name ? (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        {order.franchise.name}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{format(new Date(order.createdAt), 'PPpp')}</td>
                  <td className="px-6 py-4">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  No offline orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showAddOrderModal && (
        <Modal onClose={() => setShowAddOrderModal(false)}>
          <AdminAddOrderPageWrapper onSuccess={() => {
            setShowAddOrderModal(false);
            fetchOfflineOrders();
          }} />
        </Modal>
      )}
    </div>
  );
};

// Wrapper to handle onSuccess for AdminAddOrderPage
const AdminAddOrderPageWrapper: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [orderCreated, setOrderCreated] = useState(false);

  useEffect(() => {
    if (orderCreated) {
      onSuccess();
    }
  }, [orderCreated, onSuccess]);

  if (orderCreated) {
    return null;
  }

  return (
    <AdminAddOrderPageWithSuccess onOrderCreated={() => setOrderCreated(true)} />
  );
};

// Patch AdminAddOrderPage to accept onOrderCreated prop
const AdminAddOrderPageWithSuccess: React.FC<{ onOrderCreated: () => void }> = ({ onOrderCreated }) => {
  // Copy the original AdminAddOrderPage logic, but call onOrderCreated after success
  // For brevity, we import and patch the onSubmit in the AdminAddOrderPage file if needed
  // Here, we assume AdminAddOrderPage accepts an onOrderCreated prop, otherwise, you can refactor it
  // For now, we use a hacky approach: monkey-patch alert
  const originalAlert = window.alert;
  window.alert = (msg: string) => {
    if (msg.toLowerCase().includes('success')) {
      onOrderCreated();
    }
    originalAlert(msg);
  };
  return <AdminAddOrderPage />;
};

export default AdminOfflineOrdersPage; 