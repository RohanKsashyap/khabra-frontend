import React, { useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { ProductCard } from './ProductCard';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';

export function ProductGrid() {
  const { 
    fetchProducts, 
    filteredProducts,
    categories,
    selectedCategory,
    setCategory,
    searchProducts,
    isLoading
  } = useProductStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts(searchTerm);
  };
  
  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setCategory(null);
    } else {
      setCategory(category);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold">Our Products</h1>
          
          <div className="flex w-full md:w-auto items-center gap-2">
            <form onSubmit={handleSearch} className="flex flex-1 md:w-auto">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full md:w-64 py-2 px-4 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit">
                Search
              </Button>
            </form>
            
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            >
              Filters
            </Button>
          </div>
        </div>
        
        {/* Category filters */}
        <div className={`${showFilters || 'hidden md:block'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedCategory === category 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
            {selectedCategory && (
              <button
                onClick={() => setCategory(null)}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 border border-gray-300"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>
      
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}