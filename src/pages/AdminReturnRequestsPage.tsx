import React, { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ProductReturnRequest {
  _id: string; // ReturnRequest ID
  order: {
    _id: string;
    totalAmount: number;
    status: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  resolutionDate?: string;
  adminNotes?: string;
}

const AdminReturnRequestsPage: React.FC = () => {
  const [returnRequests, setReturnRequests] = useState<ProductReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const fetchReturnRequests = async () => {
    try {
      setIsLoading(true);
      // Use the correct endpoint for ReturnRequest model
      const data = await orderAPI.fetchReturnRequests();
      setReturnRequests(data);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch return requests');
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected' | 'completed', adminNotes?: string) => {
    try {
      await orderAPI.updateReturnStatus(requestId, status, adminNotes);
      toast.success(`Return request marked as ${status} successfully`);
      fetchReturnRequests();
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
      <div className="mb-6 flex justify-end">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          onClick={async () => {
            if (window.confirm('Are you sure you want to clear all return request history? This cannot be undone.')) {
              try {
                setIsLoading(true);
                await orderAPI.deleteAllReturnRequests();
                toast.success('All return requests deleted successfully');
                fetchReturnRequests();
              } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to delete return requests');
              } finally {
                setIsLoading(false);
              }
            }
          }}
          disabled={isLoading}
        >
          Clear History
        </button>
      </div>

      {returnRequests.length === 0 ? (
        <div className="text-center text-gray-500">No return requests found.</div>
      ) : (
        <div className="space-y-6">
          {returnRequests.map(request => (
            <div key={request._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Return Request for Order ID: {request.order ? request.order._id : 'N/A'}</h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : request.status === 'approved' ? 'bg-green-100 text-green-800' : request.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                  {request.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-700"><strong>User:</strong> {request.user ? `${request.user.name} (${request.user.email})` : 'N/A'}</p>
                <p className="text-gray-700"><strong>Order Status:</strong> {request.order ? request.order.status : 'N/A'}</p>
                <p className="text-gray-700"><strong>Product:</strong> {request.product ? `${request.product.name} (₹${request.product.price})` : 'N/A'}</p>
                {request.product && request.product.image && (
                  <img src={request.product.image} alt={request.product.name} className="w-16 h-16 object-cover rounded my-2" />
                )}
                <p className="text-gray-700"><strong>Reason:</strong> {request.reason}</p>
                <p className="text-gray-700"><strong>Requested On:</strong> {format(new Date(request.requestDate), 'MMM dd, yyyy h:mm a')}</p>
                {request.resolutionDate && <p className="text-gray-700"><strong>Processed On:</strong> {format(new Date(request.resolutionDate), 'MMM dd, yyyy h:mm a')}</p>}
                {request.adminNotes && <p className="text-gray-700"><strong>Admin Notes:</strong> {request.adminNotes}</p>}
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