import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Award } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProcessing(true);
    addItem(product, 1);
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
      addItem(product, 1);
      toast.success(`${product.name} added to cart. Redirecting to checkout...`);
      navigate('/checkout');
    } catch (error: any) {
      console.error('Error adding item to cart for Buy Now:', error);
      toast.error('Failed to add item to prepare for checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  const discountPercentage = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`}>
      <div className="group relative bg-white border rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Discount badge */}
        {product.salePrice && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {discountPercentage}% OFF
          </div>
        )}
        
        {/* Product Image */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-gray-900 font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center mb-3">
            <Award className="h-4 w-4 text-primary mr-1" />
            <span className="text-xs text-primary font-medium">PV: {product.pv} | BV: {product.bv}</span>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div>
              {product.salePrice ? (
                <div className="flex items-baseline">
                  <span className="text-gray-400 text-sm line-through mr-2">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-gray-900 font-bold">
                    {formatCurrency(product.salePrice)}
                  </span>
                </div>
              ) : (
                <span className="text-gray-900 font-bold">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            
            <Button
              size="sm"
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