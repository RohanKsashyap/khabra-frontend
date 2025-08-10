import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../contexts/AuthContext';
import { Address, SavedAddress } from '../types';
import { SavedAddresses } from '../components/address/SavedAddresses';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { processRazorpayPayment } from '../utils/razorpay';

type PaymentMethod = 'cod' | 'razorpay';

enum CheckoutStep {
  Shipping = 'Shipping',
  Payment = 'Payment',
  Review = 'Review',
}

interface StepStatus {
  isComplete: boolean;
  isCurrent: boolean;
}

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.Shipping); // New state for current step
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [directPurchaseOrder, setDirectPurchaseOrder] = useState<any>(null);
  const [stepStatus, setStepStatus] = useState<Record<CheckoutStep, StepStatus>>({
    [CheckoutStep.Shipping]: { isComplete: false, isCurrent: true },
    [CheckoutStep.Payment]: { isComplete: false, isCurrent: false },
    [CheckoutStep.Review]: { isComplete: false, isCurrent: false },
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Check for direct purchase order in sessionStorage
    const storedOrder = sessionStorage.getItem('directPurchaseOrder');
    if (storedOrder) {
      setDirectPurchaseOrder(JSON.parse(storedOrder));
      // Clear the stored order
      sessionStorage.removeItem('directPurchaseOrder');
    }
  }, []);

  const [address, setAddress] = useState<Address>({
    fullName: user?.name || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: user?.phone || '',
  });

  // No extra fields needed for Razorpay or COD

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // No-op handlers required for removed methods

  const handleAddressSelect = (savedAddress: SavedAddress) => {
    setSelectedAddress(savedAddress);
    setAddress({
      fullName: savedAddress.fullName,
      addressLine1: savedAddress.addressLine1,
      addressLine2: savedAddress.addressLine2 || '',
      city: savedAddress.city,
      state: savedAddress.state,
      postalCode: savedAddress.postalCode,
      country: savedAddress.country,
      phone: savedAddress.phone,
    });
    setShowNewAddressForm(false);
  };

  const handleAddressesLoaded = (addresses: SavedAddress[]) => {
    // Auto-select the default address if available
    const defaultAddress = addresses.find(addr => addr.isDefault);
    if (defaultAddress && !selectedAddress) {
      handleAddressSelect(defaultAddress);
    }
  };

  const updateStepStatus = (step: CheckoutStep, isComplete: boolean) => {
    setStepStatus(prev => ({
      ...prev,
      [step]: { ...prev[step], isComplete }
    }));
  };

  const validateShippingStep = () => {
    const errors: Record<string, string[]> = {};
    
    if (!selectedAddress && !showNewAddressForm) {
      errors.address = ['Please select or add a shipping address'];
      return errors;
    }

    if (showNewAddressForm) {
      const requiredFields: (keyof Address)[] = ['fullName', 'addressLine1', 'city', 'state', 'postalCode', 'country', 'phone'];
      requiredFields.forEach(field => {
        if (!address[field]) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
      });

      // Phone number validation
      if (address.phone && !/^[0-9]{10}$/.test(address.phone)) {
        if (!errors.phone) errors.phone = [];
        errors.phone.push('Please enter a valid 10-digit phone number');
      }

      // Postal code validation
      if (address.postalCode && !/^[0-9]{6}$/.test(address.postalCode)) {
        if (!errors.postalCode) errors.postalCode = [];
        errors.postalCode.push('Please enter a valid 6-digit postal code');
      }
    }

    return errors;
  };

  const validatePaymentStep = () => {
    // No extra validation needed for Razorpay or COD
    return {} as Record<string, string[]>;
  };

  const handleNextStep = () => {
    let errors: Record<string, string[]> = {};
    
    if (currentStep === CheckoutStep.Shipping) {
      errors = validateShippingStep();
    } else if (currentStep === CheckoutStep.Payment) {
      errors = validatePaymentStep();
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    if (currentStep === CheckoutStep.Shipping) {
      updateStepStatus(CheckoutStep.Shipping, true);
      setCurrentStep(CheckoutStep.Payment);
      setStepStatus(prev => ({
        ...prev,
        [CheckoutStep.Payment]: { ...prev[CheckoutStep.Payment], isCurrent: true },
        [CheckoutStep.Shipping]: { ...prev[CheckoutStep.Shipping], isCurrent: false }
      }));
    } else if (currentStep === CheckoutStep.Payment) {
      updateStepStatus(CheckoutStep.Payment, true);
      setCurrentStep(CheckoutStep.Review);
      setStepStatus(prev => ({
        ...prev,
        [CheckoutStep.Review]: { ...prev[CheckoutStep.Review], isCurrent: true },
        [CheckoutStep.Payment]: { ...prev[CheckoutStep.Payment], isCurrent: false }
      }));
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === CheckoutStep.Payment) {
      setCurrentStep(CheckoutStep.Shipping);
      setStepStatus(prev => ({
        ...prev,
        [CheckoutStep.Shipping]: { ...prev[CheckoutStep.Shipping], isCurrent: true },
        [CheckoutStep.Payment]: { ...prev[CheckoutStep.Payment], isCurrent: false }
      }));
    } else if (currentStep === CheckoutStep.Review) {
      setCurrentStep(CheckoutStep.Payment);
      setStepStatus(prev => ({
        ...prev,
        [CheckoutStep.Payment]: { ...prev[CheckoutStep.Payment], isCurrent: true },
        [CheckoutStep.Review]: { ...prev[CheckoutStep.Review], isCurrent: false }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const order = await orderAPI.createOrder({
        shippingAddress: address,
        billingAddress: address,
        paymentMethod,
        paymentDetails: {},
        items: directPurchaseOrder ? directPurchaseOrder.items : items.map(item => ({
          product: item.product,
          productName: item.productName,
          productPrice: item.productPrice,
          productImage: item.productImage,
          quantity: item.quantity
        })),
        totalAmount: directPurchaseOrder ? directPurchaseOrder.totalAmount : getTotalAmount()
      });

      if (paymentMethod === 'razorpay') {
        try {
          // Process Razorpay payment
          await processRazorpayPayment(order._id);
          if (!directPurchaseOrder) {
            await clearCart();
          }
          
          navigate('/checkout/success', { 
            state: { 
              orderId: order._id,
              totalAmount: order.totalAmount
            }
          });
        } catch (paymentError: any) {
          toast.error(paymentError.message || 'Payment failed. Please try again.');
          setIsProcessing(false);
          return;
        }
      } else {
        // For other payment methods
        if (!directPurchaseOrder) {
          await clearCart();
        }
        
        navigate('/checkout/success', { 
          state: { 
            orderId: order._id,
            totalAmount: order.totalAmount
          }
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !directPurchaseOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to your cart to proceed with checkout.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    CheckoutStep.Shipping,
    CheckoutStep.Payment,
    CheckoutStep.Review,
  ];

  // Helper kept previously is no longer used; remove to satisfy linter

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Checkout</h1>

      {/* Enhanced Progress Indicator */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className="relative">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${
                    stepStatus[step].isComplete 
                      ? 'bg-green-500' 
                      : stepStatus[step].isCurrent 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300'
                  }`}
                >
                  {stepStatus[step].isComplete ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`absolute top-6 left-12 w-full h-1 transition-all duration-300 ${
                      stepStatus[step].isComplete ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    style={{ width: 'calc(100% - 3rem)' }}
                  />
                )}
              </div>
              <span 
                className={`mt-2 text-sm font-medium ${
                  stepStatus[step].isCurrent ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {step}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {step === CheckoutStep.Shipping && 'Add delivery details'}
                {step === CheckoutStep.Payment && 'Select payment method'}
                {step === CheckoutStep.Review && 'Review your order'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {currentStep === CheckoutStep.Shipping && (
              <div className="bg-white p-6 rounded-lg shadow transition-all duration-300">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                
                <SavedAddresses
                  onSelectAddress={handleAddressSelect}
                  selectedAddressId={selectedAddress?._id}
                  onAddressesLoaded={handleAddressesLoaded}
                />

                {showNewAddressForm && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={address.fullName}
                          onChange={handleAddressChange}
                          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                        />
                        {validationErrors.fullName && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.fullName[0]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={address.phone}
                          onChange={handleAddressChange}
                          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                        />
                        {validationErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.phone[0]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <Button type="button" onClick={handleNextStep}>
                    Next: Payment
                  </Button>
                </div>
              </div>
            )}
            
            {currentStep === CheckoutStep.Payment && (
              <div className="bg-white p-6 rounded-lg shadow transition-all duration-300">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`text-left border rounded-lg p-4 transition focus:outline-none ${
                      paymentMethod === 'razorpay' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input type="radio" checked={paymentMethod === 'razorpay'} readOnly className="mr-2" />
                        <span className="font-semibold">Razorpay (Recommended)</span>
                      </div>
                      <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-6" />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Pay securely via Razorpay. Supports cards, UPI, and netbanking within the Razorpay flow.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`text-left border rounded-lg p-4 transition focus:outline-none ${
                      paymentMethod === 'cod' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <input type="radio" checked={paymentMethod === 'cod'} readOnly className="mr-2" />
                      <span className="font-semibold">Cash on Delivery</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Pay with cash when your order is delivered.</p>
                  </button>
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" onClick={handlePreviousStep}>
                    Previous: Shipping
                  </Button>
                  <Button type="button" onClick={handleNextStep}>
                    Next: Review
                  </Button>
                </div>
              </div>
            )}
            
            {currentStep === CheckoutStep.Review && (
              <div className="bg-white p-6 rounded-lg shadow transition-all duration-300">
                <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{address.fullName}</p>
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                      <p>{address.country}</p>
                      <p className="mt-2">Phone: {address.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Order Items</h3>
                    <div className="space-y-4">
                      {directPurchaseOrder ? (
                        <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                          <img 
                            src={directPurchaseOrder.items[0].productImage} 
                            alt={directPurchaseOrder.items[0].productName}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{directPurchaseOrder.items[0].productName}</p>
                            <p className="text-sm text-gray-500">Qty: {directPurchaseOrder.items[0].quantity}</p>
                            <p className="text-sm">₹{directPurchaseOrder.items[0].productPrice}</p>
                          </div>
                        </div>
                      ) : (
                        items.map(item => (
                          <div key={item.product} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                            <img 
                              src={item.productImage} 
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" onClick={handlePreviousStep}>
                    Previous: Payment
                  </Button>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Persistent Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {directPurchaseOrder ? (
                <div className="flex items-center space-x-4">
                  <img 
                    src={directPurchaseOrder.items[0].productImage} 
                    alt={directPurchaseOrder.items[0].productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{directPurchaseOrder.items[0].productName}</p>
                    <p className="text-sm text-gray-500">Qty: {directPurchaseOrder.items[0].quantity}</p>
                  </div>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.product} className="flex items-center space-x-4">
                    <img 
                      src={item.productImage} 
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))
              )}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>₹{directPurchaseOrder ? directPurchaseOrder.totalAmount : getTotalAmount()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{directPurchaseOrder ? directPurchaseOrder.totalAmount : getTotalAmount()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 