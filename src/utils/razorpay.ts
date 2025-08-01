import { API_BASE_URL } from '../config';
import axios from './axios';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CreateOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayKeyId: string;
    amount: number;
    currency: string;
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
  };
}

export const createRazorpayOrder = async (orderId: string): Promise<CreateOrderResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payments/razorpay/create`, { orderId });
    return response.data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyRazorpayPayment = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payments/razorpay/verify`, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};

export const initializeRazorpayCheckout = (
  orderData: CreateOrderResponse['data'],
  onSuccess: (response: RazorpayResponse) => void,
  onFailure: (error: any) => void
) => {
  // Load the Razorpay script dynamically
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  
  script.onload = () => {
    const options: RazorpayOptions = {
      key: orderData.razorpayKeyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'KHABRA MLM',
      description: 'Order Payment',
      order_id: orderData.razorpayOrderId,
      prefill: orderData.prefill,
      notes: {
        orderId: orderData.orderId
      },
      theme: {
        color: '#3399cc'
      }
    };

    const razorpayInstance = new (window as any).Razorpay(options);
    
    razorpayInstance.on('payment.success', (response: RazorpayResponse) => {
      onSuccess(response);
    });
    
    razorpayInstance.on('payment.failed', (response: any) => {
      onFailure(response.error);
    });
    
    razorpayInstance.open();
  };
  
  script.onerror = () => {
    onFailure(new Error('Failed to load Razorpay SDK'));
  };
  
  document.body.appendChild(script);
};

export const processRazorpayPayment = async (orderId: string): Promise<void> => {
  try {
    // Step 1: Create Razorpay order
    const orderData = await createRazorpayOrder(orderId);
    
    // Step 2: Initialize Razorpay checkout
    return new Promise((resolve, reject) => {
      initializeRazorpayCheckout(
        orderData.data,
        // Success handler
        async (response) => {
          try {
            // Step 3: Verify payment on server
            const verificationResponse = await verifyRazorpayPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            
            if (verificationResponse.success) {
              resolve();
            } else {
              reject(new Error('Payment verification failed'));
            }
          } catch (error) {
            reject(error);
          }
        },
        // Failure handler
        (error) => {
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Error processing Razorpay payment:', error);
    throw error;
  }
}; 