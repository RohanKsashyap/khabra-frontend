import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { useCartStore } from '../store/cartStore';
import QuickBuyButton from '../components/payment/QuickBuyButton';
import toast from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';

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
  // Backend provides `image` (single). Some datasets may have `images`.
  image?: string;
  images?: string[];
  // Backend primary field is numeric `stock`. Optionally we may have richer info in `stockInfo`.
  stock?: number;
  stockInfo?: ProductStock;
  category?: {
    _id: string;
    name: string;
    displayName: string;
  } | string;
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Get the active franchise ID from context or local storage
  const franchiseId = (user as any)?.franchise?._id || (user as any)?.franchise || localStorage.getItem('activeFranchiseId');

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
  const getComputedStockInfo = () => {
    if (!product) return null;

    // Prefer detailed stockInfo if present
    if (product.stockInfo) {
      return product.stockInfo;
    }

    // Fallback to numeric stock from backend
    if (typeof product.stock === 'number') {
      const qty = product.stock;
      return {
        currentQuantity: qty,
        minimumThreshold: 0,
        maximumCapacity: Math.max(qty * 2, 0),
        status: qty > 0 ? (qty <= 10 ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK'
      } satisfies ProductStock;
    }

    return null;
  };

  const computedStock = getComputedStockInfo();

  const stockStatus = (() => {
    if (!computedStock) return null;
    switch (computedStock.status) {
      case 'OUT_OF_STOCK':
        return { text: 'Out of Stock', color: 'text-red-600', available: false } as const;
      case 'LOW_STOCK':
        return { text: `Only ${computedStock.currentQuantity} left`, color: 'text-yellow-600', available: true } as const;
      case 'IN_STOCK':
      default:
        return { text: 'In Stock', color: 'text-green-600', available: true } as const;
    }
  })();

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
    const maxQty = computedStock?.currentQuantity ?? 0;
    if (maxQty > 0 && quantity < maxQty) setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Reset gallery index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?._id]);

  if (loading) return <LoadingState />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!product) return <div>Product not found</div>;

  // Build gallery images
  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.image ? [product.image] : []);

  return (
    <div className="container mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      {/* Image Gallery */}
      <div>
        <div className="relative w-full h-96 bg-white border rounded-2xl overflow-hidden shadow-sm">
          <img
            src={galleryImages[activeImageIndex] || '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
        </div>
        {galleryImages.length > 1 && (
          <div className="mt-4 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-3">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-20 rounded-xl overflow-hidden border ${idx === activeImageIndex ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-col">
        {/* Title and badges */}
        <div className="mb-2 flex items-center gap-3">
          {product.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
              {typeof product.category === 'object' ? product.category.displayName : product.category}
            </span>
          )}
          {stockStatus && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              stockStatus.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {stockStatus.text}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-3 leading-tight">{product.name}</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

        {/* Price */}
        <div className="flex items-center gap-4 flex-wrap mb-6">
          <div className="text-3xl font-extrabold text-gray-900">
            {formatCurrency(product.price)}
          </div>
          {computedStock && (
            <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Available: <span className="font-semibold text-gray-700">{computedStock.currentQuantity}</span>
            </div>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <div className="inline-flex items-stretch rounded-xl overflow-hidden border border-gray-200">
            <button
              onClick={decrementQuantity}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <div className="px-5 py-2 min-w-[64px] text-center font-semibold text-gray-900 bg-white select-none">
              {quantity}
            </div>
            <button
              onClick={incrementQuantity}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
              disabled={
                !stockStatus?.available ||
                (computedStock?.currentQuantity !== undefined && quantity >= computedStock.currentQuantity)
              }
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
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
      </div>
    </div>
  );
}; 