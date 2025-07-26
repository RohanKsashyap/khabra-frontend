import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProductCard } from './ProductCard';
import { api } from '../../services/api';
import { LoadingState } from '../ui/LoadingState';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  stock?: {
    currentQuantity: number;
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  };
}

interface ProductGridProps {
  category?: string;
  search?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  category, 
  search 
}) => {
  const { user } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Get the active franchise ID from context or local storage
  const franchiseId = user?.activeFranchiseId || localStorage.getItem('activeFranchiseId');

  useEffect(() => {
    // Reset products and pagination when search or category changes
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [category, search]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!franchiseId) return;

      try {
        setLoading(true);
        const response = await api.get('/products', {
          params: {
            category,
            search,
            page,
            franchiseId
          }
        });

        const newProducts = response.data.data;

        // Update products
        setProducts(prev => page === 1 
          ? newProducts 
          : [...prev, ...newProducts]
        );

        // Check if there are more products
        setHasMore(newProducts.length > 0);
      } catch (err) {
        setError('Failed to fetch products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (franchiseId) {
      fetchProducts();
    }
  }, [category, search, page, franchiseId]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && products.length === 0) {
    return <LoadingState />;
  }

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-600 py-8">
        No products found
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map(product => (
          <ProductCard 
            key={product._id} 
            product={product}
            franchiseId={franchiseId}
          />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button 
            onClick={loadMore} 
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};