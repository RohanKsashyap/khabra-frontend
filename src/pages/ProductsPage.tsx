import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { Product } from '../types';
import toast from 'react-hot-toast';

export const ProductsPage = () => {
  const navigate = useNavigate();
  const { products, isLoading, error, fetchProducts } = useProductStore();
  const { addToCart } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    fetchProducts({ category: category || undefined });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchProducts({ search: query });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart!`, {
        duration: 1000,
        position: 'top-right',
      });
    } catch (error) {
      toast.error('Failed to add item to cart', {
        duration: 1000,
        position: 'top-right',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Error: {error}</p>
      </div>
    );
  }

  const categories = [...new Set(products.map(product => product.category))];

  return (
    <div className="container mx-auto px-4 py-8 pt-16">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      
      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 p-2 border rounded"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <select
            className="p-2 border rounded"
            value={selectedCategory || ''}
            onChange={(e) => handleCategoryChange(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleProductClick(product._id)}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">₹{product.price}</span>
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>No products found</p>
        </div>
      )}
    </div>
  );
};