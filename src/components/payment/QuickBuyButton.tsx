import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { processRazorpayPayment } from '../../utils/razorpay';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface QuickBuyButtonProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
  };
  quantity: number;
  className?: string;
  buttonText?: string;
  disabled?: boolean;
}

const QuickBuyButton: React.FC<QuickBuyButtonProps> = ({
  product,
  quantity,
  className = '',
  buttonText = 'Buy Now',
  disabled = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickBuy = async () => {
    if (disabled) {
      toast.error('Product is currently out of stock');
      return;
    }

    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      // Prepare order items for checkout
      const orderItems = [{
        product: product._id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg',
        quantity: quantity
      }];

      // Calculate total amount
      const totalAmount = product.price * quantity;

      // Store order data in session storage for checkout page
      const directPurchaseOrder = {
        items: orderItems,
        totalAmount,
        isDirectPurchase: true // Flag to indicate this is a direct purchase
      };
      
      // Store in session storage and navigate to checkout
      sessionStorage.setItem('directPurchaseOrder', JSON.stringify(directPurchaseOrder));
      
      toast.success('Redirecting to checkout...', {
        duration: 1500,
        position: 'top-center'
      });
      
      // Navigate to checkout page
      navigate('/checkout');
      
    } catch (error: any) {
      console.error('Failed to proceed to checkout:', error);
      toast.error('Failed to proceed to checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleQuickBuy}
      disabled={disabled || isProcessing}
      className={className}
    >
      {isProcessing ? 'Processing...' : buttonText}
    </Button>
  );
};

export default QuickBuyButton; 