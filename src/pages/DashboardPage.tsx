import { useState, Suspense, useEffect, lazy } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  GitBranch,
  ShoppingBag,
  IndianRupee,
  Award,
  Settings,
  LogOut,
  ChevronDown,
  Building,
  Bell,
  Wallet,
  Network,
  Store,
  Package,
  Boxes,
  Tags
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useMLMStore } from '../store/mlmStore';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const DashboardPage = () => {
  const { user, logout, loading } = useAuth();
  const { fetchEarnings } = useMLMStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch essential data for the dashboard when the component mounts
    fetchEarnings();
  }, [fetchEarnings]);

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
    }`;

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : '?';
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg fixed md:relative w-64 h-full z-20 flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4 flex items-center gap-3 border-b">
          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
            {userInitial}
          </div>
          <div>
            <p className="font-semibold text-sm">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-500 capitalize">Role: {user.role}</p>
          </div>
        </div>
        <div className="p-4 border-b">
          <p className="text-xs text-gray-500">
            Referral Code: <span className="font-semibold text-primary">{user.referralCode}</span>
          </p>
          {user.referredBy && (
            <p className="text-xs text-gray-500 mt-1">
              Referred By: <span className="font-semibold">{user.referrerName || 'N/A'} ({user.referredBy})</span>
            </p>
          )}
        </div>
        <nav className="flex-grow p-4 overflow-y-auto">
          <ul className="space-y-2">
            <li><NavLink to="/dashboard" end className={getNavLinkClass}> <LayoutGrid className="mr-3 h-5 w-5" /> Overview </NavLink></li>
            <li><NavLink to="/dashboard/network" className={getNavLinkClass}> <GitBranch className="mr-3 h-5 w-5" /> My Network </NavLink></li>
            <li><NavLink to="/dashboard/downline" className={getNavLinkClass}> <Network className="mr-3 h-5 w-5" /> Downline Visualizer </NavLink></li>
            <li><NavLink to="/dashboard/orders" className={getNavLinkClass}> <ShoppingBag className="mr-3 h-5 w-5" /> My Orders </NavLink></li>
            <li><NavLink to="/dashboard/earnings" className={getNavLinkClass}> <IndianRupee className="mr-3 h-5 w-5" /> Earnings </NavLink></li>
            <li><NavLink to="/dashboard/withdrawals" className={getNavLinkClass}> <Wallet className="mr-3 h-5 w-5" /> Withdrawals </NavLink></li>
            <li><NavLink to="/dashboard/rank-rewards" className={getNavLinkClass}> <Award className="mr-3 h-5 w-5" /> Rank & Rewards </NavLink></li>
            <li><NavLink to="/dashboard/settings" className={getNavLinkClass}> <Settings className="mr-3 h-5 w-5" /> Settings </NavLink></li>
            <li><NavLink to="/dashboard/notifications" className={getNavLinkClass}> <Bell className="mr-3 h-5 w-5" /> Notifications </NavLink></li>
            {user.role === 'franchise' && (
              <li><NavLink to="/dashboard/franchise" className={getNavLinkClass}> <Store className="mr-3 h-5 w-5" /> My Franchise </NavLink></li>
            )}
            {user.role === 'franchise' && (
              <li><NavLink to="/dashboard/franchise-products" className={getNavLinkClass}> <Building className="mr-3 h-5 w-5" /> Manage Products </NavLink></li>
            )}
            {user.role === 'admin' && (
              <li className="pt-4 mt-4 border-t">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Admin</p>
                <ul className="space-y-2">
                  <li><NavLink to="/dashboard/users" className={getNavLinkClass}> <Users className="mr-3 h-5 w-5" /> Manage Users </NavLink></li>
                  <li><NavLink to="/dashboard/products" className={getNavLinkClass}> <Building className="mr-3 h-5 w-5" /> Manage Products </NavLink></li>
                  <li><NavLink to="/dashboard/categories" className={getNavLinkClass}> <Tags className="mr-3 h-5 w-5" /
                  > Manage Categories </NavLink></li>

                  <li><NavLink to="/dashboard/franchises" className={getNavLinkClass}> <Store className="mr-3 h-5 w-5" /> Manage Franchises </NavLink></li>
                  <li><NavLink to="/dashboard/clients" className={getNavLinkClass}> <Users className="mr-3 h-5 w-5" /> Client Management </NavLink></li>
                  <li><NavLink to="/dashboard/ranks" className={getNavLinkClass}> <Award className="mr-3 h-5 w-5" /> Manage Ranks </NavLink></li>
                  <li><NavLink to="/dashboard/returns" className={getNavLinkClass}> <ShoppingBag className="mr-3 h-5 w-5" /> Return Requests </NavLink></li>
                  <li><NavLink to="/dashboard/withdrawals-admin" className={getNavLinkClass}> <Wallet className="mr-3 h-5 w-5" /> Manage Withdrawals </NavLink></li>
                  <li><NavLink to="/dashboard/sales" className={getNavLinkClass}> <IndianRupee className="mr-3 h-5 w-5" /> Manage Sales </NavLink></li>
                  <li><NavLink to="/dashboard/offline-orders" className={getNavLinkClass}> <Package className="mr-3 h-5 w-5" /> Manage Offline Orders </NavLink></li>
                  <li><NavLink to="/dashboard/inventory" className={getNavLinkClass}> <Boxes className="mr-3 h-5 w-5" /> Inventory Management </NavLink></li>
                  <li><NavLink to="/dashboard/notifications-admin" className={getNavLinkClass}> <Bell className="mr-3 h-5 w-5" /> Manage Notifications </NavLink></li>
                  
                </ul>
              </li>
            )}
            {['admin', 'franchise'].includes(user.role) && (
              <li><NavLink to="/dashboard/inventory" className={getNavLinkClass}> <Boxes className="mr-3 h-5 w-5" /> Inventory Management </NavLink></li>
            )}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <button onClick={logout} className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600">
            <LogOut className="mr-3 h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Top bar for mobile */}
        <header className="md:hidden bg-white shadow-md p-4 flex justify-between items-center fixed top-0 w-full z-10">
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <ChevronDown className={`h-6 w-6 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-8 pt-24">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};