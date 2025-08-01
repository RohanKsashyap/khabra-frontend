import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

interface LocationState {
  orderId?: string;
  totalAmount?: number;
}

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  useEffect(() => {
    // If no order ID is provided, redirect to home page
    if (!state?.orderId) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.orderId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-3">
            <svg
              className="w-16 h-16 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-green-600">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Order ID:</span>
            <span>{state.orderId}</span>
          </div>
          {state.totalAmount && (
            <div className="flex justify-between">
              <span className="font-medium">Amount Paid:</span>
              <span>₹{state.totalAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-6">
          A confirmation email has been sent to your registered email address.
        </p>

        <div className="flex flex-col space-y-3">
          <Link to={`/orders/${state.orderId}`}>
            <Button className="w-full">View Order Details</Button>
          </Link>
          <Link to="/">
            <Button className="w-full bg-blue-600">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 