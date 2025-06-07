import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ReturnRequestData {
  _id: string; // This will be the Order ID, but represents the return request in this context
  order: { // Populate order details needed
    _id: string; // Actual Order ID
    user: { // Populate user details needed
      _id: string;
      name: string;
      email: string;
    };
    items: Array<{ // Populate item details needed
      _id: string; // OrderItem ID
      productName: string;
      quantity: number;
      productImage?: string;
    }>;
    totalAmount: number;
    shippingAddress: { // Populate address details needed
      fullName: string;
      addressLine1: string;
      city: string;
      state: string;
      postalCode: string;
    };
    createdAt: string; // Order creation date
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

const AdminReturnRequestsPage: React.FC = () => {
  const [returnRequests, setReturnRequests] = useState<ReturnRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const fetchReturnRequests = async () => {
    try {
      setIsLoading(true);
      // Fetch from the new admin endpoint
      const { data } = await api.get<ReturnRequestData[]>('/orders/admin/returns');
      
      // The backend currently returns Order objects that have a returnRequest field.
      // We need to transform this into the ReturnRequestData structure expected by the component.
      // Each item in `data` is an Order object.
      const transformedData: ReturnRequestData[] = data.map(order => ({
        _id: order._id, // Use Order ID as the key/ID for the request display
        order: {
          _id: order._id, // Store actual Order ID here too
          user: order.user, // Assuming user is populated
          items: order.items, // Assuming items are populated with productName/Image
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
        },
        reason: order.returnRequest?.reason || '', // Extract reason from returnRequest
        status: order.returnRequest?.status || 'pending', // Extract status
        requestedAt: order.returnRequest?.requestedAt || order.createdAt, // Use request date if available, otherwise order date
        processedAt: order.returnRequest?.processedAt,
        notes: order.returnRequest?.notes,
      }));

      setReturnRequests(transformedData);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch return requests');
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected' | 'completed', notes?: string) => {
    try {
      // Find the order ID associated with this request ID
      const orderId = returnRequests.find(req => req._id === requestId)?.order._id;
      
      if (!orderId) {
          toast.error('Could not find associated order for this request.');
          return;
      }

      // Call the backend endpoint to update return status using the Order ID
      await api.put(`/orders/${orderId}/return-status`, { status, notes });
      toast.success(`Return request marked as ${status} successfully`);
      fetchReturnRequests(); // Refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update return request status');
    }
  };

  if (isLoading) {
    return <div className="animate-pulse text-center">Loading return requests...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Return Requests</h1>

      {returnRequests.length === 0 ? (
        <div className="text-center text-gray-500">No return requests found.</div>
      ) : (
        <div className="space-y-6">
          {returnRequests.map(request => (
            <div key={request._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Return Request for Order ID: {request.order._id}</h3> {/* Display Order ID */}
                <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : request.status === 'approved' ? 'bg-green-100 text-green-800' : request.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                  {request.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-700"><strong>User:</strong> {request.order.user.name} ({request.order.user.email})</p>
                <p className="text-gray-700"><strong>Order Placed On:</strong> {format(new Date(request.order.createdAt), 'MMM dd, yyyy')}</p> {/* Display order date */}
                 <p className="text-gray-700"><strong>Request Made On:</strong> {format(new Date(request.requestedAt), 'MMM dd, yyyy h:mm a')}</p> {/* Display request date */}
                <p className="text-gray-700 mt-2"><strong>Reason:</strong> {request.reason}</p>
                {request.notes && <p className="text-gray-700"><strong>Admin Notes:</strong> {request.notes}</p>}
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Items:</h4>
                {request.order.items.map(item => (
                  <div key={item._id} className="flex items-center text-sm text-gray-700 mb-1">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded mr-2" />
                    )}
                    {item.productName} x {item.quantity}
                  </div>
                ))}
              </div>

              {request.status === 'pending' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleUpdateStatus(request._id, 'approved')}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                  >
                    Approve
                  </button>
                  <button
                     onClick={() => {
                        const rejectNotes = prompt('Enter rejection reason (optional):');
                        handleUpdateStatus(request._id, 'rejected', rejectNotes || undefined);
                     }}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    Reject
                  </button>
                </div>
              )}
               {request.status === 'approved' && (
                <button
                  onClick={() => handleUpdateStatus(request._id, 'completed')}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReturnRequestsPage; 