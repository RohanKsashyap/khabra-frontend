import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderAPI } from '../services/api';
import { useOrderStore } from '../store/orderStore';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types';
import { ReviewForm } from '../components/review/ReviewForm';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrder, fetchOrderById, cancelOrder } = useOrderStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
    deliveryNotes: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [selectedProductForReturn, setSelectedProductForReturn] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  const handleStatusUpdate = async () => {
    if (!orderId) return;
    
    try {
      setIsUpdating(true);
      await orderAPI.updateOrderStatus(orderId, newStatus, trackingInfo);
      await fetchOrderById(orderId);
      toast.success('Order status updated successfully');
      setShowStatusModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await orderAPI.cancelOrder(orderId);
      toast.success('Order cancelled successfully', {
        duration: 3000,
        position: 'top-right',
      });
      fetchOrderById(orderId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error cancelling order', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleReturnProduct = async () => {
    if (!selectedProductForReturn || !returnReason || !orderId) {
      toast.error('Please select a product and provide a reason for return.');
      return;
    }

    try {
      await orderAPI.requestReturn(orderId, selectedProductForReturn, returnReason);
      toast.success('Return request submitted successfully!');
      setShowReturnForm(false);
      setReturnReason('');
      setSelectedProductForReturn(null);
      fetchOrderById(orderId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit return request.');
    }
  };

  if (!currentOrder) {
    return <div className="text-center py-8">Loading order details...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Order #{currentOrder._id}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Placed on {new Date(currentOrder.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Order Status</h2>
            <p className="mt-1 text-sm text-gray-500">
              {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
            </p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Status
            </button>
          )}
          {currentOrder.status === 'pending' && (
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel Order
            </button>
          )}
          {currentOrder.status === 'delivered' && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="ml-4 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Write Review
            </button>
          )}
        </div>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Update Order Status</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="on the way">On the Way</option>
              </select>
            </div>

            {newStatus === 'shipped' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingInfo.trackingNumber}
                    onChange={(e) => setTrackingInfo(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrier
                  </label>
                  <input
                    type="text"
                    value={trackingInfo.carrier}
                    onChange={(e) => setTrackingInfo(prev => ({ ...prev, carrier: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery
                  </label>
                  <input
                    type="date"
                    value={trackingInfo.estimatedDelivery}
                    onChange={(e) => setTrackingInfo(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Notes
              </label>
              <textarea
                value={trackingInfo.deliveryNotes}
                onChange={(e) => setTrackingInfo(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || !newStatus}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {currentOrder.items.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    {item.returnStatus === 'pending' && (
                      <p className="text-sm text-yellow-600 font-semibold">Return Requested</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900">₹{(item.productPrice * item.quantity).toFixed(2)}</p>
                  {currentOrder.status === 'delivered' && item.returnStatus !== 'pending' && (
                    <button
                      onClick={() => {
                        setSelectedProductForReturn(item.product._id as string);
                        setShowReturnForm(true);
                      }}
                      className="ml-4 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Return
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t">
            <p className="text-lg font-medium text-gray-900">
              Total: ₹{currentOrder.totalAmount}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
            <address className="text-sm text-gray-500 not-italic">
              {currentOrder.shippingAddress.fullName}<br />
              {currentOrder.shippingAddress.addressLine1}<br />
              {currentOrder.shippingAddress.addressLine2 && (
                <>{currentOrder.shippingAddress.addressLine2}<br /></>
              )}
              {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.postalCode}<br />
              {currentOrder.shippingAddress.country}<br />
            </address>
          </div>

          {currentOrder.tracking && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tracking Information</h2>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Tracking Number: {currentOrder.tracking.number}</p>
                <p>Carrier: {currentOrder.tracking.carrier}</p>
                {currentOrder.tracking.estimatedDelivery && (
                  <p>Estimated Delivery: {new Date(currentOrder.tracking.estimatedDelivery).toLocaleDateString()}</p>
                )}
                {currentOrder.tracking.updates && currentOrder.tracking.updates.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-medium">Updates:</p>
                    {currentOrder.tracking.updates.map((update, index) => (
                      <p key={index} className="ml-2">
                        {new Date(update.timestamp).toLocaleString()}: {update.location} - {update.status}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {showReviewForm && currentOrder.items.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h2>
              <ReviewForm
                productId={currentOrder.items[0].product}
                orderId={currentOrder._id}
                onReviewSubmitted={() => {
                  setShowReviewForm(false);
                  toast.success('Review submitted successfully!');
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {showReturnForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Return Product</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for return:</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a reason</option>
                  <option value="Defective product">Defective product</option>
                  <option value="Wrong item received">Wrong item received</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Item not as described">Item not as described</option>
                  <option value="Other">Other (please specify)</option>
                </select>
              </div>
              {returnReason === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specify reason:</label>
                  <textarea
                    value={returnReason === 'Other' ? '' : returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Please provide details for your return..."
                  ></textarea>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowReturnForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnProduct}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Submit Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 