import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Award, Star, Gift } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCartStore();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add to cart.');
      navigate('/login', { state: { from: `/products/${product._id}` } });
      return;
    }

    setIsProcessing(true);
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
    setIsProcessing(false);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to buy now.');
      navigate('/login', { state: { from: `/products/${product._id}` } });
      return;
    }

    setIsProcessing(true);
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart. Redirecting to checkout...`);
      navigate('/checkout');
    } catch (error: any) {
      console.error('Error adding item to cart for Buy Now:', error);
      toast.error('Failed to add item to prepare for checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate points (now using commission field)
  const points = product.commission;

  return (
    <Link to={`/products/${product._id}`}>
      <div className="group relative bg-white border rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 transform-gpu scale-100 hover:scale-105">
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
          {points} pts
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
            <span className="text-green-600 font-semibold text-sm">
              In Stock ({product.stock})
            </span>
          </div>
          {/* Points info box */}
          <div className="bg-orange-50 rounded-lg p-3 mb-4">
            <span className="text-orange-700 font-semibold">Earn Points:</span>
            <span className="text-orange-500 font-bold ml-2">{points} pts</span>
            <div className="text-xs text-gray-500 mt-1">
              Points earned when you purchase this product
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-600 transition"
              onClick={handleAddToCart}
              leftIcon={<ShoppingCart className="h-4 w-4" />}
              disabled={isProcessing}
            >
              Add to Cart
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleBuyNow}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Buy Now'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}