import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Award, Star, Gift } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axios';

interface ProductCardProps {
  product: Product;
  franchiseId?: string; // Optional franchise ID
}

export function ProductCard({ product, franchiseId }: ProductCardProps) {
  const { addToCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Determine current franchise ID
  const currentFranchiseId = franchiseId || user?.franchise;

  // Get stock information
  const getStockInfo = () => {
    // If inventoryDetails exist, use that
    if (product.inventoryDetails) {
      return {
        currentQuantity: product.inventoryDetails.currentQuantity,
        status: product.inventoryDetails.status,
        franchiseStock: product.inventoryDetails.franchiseStocks?.find(
          stock => stock.franchiseId === currentFranchiseId
        )?.quantity || 0
      };
    }

    // Fallback to legacy stock
    return {
      currentQuantity: product.stock || 0,
      status: product.stock > 0 ? 
        (product.stock <= 10 ? 'LOW_STOCK' : 'IN_STOCK') : 
        'OUT_OF_STOCK',
      franchiseStock: product.stock || 0
    };
  };

  const stockInfo = getStockInfo();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add to cart.');
      navigate('/login', { state: { from: `/products/${product._id}` } });
      return;
    }

    if (stockInfo.currentQuantity < 1) {
      toast.error('Sorry, this product is out of stock.');
      return;
    }

    setIsProcessing(true);
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        ...(currentFranchiseId ? { franchiseId: currentFranchiseId } : {})
      });
      toast.success(`${product.name} added to cart!`);
    } catch (error: any) {
      console.error('Failed to add to cart', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to buy now.');
      navigate('/login', { state: { from: `/products/${product._id}` } });
      return;
    }

    if (stockInfo.currentQuantity < 1) {
      toast.error('Sorry, this product is out of stock.');
      return;
    }

    setIsProcessing(true);
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        ...(currentFranchiseId ? { franchiseId: currentFranchiseId } : {})
      });
      toast.success(`${product.name} added to cart. Redirecting to checkout...`);
      navigate('/checkout');
    } catch (error: any) {
      console.error('Error adding item to cart for Buy Now:', error);
      toast.error('Failed to prepare for checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  // Stock status display logic
  const getStockStatusDisplay = () => {
    switch (stockInfo.status) {
      case 'OUT_OF_STOCK':
        return {
          text: 'Out of Stock',
          color: 'text-red-600'
        };
      case 'LOW_STOCK':
        return {
          text: `Only ${stockInfo.currentQuantity} left`,
          color: 'text-yellow-600'
        };
      case 'IN_STOCK':
      default:
        return {
          text: 'In Stock',
          color: 'text-green-600'
        };
    }
  };

  const stockStatus = getStockStatusDisplay();

  return (
    <div className="group relative bg-white border rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 transform-gpu scale-100 hover:scale-105">
      <Link to={`/products/${product._id}`} className="block">
        <div className="cursor-pointer">
          {/* Category badge */}
          <span className="absolute top-3 left-3 z-20 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {product.category}
          </span>
          {/* Rating badge */}
          <span className="absolute top-3 right-3 z-20 flex items-center bg-white text-yellow-500 text-xs font-bold px-2 py-1 rounded-full shadow">
            <Star className="w-4 h-4 mr-1 fill-yellow-400 stroke-yellow-400" />
            {product.averageRating?.toFixed(1) || '4.8'}
          </span>
          {/* Points badge */}
          <span className="absolute bottom-3 right-3 z-20 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
            <Gift className="w-4 h-4 mr-1" />
            {product.commission} pts
          </span>
          {/* Product Image */}
          <div className="relative h-56 overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          {/* Product Info */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="text-gray-900 font-semibold text-xl mb-1 line-clamp-1">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-900 font-bold">
                {formatCurrency(product.price)}
              </span>
              <span className={`font-semibold text-sm ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>
            {/* Stock information */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-700 font-semibold">Available Stock:</span>
                <span className={`font-bold ${stockStatus.color}`}>
                  {stockInfo.currentQuantity}
                </span>
              </div>
              {currentFranchiseId && (
                <div className="text-xs text-gray-500 mt-1">
                  Franchise Stock: {stockInfo.franchiseStock}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Action Buttons */}
      <div className="p-5 pt-0">
        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleAddToCart}
            disabled={isProcessing || stockInfo.currentQuantity < 1}
            className="bg-gradient-to-r from-blue-600 to-purple-500 text-white font-semibold py-3 rounded-xl"
          >
            Add to Cart
          </Button>
          <Button
            variant="secondary"
            onClick={handleBuyNow}
            disabled={isProcessing || stockInfo.currentQuantity < 1}
          >
            {isProcessing ? 'Processing...' : 'Buy Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}