import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderAPI } from '../services/api';
import TrackingTimeline from '../components/order/TrackingTimeline';
import ReturnRequestForm from '../components/order/ReturnRequestForm';
import { format } from 'date-fns';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface TrackingInfo {
  number?: string;
  carrier?: string;
  status: string;
  estimatedDelivery?: Date;
  updates: Array<{
    status: string;
    location?: string;
    description?: string;
    timestamp: Date;
  }>;
}

interface ReturnRequest {
  reason: string;
  status: string;
  requestedAt: Date;
  processedAt?: Date;
  notes?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  tracking?: TrackingInfo;
  returnRequest?: ReturnRequest;
  createdAt: Date;
}

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);

  useEffect(() => {
    if (!orderId) {
      toast.error('Order ID is missing');
      navigate('/my-orders');
      return;
    }
    fetchOrder();
  }, [orderId, navigate]);

  const fetchOrder = async () => {
    if (!orderId) return;
    
    try {
      setIsLoading(true);
      const response = await orderAPI.fetchOrderById(orderId);
      setOrder(response);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching order details');
      navigate('/my-orders');
    } finally {
      setIsLoading(false);
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
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error cancelling order', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleReturnRequest = () => {
    setShowReturnForm(true);
  };

  const handleReturnSubmitted = () => {
    setShowReturnForm(false);
    fetchOrder();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Order #{order._id}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Order Status</h2>
            <p className="mt-1 text-sm text-gray-500">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </p>
          </div>
          {order.status === 'pending' && (
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel Order
            </button>
          )}
          {order.status === 'delivered' && !order.returnRequest && (
            <button
              onClick={handleReturnRequest}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Request Return
            </button>
          )}
        </div>
      </div>

      {showReturnForm && (
        <div className="mb-8">
          <ReturnRequestForm
            orderId={order._id}
            onRequestSubmitted={handleReturnSubmitted}
            onCancel={() => setShowReturnForm(false)}
          />
        </div>
      )}

      {order.returnRequest && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Return Request Status
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="mt-1 text-sm text-gray-900">
                {order.returnRequest.status.charAt(0).toUpperCase() + 
                 order.returnRequest.status.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reason</p>
              <p className="mt-1 text-sm text-gray-900">
                {order.returnRequest.reason}
              </p>
            </div>
            {order.returnRequest.notes && (
              <div>
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p className="mt-1 text-sm text-gray-900">
                  {order.returnRequest.notes}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Requested On</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(order.returnRequest.requestedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {order.tracking && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Tracking Information
          </h2>
          {order.tracking.number && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500">Tracking Number</p>
              <p className="mt-1 text-sm text-gray-900">
                {order.tracking.number}
              </p>
            </div>
          )}
          {order.tracking.carrier && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500">Carrier</p>
              <p className="mt-1 text-sm text-gray-900">
                {order.tracking.carrier}
              </p>
            </div>
          )}
          <TrackingTimeline
            updates={order.tracking.updates}
            currentStatus={order.tracking.status}
            estimatedDelivery={order.tracking.estimatedDelivery}
          />
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {item.product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between">
            <p className="text-base font-medium text-gray-900">Total</p>
            <p className="text-base font-medium text-gray-900">
            ₹{order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Shipping Address
        </h2>
        <div className="space-y-1">
          <p className="text-sm text-gray-900">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-gray-900">{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && (
            <p className="text-sm text-gray-900">{order.shippingAddress.addressLine2}</p>
          )}
          <p className="text-sm text-gray-900">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
          <p className="text-sm text-gray-900">{order.shippingAddress.country}</p>
        </div>
      </div>
    </div>
  );
};

export { OrderDetailPage };
export default OrderDetailPage; 