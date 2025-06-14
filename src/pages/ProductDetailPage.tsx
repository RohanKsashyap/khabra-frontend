import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../contexts/AuthContext';
import { ReviewForm } from '../components/review/ReviewForm';
import { ReviewList } from '../components/review/ReviewList';
import api from '../services/api';
import toast from 'react-hot-toast';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/api/products/${id}`);
      setProduct(data.data);
      setIsLoading(false);
    } catch (error) {
      toast.error('Failed to load product');
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart(product, 1);
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      return;
    }

    try {
      // Create a temporary order with the current product
      const orderData = {
        items: [{
          product: product._id,
          productName: product.name,
          productPrice: product.price,
          productImage: product.image,
          quantity: 1
        }],
        totalAmount: product.price,
        isDirectPurchase: true // Flag to indicate this is a direct purchase
      };

      // Store the order data in sessionStorage for checkout page
      sessionStorage.setItem('directPurchaseOrder', JSON.stringify(orderData));
      
      // Navigate to checkout
      navigate('/checkout');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process purchase');
    }
  };

  const handleReviewClick = async () => {
    if (!user) {
      toast.error('Please login to review products');
      return;
    }

    try {
      // Find a delivered order containing this product
      const { data: orders } = await api.get('/orders', {
        params: { status: 'delivered' }
      });

      const order = orders.find((order: any) => 
        order.items.some((item: any) => item.product === product._id)
      );

      if (!order) {
        toast.error('You can only review products you have purchased and received');
        return;
      }

      setSelectedOrderId(order._id);
      setShowReviewForm(true);
    } catch (error) {
      toast.error('Failed to check order status');
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading product...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg border border-gray-300"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
              e.currentTarget.onerror = null; // prevents infinite loop
            }}
          />
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= (product.averageRating || 4.5) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600">
              {(product.averageRating || 4.5).toFixed(1)} ({product.ratings?.length || 0} reviews)
            </span>
          </div>

          <p className="text-2xl font-semibold">₹{product.price}</p>
          
          <p className="text-gray-600">{product.description}</p>

          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
            >
              Buy Now
            </button>
          </div>

          <button
            onClick={handleReviewClick}
            className="text-blue-500 hover:text-blue-600"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        {showReviewForm && selectedOrderId && (
          <div className="mb-8">
            <ReviewForm
              productId={product._id}
              orderId={selectedOrderId}
              onReviewSubmitted={() => {
                setShowReviewForm(false);
                setSelectedOrderId(null);
                fetchProduct(); // Refresh product to update ratings
              }}
              onCancel={() => {
                setShowReviewForm(false);
                setSelectedOrderId(null);
              }}
            />
          </div>
        )}

        {product?._id && <ReviewList productId={product._id} />}
      </div>
    </div>
  );
}; 