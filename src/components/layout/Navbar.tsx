import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Store, Network, Package, LogOut, Search, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${searchQuery}`);
  };

  return (
    <nav className="bg-white border-b shadow-sm py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Network className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold">KHABRA GENERATIONS CARE</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
         
          <Link to="/business" className="text-gray-700 hover:text-primary">
            Business
          </Link>
          <Link to="/products" className="text-gray-700 hover:text-primary">
            Products
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-primary">
            About
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-primary">
            Contact
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-gray-700 hover:text-primary">
              Dashboard
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-md w-full mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Button type="submit" className="ml-2">
            Search
          </Button>
        </form>

        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative text-gray-700 hover:text-primary">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary">
                <User className="h-6 w-6" />
              </Link>
              <button 
                onClick={() => logout()}
                className="text-gray-700 hover:text-primary"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <div className="hidden md:block">
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Login / Register
                </Button>
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-primary"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 shadow-md animate-slideUpAndFade">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
            
            <div className="flex flex-col space-y-3">
              <Link to="/products" className="flex items-center text-gray-700 py-2">
                <Store className="h-5 w-5 mr-2" /> Products
              </Link>
              <Link to="/about" className="flex items-center text-gray-700 py-2">
                <Package className="h-5 w-5 mr-2" /> About
              </Link>
              <Link to="/business" className="flex items-center text-gray-700 py-2">
                <Network className="h-5 w-5 mr-2" /> Business
              </Link>
              <Link to="/contact" className="flex items-center text-gray-700 py-2">
                <Mail className="h-5 w-5 mr-2" /> Contact
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="flex items-center text-gray-700 py-2">
                    <User className="h-5 w-5 mr-2" /> Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center text-gray-700 py-2"
                  >
                    <LogOut className="h-5 w-5 mr-2" /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center text-primary py-2">
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