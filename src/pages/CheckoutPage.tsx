import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../contexts/AuthContext';
import { Address, SavedAddress } from '../types';
import { SavedAddresses } from '../components/address/SavedAddresses';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { colors } from '../styles/theme'; // Import colors for styling progress indicator
import { Button } from '../components/ui/Button';
import RazorpayCheckout from '../components/payment/RazorpayCheckout';
import { processRazorpayPayment } from '../utils/razorpay';

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'cod' | 'razorpay';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
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

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [upiId, setUpiId] = useState('');

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
    const errors: Record<string, string[]> = {};
    
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber) {
        if (!errors.cardNumber) errors.cardNumber = [];
        errors.cardNumber.push('Card number is required');
      } else if (!/^[0-9]{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
        if (!errors.cardNumber) errors.cardNumber = [];
        errors.cardNumber.push('Please enter a valid 16-digit card number');
      }

      if (!cardDetails.cardName) {
        if (!errors.cardName) errors.cardName = [];
        errors.cardName.push('Card holder name is required');
      }

      if (!cardDetails.expiryDate) {
        if (!errors.expiryDate) errors.expiryDate = [];
        errors.expiryDate.push('Expiry date is required');
      } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardDetails.expiryDate)) {
        if (!errors.expiryDate) errors.expiryDate = [];
        errors.expiryDate.push('Please enter a valid expiry date (MM/YY)');
      }

      if (!cardDetails.cvv) {
        if (!errors.cvv) errors.cvv = [];
        errors.cvv.push('CVV is required');
      } else if (!/^[0-9]{3,4}$/.test(cardDetails.cvv)) {
        if (!errors.cvv) errors.cvv = [];
        errors.cvv.push('Please enter a valid CVV');
      }
    } else if (paymentMethod === 'upi' && !upiId) {
      if (!errors.upiId) errors.upiId = [];
      errors.upiId.push('UPI ID is required');
    }

    return errors;
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
      let paymentDetails = {};
      if (paymentMethod === 'card') {
        paymentDetails = {
          cardNumber: cardDetails.cardNumber,
          cardName: cardDetails.cardName,
          expiryDate: cardDetails.expiryDate,
          cvv: cardDetails.cvv,
        };
      } else if (paymentMethod === 'upi') {
        paymentDetails = { upiId };
      }

      const order = await orderAPI.createOrder({
        shippingAddress: address,
        billingAddress: address,
        paymentMethod,
        paymentDetails,
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

  const getStepNumber = (step: CheckoutStep) => steps.indexOf(step) + 1;

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
                <div className="space-y-4">
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600 h-5 w-5 transition-colors duration-200"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <span className="ml-2 text-gray-700">Credit/Debit Card</span>
                    </label>
                    {paymentMethod === 'card' && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={cardDetails.cardNumber}
                            onChange={handleCardChange}
                            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="XXXX XXXX XXXX XXXX"
                          />
                          {validationErrors.cardNumber && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.cardNumber[0]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                          <input
                            type="text"
                            name="cardName"
                            value={cardDetails.cardName}
                            onChange={handleCardChange}
                            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              validationErrors.cardName ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {validationErrors.cardName && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.cardName[0]}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              name="expiryDate"
                              value={cardDetails.expiryDate}
                              onChange={handleCardChange}
                              className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                validationErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="MM/YY"
                            />
                            {validationErrors.expiryDate && (
                              <p className="mt-1 text-sm text-red-600">{validationErrors.expiryDate[0]}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                            <input
                              type="text"
                              name="cvv"
                              value={cardDetails.cvv}
                              onChange={handleCardChange}
                              className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                validationErrors.cvv ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="XXX"
                            />
                            {validationErrors.cvv && (
                              <p className="mt-1 text-sm text-red-600">{validationErrors.cvv[0]}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600 h-5 w-5 transition-colors duration-200"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                      />
                      <span className="ml-2 text-gray-700">UPI</span>
                    </label>
                    {paymentMethod === 'upi' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                        <input
                          type="text"
                          name="upiId"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            validationErrors.upiId ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="example@upi"
                        />
                        {validationErrors.upiId && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.upiId[0]}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600 h-5 w-5 transition-colors duration-200"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <span className="ml-2 text-gray-700">Cash on Delivery (COD)</span>
                    </label>
                  </div>

                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600 h-5 w-5 transition-colors duration-200"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                      />
                      <span className="ml-2 text-gray-700">Razorpay</span>
                      <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-6 ml-2 inline" />
                    </label>
                  </div>
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
                      <p className="font-medium capitalize">{paymentMethod}</p>
                      {paymentMethod === 'card' && (
                        <p>Card ending in {cardDetails.cardNumber.slice(-4)}</p>
                      )}
                      {paymentMethod === 'upi' && (
                        <p>UPI ID: {upiId}</p>
                      )}
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