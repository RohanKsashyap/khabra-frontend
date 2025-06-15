import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../contexts/AuthContext';
import { ReviewForm } from '../components/review/ReviewForm';
import { ReviewList } from '../components/review/ReviewList';
import api from '../services/api';
import toast from 'react-hot-toast';

export const ProductDetailPage = () => {
  console.log('ProductDetailPage: Component mounted.');
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && user) {
      checkProductDeliveryStatus();
    }
  }, [product, user]);

  useEffect(() => {
    if (product) {
      const dummyRelatedProducts = [
        { _id: 'dummy1', name: 'Related Product A', price: 29.99, image: 'https://via.placeholder.com/150?text=Related+A' },
        { _id: 'dummy2', name: 'Related Product B', price: 45.00, image: 'https://via.placeholder.com/150?text=Related+B' },
        { _id: 'dummy3', name: 'Related Product C', price: 19.50, image: 'https://via.placeholder.com/150?text=Related+C' },
      ];
      setRelatedProducts(dummyRelatedProducts);
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/api/products/${id}`);
      setProduct(data.data);
      setCurrentImageIndex(0);
      setIsLoading(false);
    } catch (error) {
      toast.error('Failed to load product');
      setIsLoading(false);
    }
  };

  const checkProductDeliveryStatus = async () => {
    try {
      const { data } = await api.get('/api/orders', {
        params: { status: 'delivered', userId: user?.id }
      });

      const orders = data.data;
      console.log('checkProductDeliveryStatus: Fetched delivered orders:', orders);
      console.log('checkProductDeliveryStatus: Current product ID:', product._id);

      const deliveredOrder = orders.find((order: any) => 
        order.items.some((item: any) => item.product === product._id)
      );
      console.log('checkProductDeliveryStatus: Delivered order found:', deliveredOrder);

      if (deliveredOrder) {
        setReturnOrderId(deliveredOrder._id);
        console.log('Return Order ID set to:', deliveredOrder._id);
      } else {
        setReturnOrderId(null);
        console.log('No delivered order found for this product.');
      }
    } catch (error) {
      toast.error('Failed to check product delivery status.');
      console.error('Error in checkProductDeliveryStatus:', error);
    }
  };

  const images = product?.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : (product?.image ? [product.image] : []);

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
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
      const orderData = {
        items: [{
          product: product._id,
          productName: product.name,
          productPrice: product.price,
          productImage: product.image,
          quantity: 1
        }],
        totalAmount: product.price,
        isDirectPurchase: true
      };

      sessionStorage.setItem('directPurchaseOrder', JSON.stringify(orderData));
      
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
      const { data: orders } = await api.get('/api/orders', {
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

  const handleReturnProduct = async () => {
    if (!returnOrderId || !returnReason) {
      toast.error('Please select a reason for return.');
      return;
    }

    try {
      await api.post(`/api/returns/request`, {
        orderId: returnOrderId,
        productId: product._id,
        reason: returnReason,
      });
      toast.success('Return request submitted successfully!');
      setShowReturnForm(false);
      setReturnReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit return request.');
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
        <div>
          <div className="relative overflow-hidden group">
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              className="w-full h-96 object-contain rounded-lg border border-gray-300 transform transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
                e.currentTarget.onerror = null;
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100 focus:outline-none"
                >
                  &lt;
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100 focus:outline-none"
                >
                  &gt;
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex space-x-2 mt-4 justify-center">
              {images.map((imgSrc: string, index: number) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`Thumbnail ${index + 1}`}
                  className={`w-20 h-20 object-contain rounded-md border cursor-pointer ${
                    index === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                />
              ))}
            </div>
          )}
        </div>

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

          {returnOrderId && (
            <button
              onClick={() => setShowReturnForm(true)}
              className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors duration-200"
            >
              Return Product
            </button>
          )}

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

      {showReturnForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Return Product</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for return:</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a reason</option>
                  <option value="Defective product">Defective product</option>
                  <option value="Wrong item received">Wrong item received</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Item not as described">Item not as described</option>
                  <option value="Other">Other (please specify)</option>
                </select>
              </div>
              {returnReason === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specify reason:</label>
                  <textarea
                    value={returnReason === 'Other' ? '' : returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Please provide details for your return..."
                  ></textarea>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowReturnForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnProduct}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Submit Return
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12">
        {showReviewForm && selectedOrderId && (
          <div className="mb-8">
            <ReviewForm
              productId={product._id}
              orderId={selectedOrderId}
              onReviewSubmitted={() => {
                setShowReviewForm(false);
                setSelectedOrderId(null);
                fetchProduct();
              }}
              onCancel={() => {
                setShowReviewForm(false);
                setSelectedOrderId(null);
              }}
            />
          </div>
        )}
        <ReviewList productId={product._id} />
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Customers Also Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p._id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <Link to={`/products/${p._id}`}>
                  <img 
                    src={p.image}
                    alt={p.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                      e.currentTarget.onerror = null;
                    }}
                  />
                </Link>
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate">{p.name}</h3>
                  <p className="text-gray-700 font-bold mt-1">₹{p.price.toFixed(2)}</p>
                  <button 
                    onClick={() => {
                      addToCart(p, 1);
                      toast.success('Added to cart');
                    }}
                    className="mt-3 w-full bg-primary text-white py-2 rounded-md hover:bg-blue-600"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 