import { useEffect, useState } from 'react';
import { useOrderStore } from '../store/orderStore';
import { Order } from '../types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const MyOrdersPage = () => {
  const { orders, isLoading, error, fetchOrders, deleteBulkOrders } = useOrderStore();
  const { user } = useAuth();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    // Apply filters and search
    let tempOrders = orders;

    if (searchTerm) {
      tempOrders = tempOrders.filter(order =>
        order.items.some(item =>
          item.productName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedStatuses.length > 0) {
      tempOrders = tempOrders.filter(order =>
        selectedStatuses.includes(order.status)
      );
    }

    if (selectedYears.length > 0) {
      tempOrders = tempOrders.filter(order => {
        const orderYear = new Date(order.createdAt).getFullYear();
        return selectedYears.includes(orderYear);
      });
    }

    // TODO: Implement Last 30 days filter logic

    setFilteredOrders(tempOrders);

  }, [orders, searchTerm, selectedStatuses, selectedYears]);

  // Function to toggle status filter
  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  // Function to toggle year filter
  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  // Get unique years from orders for filters
  const availableYears = Array.from(new Set(orders.map(order => new Date(order.createdAt).getFullYear()))).sort((a, b) => b - a);

  // Function to get status color class
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'returned':
        return 'bg-yellow-500';
      case 'on the way':
      default:
        return 'bg-blue-500';
    }
  };

  // Function to handle clicking on an order
  const handleOrderClick = (orderId: string) => {
    navigate(`/my-orders/${orderId}`);
  };

  const handleBulkDeleteOrders = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('You are not authorized to perform this action.');
      return;
    }

    if (window.confirm('Are you sure you want to delete ALL orders? This action cannot be undone.')) {
      try {
        await deleteBulkOrders();
        toast.success('All orders deleted successfully!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete orders in bulk.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {user?.role === 'admin' && orders.length > 0 && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleBulkDeleteOrders}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete All Orders (Admin)
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="md:w-1/4 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          {/* Order Status Filter */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">ORDER STATUS</h3>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="form-checkbox text-blue-600 rounded"
                checked={selectedStatuses.includes('on the way')}
                onChange={() => toggleStatus('on the way')}
              />
              <span className="ml-2 text-gray-700">On the way</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="form-checkbox text-green-600 rounded"
                checked={selectedStatuses.includes('delivered')}
                onChange={() => toggleStatus('delivered')}
              />
              <span className="ml-2 text-gray-700">Delivered</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="form-checkbox text-red-600 rounded"
                checked={selectedStatuses.includes('cancelled')}
                onChange={() => toggleStatus('cancelled')}
              />
              <span className="ml-2 text-gray-700">Cancelled</span>
            </label>
             <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="form-checkbox text-yellow-600 rounded"
                checked={selectedStatuses.includes('returned')}
                onChange={() => toggleStatus('returned')}
              />
              <span className="ml-2 text-gray-700">Returned</span>
            </label>
          </div>

          {/* Order Time Filter */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">ORDER TIME</h3>
            {/* 'Last 30 days' filter can be added here */}
             {availableYears.map(year => (
                <label key={year} className="flex items-center mb-2">
                    <input
                        type="checkbox"
                        className="form-checkbox text-blue-600 rounded"
                        checked={selectedYears.includes(year)}
                        onChange={() => toggleYear(year)}
                    />
                    <span className="ml-2 text-gray-700">{year}</span>
                </label>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="md:w-3/4">
          {/* Search Bar */}
          <div className="mb-6 flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <input
              type="text"
              placeholder="Search your orders here"
              className="flex-grow px-4 py-2 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Order List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">Error: {error}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No orders found matching your criteria.</div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div 
                  key={order._id} 
                  className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleOrderClick(order._id)}
                >
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold">Order #{order._id}</h3>
                     <div className="flex items-center">
                       <span className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(order.status)}`}></span>
                       <span className="text-gray-700 capitalize">{order.status}</span>
                     </div>
                   </div>
                   <div className="space-y-4">
                     {order.items.map(item => (
                       <div key={item._id} className="flex items-center border-b pb-4 last:border-b-0 last:pb-0">
                         <img src={item.productImage || '/placeholder-image.png'} alt={item.productName} className="w-16 h-16 object-cover rounded mr-4" />
                         <div className="flex-grow">
                           <p className="font-medium">{item.productName}</p>
                           <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                           {/* Add color/size if available in your item schema */}
                         </div>
                         <div className="text-right">
                           <p className="font-semibold">₹{item.productPrice?.toFixed(2)}</p>
                           {/* Add original price/discount if applicable */}
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* Display tracking information if available */}
                   {order.tracking && order.tracking.number && (
                      <div className="mt-4 text-gray-700 text-sm">
                          Tracking Number: {order.tracking.number}
                          {order.tracking.carrier && <span> ({order.tracking.carrier})</span>}
                          {order.tracking.status && <span className="capitalize"> - Status: {order.tracking.status.replace('_', ' ')}</span>}
                      </div>
                   )}

                   {/* Add order status messages and actions based on status */}
                    {order.status === 'delivered' && (
                      <div className="mt-4 text-green-600 flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                         </svg>
                        Delivered on {format(new Date(order.createdAt), 'MMM dd')}
                      </div>
                    )}
                    {/* Add other status messages like 'Order Not Placed', 'Replacement Completed' here */}

                    {/* Example action button for delivered orders */}
                    {order.status === 'delivered' && (
                       <div className="mt-4">
                          <button className="text-blue-500 hover:underline">
                             Rate & Review Product
                          </button>
                       </div>
                    )}
                     {/* Example message for 'Order Not Placed' */}
                    {order.status === 'cancelled' && order.paymentStatus === 'pending' && (
                         <div className="mt-4 text-red-600">
                           Order Not Placed: Your Payment was not confirmed by the bank.
                         </div>
                    )}
                     {/* Example message for 'Replacement Completed' - need to handle this status in backend */}
                    {/* {order.status === 'replacement completed' && ( // Assuming a status like this exists */}
                    {/*      <div className="mt-4 text-yellow-600">
                           Replacement Completed: You returned this order because there were quality issues with the material.
                         </div>
                    )} */}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 