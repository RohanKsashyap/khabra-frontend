import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { useCartStore } from '../store/cartStore';
import QuickBuyButton from '../components/payment/QuickBuyButton';
import toast from 'react-hot-toast';

interface ProductStock {
  currentQuantity: number;
  minimumThreshold: number;
  maximumCapacity: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock?: ProductStock;
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the active franchise ID from context or local storage
  const franchiseId = (user as any)?.franchise?._id || localStorage.getItem('activeFranchiseId');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (franchiseId) {
          params.franchiseId = franchiseId;
        }
        
        const response = await axios.get(`/products/${id}`, { params });
        
        // Update the product with stock information from the response
        const productData = response.data.data;
        
        // If stockInfo is available in the response, use it
        if (response.data.stockInfo) {
          productData.stockInfo = response.data.stockInfo;
        }
        
        setProduct(productData);
      } catch (err) {
        setError('Failed to fetch product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, franchiseId]);

  // Determine stock status display
  const getStockStatusDisplay = () => {
    if (!product?.stock) return null;

    switch (product.stock.status) {
      case 'OUT_OF_STOCK':
        return {
          text: 'Out of Stock',
          color: 'text-red-600',
          available: false
        };
      case 'LOW_STOCK':
        return {
          text: `Only ${product.stock.currentQuantity} left`,
          color: 'text-yellow-600',
          available: true
        };
      case 'IN_STOCK':
      default:
        return {
          text: 'In Stock',
          color: 'text-green-600',
          available: true
        };
    }
  };

  const stockStatus = getStockStatusDisplay();

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart({
        productId: product._id,
        quantity,
        franchiseId
      });
      
      // Show success toast
      toast.success(`${product.name} added to cart!`, {
        duration: 2000,
        position: 'top-right',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to cart';
      console.error('Add to cart error:', err);
      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  // Quantity adjustment handlers
  const incrementQuantity = () => {
    if (product?.stock && quantity < product.stock.currentQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      {/* Image Gallery */}
      <div>
        <img 
          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'} 
          alt={product.name} 
          className="w-full h-96 object-cover rounded-lg mb-4"
        />
      </div>

      {/* Product Details */}
      <div>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        
        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-gray-600">(0 reviews)</span>
        </div>
        
        <p className="text-gray-600 mb-6">{product.description}</p>
        
        {/* Price and Stock Status */}
        <div className="flex items-center mb-6">
          <div className="text-2xl font-bold text-primary mr-4">
            ₹{product.price.toFixed(2)}
          </div>
          
          {stockStatus && (
            <div className={`font-semibold ${stockStatus.color}`}>
              {stockStatus.text}
            </div>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center mb-6">
          <button 
            onClick={decrementQuantity} 
            className="bg-gray-200 px-4 py-2 rounded-l"
            disabled={quantity <= 1}
          >
            -
          </button>
          <input 
            type="number" 
            value={quantity} 
            readOnly
            className="w-16 text-center border-t border-b py-2"
          />
          <button 
            onClick={incrementQuantity} 
            className="bg-gray-200 px-4 py-2 rounded-r"
            disabled={
              !stockStatus?.available || 
              (product.stock && quantity >= product.stock.currentQuantity)
            }
          >
            +
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button 
            onClick={handleAddToCart}
            disabled={!stockStatus?.available}
          >
            Add to Cart
          </Button>
          <QuickBuyButton 
            product={product}
            quantity={quantity}
            disabled={!stockStatus?.available}
            buttonText="Buy Now with Razorpay"
          />
        </div>

        {/* Write a Review Link */}
        <div className="mt-4">
          <a href="#reviews" className="text-blue-500 hover:underline">
            Write a Review
          </a>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-gray-600">4.5 (0 reviews)</span>
          </div>
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      </div>
    </div>
  );
}; 