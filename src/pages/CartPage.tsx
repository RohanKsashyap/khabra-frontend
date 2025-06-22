import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { Button } from '../components/ui/Button';

export const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotalAmount, fetchCart, isLoading } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemoveFromCart = async (productId: string, productName: string) => {
    try {
      await removeFromCart(productId);
      toast.error(`${productName} removed from cart`, {
        duration: 1000,
        position: 'top-right',
      });   
    } catch (error) {
      toast.error('Failed to remove item from cart', {
        duration: 1000,
        position: 'top-right',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to your cart to see them here.</p>
          <Button
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 border-b py-4"
            >
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-grow">
                <h3 className="font-semibold">{item.productName}</h3>
                <p className="text-gray-600">₹{item.productPrice}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.product, item.quantity - 1)}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{item.productPrice * item.quantity}</p>
                <button
                  onClick={() => handleRemoveFromCart(item.product, item.productName)}
                  className="text-red-500 hover:text-red-600 mt-2"
                  disabled={isLoading}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{getTotalAmount()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{getTotalAmount()}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate('/checkout')}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Proceed to Checkout'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};