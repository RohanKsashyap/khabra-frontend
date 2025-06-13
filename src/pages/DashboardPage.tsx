import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  Award, 
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Repeat,
  Package
} from 'lucide-react';
import { Button } from '../components/ui/Button';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // ProtectedRoute will handle the redirect
  }
  
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard' },
    { id: 'network', label: 'My Network', icon: <Users className="h-5 w-5" />, path: '/dashboard/network' },
    { id: 'orders', label: 'My Orders', icon: <ShoppingBag className="h-5 w-5" />, path: '/dashboard/orders' },
    { id: 'earnings', label: 'Earnings', icon: <CreditCard className="h-5 w-5" />, path: '/dashboard/earnings' },
    { id: 'ranks', label: 'Rank & Rewards', icon: <Award className="h-5 w-5" />, path: '/dashboard/rank-rewards' },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/dashboard/settings' },
  ];
  
  if (user.role === 'admin') {
    navItems.push(
      { id: 'products', label: 'Manage Products', icon: <Package className="h-5 w-5" />, path: '/dashboard/products' },
      { id: 'returns', label: 'Manage Returns', icon: <Repeat className="h-5 w-5" />, path: '/dashboard/returns' }
    );
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : '?';
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-sm">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center">
            <User className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold">KHABRA GENERATIONS CARE</span>
          </Link>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              {userInitial}
            </div>
            <div className="ml-3">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {user.role === 'distributor' ? 'Distributor' : user.role}
            </span>
            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 ml-2">
              Gold Rank
            </span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center w-full p-3 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t mt-auto">
          <button
            onClick={logout}
            className="flex items-center justify-center w-full p-3 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 mr-4"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <span className="text-lg font-bold">Dashboard</span>
          </div>
          
          <div className="flex items-center">
            <Link to="/cart" className="relative text-gray-700 mr-4">
              <ShoppingBag className="h-6 w-6" />
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              {userInitial}
            </div>
          </div>
        </header>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg absolute top-16 left-0 right-0 z-20 animate-slideUpAndFade">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  {userInitial}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map(item => (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={`flex items-center w-full p-3 rounded-md transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={logout}
                    className="flex items-center w-full p-3 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Log Out</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
      <div className="text-6xl text-gray-300 mb-4">🚧</div>
      <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
      <p className="text-gray-500 text-center max-w-md">
        We're working hard to bring you this feature. Please check back soon!
      </p>
    </div>
  );
}