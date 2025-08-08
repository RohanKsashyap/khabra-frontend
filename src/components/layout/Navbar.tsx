import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Search, Bell, Home, ShoppingBag, Briefcase, Store, MessageCircle, LayoutGrid, GitBranch, DollarSign, Wallet, Award, Settings, Users, Package, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const cartStore = useCartStore();
  const totalItems = cartStore.items.length;
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Logout function with safe fallback
  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      // Fallback logout behavior
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

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
        scrolled ? 'bg-white/90 shadow-md backdrop-blur border-b border-gray-100' : 'bg-white/70 backdrop-blur'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-6 md:mr-10">
          <img
            src="/logo-navbar.png"
            alt="Khabra Generations Care Logo"
            className="h-20 md:h-24 w-auto object-contain transform origin-left scale-150 md:scale-[1.8]"
          />
        </Link>
        {/* Links */}
        <div className="hidden md:flex gap-1 text-sm lg:text-base font-medium whitespace-nowrap pl-6">
          <Link to="/" className="px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition">Home</Link>
          <Link to="/products" className="px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition">Products</Link>
          <Link to="/business" className="px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition">Business</Link>
          <Link to="/franchises" className="px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition">Franchises</Link>
          <Link to="/contact" className="px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition">Contact</Link>
          {!loading && user && (
            <Link to="/dashboard" className="px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition">Dashboard</Link>
          )}
        </div>
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-md w-full mx-4 relative">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-full text-sm bg-white/90 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1 overflow-hidden">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" size="sm" className="ml-2 rounded-full">
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
              <ShoppingCart className="h-5 w-5 text-gray-700 hover:text-blue-600 transition" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center bg-blue-600">
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
                  {cartStore.items.map((item) => (
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
                  <span className="text-md font-bold">Total: ₹{cartStore.getTotalAmount().toFixed(2)}</span>
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
            <Bell className="h-5 w-5 text-gray-700 group-hover:text-blue-600 transition" />
          </Link>
          {!loading && user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/dashboard">
                <User className="h-5 w-5 text-gray-700 hover:text-blue-600 transition" />
              </Link>
              <button onClick={handleLogout}>
                <LogOut className="h-5 w-5 text-gray-700 hover:text-red-600 transition" />
              </button>
            </div>
          ) : (
            <div className="hidden md:block">
              <Link to="/login">
                <Button size="sm" className="px-4">Login / Register</Button>
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
      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-screen w-4/5 max-w-xs bg-white shadow-lg flex flex-col p-6 animate-slide-in overflow-y-auto">
            <button
              className="self-end mb-6"
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
            {/* Mobile Search Bar */}
            <form onSubmit={(e) => { handleSearch(e); toggleMenu(); }} className="mb-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full py-2 pl-8 pr-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                />
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          handleSuggestionClick(suggestion);
                          toggleMenu();
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" className="mt-2 w-full">Search</Button>
            </form>

            {/* User Profile and Actions Section */}
            {!loading && user ? (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="font-semibold">{user.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Main Navigation Links */}
            <nav className="flex flex-col gap-5 text-lg font-medium mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Main Menu</h3>
              <Link to="/" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                <Home className="h-5 w-5" /> Home
              </Link>
              <Link to="/products" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                <ShoppingBag className="h-5 w-5" /> Products
              </Link>
              <Link to="/business" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                <Briefcase className="h-5 w-5" /> Business
              </Link>
              <Link to="/franchises" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                <Store className="h-5 w-5" /> Franchises
              </Link>
              <Link to="/contact" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                <MessageCircle className="h-5 w-5" /> Contact
              </Link>
            </nav>

            {/* User Dashboard Links */}
            {!loading && user && (
              <nav className="flex flex-col gap-5 text-lg font-medium mb-6 border-t pt-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">My Dashboard</h3>
                <Link to="/dashboard" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                  <LayoutGrid className="h-5 w-5" /> Dashboard
                </Link>
                <Link to="/dashboard/network" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                  <GitBranch className="h-5 w-5" /> My Network
                </Link>
                <Link to="/dashboard/orders" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5" /> My Orders
                </Link>
                <Link to="/dashboard/earnings" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                  <DollarSign className="h-5 w-5" /> Earnings
                </Link>
                <Link to="/dashboard/withdrawals" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                  <Wallet className="h-5 w-5" /> Withdrawals
                </Link>
                <Link to="/dashboard/rank-rewards" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                  <Award className="h-5 w-5" /> Rank & Rewards
                </Link>
                <Link to="/dashboard/settings" onClick={toggleMenu} className="hover:underline underline-offset-4 flex items-center gap-3">
                  <Settings className="h-5 w-5" /> Settings
                </Link>
              </nav>
            )}

            {/* Admin Dashboard Links */}
            {!loading && user && user.role === 'admin' && (
              <nav className="flex flex-col gap-5 text-lg font-medium mb-6 border-t pt-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Admin Panel</h3>
                <button onClick={(e) => { e.stopPropagation(); navigate("/dashboard"); setTimeout(toggleMenu, 100); }} className="hover:underline underline-offset-4 flex items-center gap-3 text-left w-full">
                  <LayoutGrid className="h-5 w-5" /> Dashboard
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate("/dashboard/users"); setTimeout(toggleMenu, 100); }} className="hover:underline underline-offset-4 flex items-center gap-3 text-left w-full">
                  <Users className="h-5 w-5" /> Manage Users
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate("/dashboard/products"); setTimeout(toggleMenu, 100); }} className="hover:underline underline-offset-4 flex items-center gap-3 text-left w-full">
                  <Package className="h-5 w-5" /> Manage Products
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate("/dashboard/franchises"); setTimeout(toggleMenu, 100); }} className="hover:underline underline-offset-4 flex items-center gap-3 text-left w-full">
                  <Store className="h-5 w-5" /> Manage Franchises
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate("/dashboard/clients"); setTimeout(toggleMenu, 100); }} className="hover:underline underline-offset-4 flex items-center gap-3 text-left w-full">
                  <Users className="h-5 w-5" /> Client Management
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate("/dashboard/ranks"); setTimeout(toggleMenu, 100); }} className="hover:underline underline-offset-4 flex items-center gap-3 text-left w-full">
                  <Award className="h-5 w-5" /> Manage Ranks
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate("/dashboard/returns"); setTimeout(toggleMenu, 100); }} className="hover:underline underline-offset-4 flex items-center gap-3 text-left w-full">
                  <RefreshCw className="h-5 w-5" /> Return Requests
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate("/dashboard/withdrawals-admin"); setTimeout(toggleMenu, 100); }} className="hover:underline underline-offset-4 flex items-center gap-3 text-left w-full">
                  <Wallet className="h-5 w-5" /> Manage Withdrawals
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate("/dashboard/sales"); setTimeout(toggleMenu, 100); }} className="hover:underline underline-offset-4 flex items-center gap-3 text-left w-full">
                  <DollarSign className="h-5 w-5" /> Manage Sales
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate("/dashboard/offline-orders"); setTimeout(toggleMenu, 100); }} className="hover:underline underline-offset-4 flex items-center gap-3 text-left w-full">
                  <ShoppingCart className="h-5 w-5" /> Manage Offline Orders
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate("/dashboard/notifications-admin"); setTimeout(toggleMenu, 100); }} className="hover:underline underline-offset-4 flex items-center gap-3 text-left w-full">
                  <Bell className="h-5 w-5" /> Manage Notifications
                </button>
              </nav>
            )}

            {/* Quick Actions */}
            <div className="flex flex-col gap-4 border-t pt-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Quick Actions</h3>
              <Link to="/cart" onClick={toggleMenu} className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5" /> Cart
                {totalItems > 0 && (
                  <span className="ml-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center bg-black">{totalItems}</span>
                )}
              </Link>
              <Link to="/notifications" onClick={toggleMenu} className="flex items-center gap-3">
                <Bell className="h-5 w-5" /> Notifications
              </Link>
            </div>

            {/* User Actions */}
            <div className="mt-6 border-t pt-6">
              {!loading && user ? (
                <>
                  <button 
                    onClick={() => { handleLogout(); toggleMenu(); }} 
                    className="w-full flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg"
                  >
                    <LogOut className="h-5 w-5" /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={toggleMenu} className="w-full">
                  <Button className="w-full">Login / Register</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}