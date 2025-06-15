import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Store, Network, Package, LogOut, Search, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';
import { colors, shadows, fontSizes } from '../../styles/theme';
import { CartItem } from '../../store/cartStore';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const { totalItems, items, getTotalAmount } = useCartStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.length > 2) {
        const fetchedSuggestions = [
          `Search result for ${searchQuery} 1`,
          `Search result for ${searchQuery} 2`,
          `Search result for ${searchQuery} 3`,
        ];
        setSuggestions(fetchedSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${searchQuery}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    navigate(`/products?search=${suggestion}`);
    setShowSuggestions(false);
  };

  return (
    <nav style={{ backgroundColor: colors.cardBackground, borderBottom: `1px solid ${colors.background}`, boxShadow: shadows.sm }} className="py-2 fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Network className="h-8 w-8" style={{ color: colors.primary }} />
            <span className="font-bold" style={{ fontSize: fontSizes.xl, color: colors.textPrimary }}>KHABRA GENERATIONS CARE</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
         
          <Link to="/business" className="hover:text-primary" style={{ color: colors.textSecondary }}>
            Business
          </Link>
          <Link to="/products" className="hover:text-primary" style={{ color: colors.textSecondary }}>
            Products
          </Link>
          <Link to="/about" className="hover:text-primary" style={{ color: colors.textSecondary }}>
            About
          </Link>
          <Link to="/contact" className="hover:text-primary" style={{ color: colors.textSecondary }}>
            Contact
          </Link>
          {!loading && user && (
            <Link to="/dashboard" className="hover:text-primary" style={{ color: colors.textSecondary }}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-md w-full mx-4 relative">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              style={{ borderColor: colors.neutral, color: colors.textPrimary, outlineColor: colors.primary }}
              className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5" style={{ color: colors.neutral }} />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" className="ml-2" style={{ backgroundColor: colors.primary, color: colors.cardBackground }}>
            Search
          </Button>
        </form>

        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          <div 
            className="relative" 
            onMouseEnter={() => setIsCartPreviewOpen(true)}
            onMouseLeave={() => setIsCartPreviewOpen(false)}
          >
            <Link to="/cart" className="relative hover:text-primary" style={{ color: colors.textSecondary }}>
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                  {totalItems}
                </span>
              )}
            </Link>
            {isCartPreviewOpen && (totalItems > 0) && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4"
                onMouseEnter={() => setIsCartPreviewOpen(true)}
                onMouseLeave={() => setIsCartPreviewOpen(false)}
              >
                <h3 className="text-lg font-bold mb-3">Your Cart ({totalItems} items)</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {items.map((item: CartItem) => (
                    <div key={item.product} className="flex items-center space-x-3">
                      <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm truncate">{item.productName}</p>
                        <p className="text-gray-600 text-xs">{item.quantity} x ₹{item.productPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between items-center">
                  <span className="text-md font-bold">Total: ₹{getTotalAmount().toFixed(2)}</span>
                  <Link to="/cart">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      style={{ backgroundColor: colors.primary, color: colors.cardBackground }}
                      onClick={() => setIsCartPreviewOpen(false)}
                    >
                      View Cart
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {!loading && user ? (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/dashboard" className="hover:text-primary" style={{ color: colors.textSecondary }}>
                <User className="h-6 w-6" />
              </Link>
              <button 
                onClick={logout}
                className="hover:text-primary" style={{ color: colors.textSecondary }}
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <div className="hidden md:block">
              <Link to="/login">
                <Button variant="primary" size="sm" style={{ backgroundColor: colors.primary, color: colors.cardBackground }}>
                  Login / Register
                </Button>
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden hover:text-primary" style={{ color: colors.textSecondary }}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{ backgroundColor: colors.cardBackground, boxShadow: shadows.md }} className="md:hidden py-4 animate-slideUpAndFade">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="mb-4 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ borderColor: colors.neutral, color: colors.textPrimary, outlineColor: colors.primary }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5" style={{ color: colors.neutral }} />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
            
            <div className="flex flex-col space-y-3">
              <Link to="/products" className="flex items-center py-2" style={{ color: colors.textSecondary }}>
                <Store className="h-5 w-5 mr-2" /> Products
              </Link>
              <Link to="/about" className="flex items-center py-2" style={{ color: colors.textSecondary }}>
                <Package className="h-5 w-5 mr-2" /> About
              </Link>
              <Link to="/business" className="flex items-center py-2" style={{ color: colors.textSecondary }}>
                <Network className="h-5 w-5 mr-2" /> Business
              </Link>
              <Link to="/contact" className="flex items-center py-2" style={{ color: colors.textSecondary }}>
                <Mail className="h-5 w-5 mr-2" /> Contact
              </Link>
              
              {!loading && user ? (
                <>
                  <Link to="/dashboard" className="flex items-center py-2" style={{ color: colors.textSecondary }}>
                    <User className="h-5 w-5 mr-2" /> Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center py-2" style={{ color: colors.textSecondary }}
                  >
                    <LogOut className="h-5 w-5 mr-2" /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center py-2" style={{ color: colors.primary }}>
                  <User className="h-5 w-5 mr-2" /> Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}