import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Network, LogOut, Search, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const { totalItems, items, getTotalAmount } = useCartStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
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
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 shadow-lg backdrop-blur border-b border-gray-200' : 'bg-transparent'
      }`}
    >
      <div className="container flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-navbar.png" alt="Khabra Generations Care Logo" className="h-14 w-auto object-contain" />
        </Link>
        {/* Links */}
        <div className="hidden md:flex gap-5 text-base font-medium">
          <Link to="/business" className="hover:underline underline-offset-4">Business</Link>
          <Link to="/products" className="hover:underline underline-offset-4">Products</Link>
          <Link to="/about" className="hover:underline underline-offset-4">About</Link>
          <Link to="/contact" className="hover:underline underline-offset-4">Contact</Link>
          {!loading && user && (
            <Link to="/dashboard" className="hover:underline underline-offset-4">Dashboard</Link>
          )}
          {!loading && user && user.role === 'admin' && (
            <Link to="/admin" className="hover:underline underline-offset-4 text-red-600 font-semibold">Admin</Link>
          )}
        </div>
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-md w-full mx-2 relative">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full py-1.5 pl-8 pr-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            />
            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" className="ml-1 px-3 py-1 text-sm">
            Search
          </Button>
        </form>
        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <div
            className="relative"
            onMouseEnter={() => setIsCartPreviewOpen(true)}
            onMouseLeave={() => setIsCartPreviewOpen(false)}
          >
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center bg-black">
                  {totalItems}
                </span>
              )}
            </Link>
            {isCartPreviewOpen && totalItems > 0 && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4"
                onMouseEnter={() => setIsCartPreviewOpen(true)}
                onMouseLeave={() => setIsCartPreviewOpen(false)}
              >
                <h3 className="text-lg font-bold mb-3">Your Cart ({totalItems} items)</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {items.map((item) => (
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
                    <Button onClick={() => setIsCartPreviewOpen(false)}>
                      View Cart
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          {/* Notification Icon */}
          <Link to="/notifications" className="relative group">
            <Bell className="h-5 w-5 text-gray-700 group-hover:text-primary transition" />
          </Link>
          {!loading && user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/dashboard">
                <User className="h-5 w-5" />
              </Link>
              <button onClick={logout}>
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="hidden md:block">
              <Link to="/login">
                <Button className="px-4 py-1 text-sm">Login / Register</Button>
              </Link>
            </div>
          )}
          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
}