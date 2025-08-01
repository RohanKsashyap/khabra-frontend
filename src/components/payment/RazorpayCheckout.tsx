import React, { useState } from 'react';
import { processRazorpayPayment } from '../../utils/razorpay';
import { Button } from '../ui/Button';

interface RazorpayCheckoutProps {
  orderId: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
  buttonText?: string;
  className?: string;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  orderId,
  onSuccess,
  onError,
  buttonText = 'Pay with Razorpay',
  className = ''
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      await processRazorpayPayment(orderId);
      onSuccess();
    } catch (error) {
      console.error('Payment failed:', error);
      onError(error instanceof Error ? error : new Error('Payment failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
    >
      {loading ? 'Processing...' : buttonText}
    </Button>
  );
};

export default RazorpayCheckout; 