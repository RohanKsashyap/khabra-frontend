import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { processRazorpayPayment } from '../../utils/razorpay';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface QuickBuyButtonProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  className?: string;
  buttonText?: string;
}

const QuickBuyButton: React.FC<QuickBuyButtonProps> = ({
  product,
  quantity,
  className = '',
  buttonText = 'Buy Now'
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickBuy = async () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
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

      // Prepare order items
      const orderItems = [{
        product: product._id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.images[0],
        quantity: quantity
      }];

      // Calculate total amount
      const totalAmount = product.price * quantity;

      // Store order data in session storage for checkout page
      const directPurchaseOrder = {
        items: orderItems,
        totalAmount
      };
      
      // Option 1: Navigate to checkout with the order data
      if (false) { // Set to true to enable checkout page flow
        sessionStorage.setItem('directPurchaseOrder', JSON.stringify(directPurchaseOrder));
        navigate('/checkout');
        return;
      }
      
      // Option 2: Direct Razorpay payment
      // Create order with Razorpay payment method
      const order = await orderAPI.createOrder({
        shippingAddress: defaultAddress,
        billingAddress: defaultAddress,
        paymentMethod: 'razorpay',
        paymentDetails: {},
        items: orderItems,
        totalAmount
      });

      // Process payment with Razorpay
      await processRazorpayPayment(order._id);
      
      toast.success('Payment successful!', {
        duration: 3000,
        position: 'top-center'
      });
      
      navigate('/payment/success', { 
        state: { 
          orderId: order._id,
          totalAmount: order.totalAmount
        }
      });
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleQuickBuy}
      disabled={isProcessing}
      className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
    >
      {isProcessing ? 'Processing...' : buttonText}
    </Button>
  );
};

export default QuickBuyButton; 