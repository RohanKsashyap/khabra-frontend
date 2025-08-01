import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { orderAPI } from '../../services/api';
import { processRazorpayPayment } from '../../utils/razorpay';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface DirectRazorpayCheckoutProps {
  className?: string;
  buttonText?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const DirectRazorpayCheckout: React.FC<DirectRazorpayCheckoutProps> = ({
  className = '',
  buttonText = 'Pay Now with Razorpay',
  onSuccess,
  onError
}) => {
  const navigate = useNavigate();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDirectCheckout = async () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      // Create a default address if user doesn't have one
      const defaultAddress = {
        fullName: user.name || '',
        addressLine1: user.address?.addressLine1 || '',
        addressLine2: user.address?.addressLine2 || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        postalCode: user.address?.postalCode || '',
        country: 'India',
        phone: user.phone || '',
      };

      // Create order with Razorpay payment method
      const order = await orderAPI.createOrder({
        shippingAddress: defaultAddress,
        billingAddress: defaultAddress,
        paymentMethod: 'razorpay',
        paymentDetails: {},
        items: items.map(item => ({
          product: item.product,
          productName: item.productName,
          productPrice: item.productPrice,
          productImage: item.productImage,
          quantity: item.quantity
        })),
        totalAmount: getTotalAmount()
      });

      // Process payment with Razorpay
      await processRazorpayPayment(order._id);
      
      // Clear cart and navigate to success page
      await clearCart();
      
      if (onSuccess) {
        onSuccess();
      }
      
      navigate('/payment/success', { 
        state: { 
          orderId: order._id,
          totalAmount: order.totalAmount
        }
      });
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      
      if (onError) {
        onError(error instanceof Error ? error : new Error('Payment failed'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleDirectCheckout}
      disabled={isProcessing}
      className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center ${className}`}
    >
      {isProcessing ? 'Processing...' : buttonText}
      <img 
        src="https://razorpay.com/assets/razorpay-logo.svg" 
        alt="Razorpay" 
        className="h-5 ml-2 inline" 
      />
    </Button>
  );
};

export default DirectRazorpayCheckout; 