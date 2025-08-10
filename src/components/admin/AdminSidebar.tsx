import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Users, 
  Package, 
  Store, 
  Award, 
  IndianRupee, 
  Wallet, 
  ShoppingCart, 
  RefreshCw, 
  Bell  
} from 'lucide-react';

const adminRoutes = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { path: '/admin/users', label: 'Manage Users', icon: Users },
  { path: '/admin/products', label: 'Manage Products', icon: Package },
  { path: '/admin/franchises', label: 'Manage Franchises', icon: Store },
  { path: '/admin/client-management', label: 'Client Management', icon: Users },
  { path: '/admin/ranks', label: 'Manage Ranks', icon: Award },
  { path: '/admin/return-requests', label: 'Return Requests', icon: RefreshCw },
  { path: '/admin/withdrawals', label: 'Manage Withdrawals', icon: Wallet },
  { path: '/admin/sales', label: 'Manage Sales', icon: IndianRupee },
  { path: '/admin/offline-orders', label: 'Manage Offline Orders', icon: ShoppingCart },
  { path: '/admin/notifications', label: 'Manage Notifications', icon: Bell }
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 hidden md:block">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        {adminRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = location.pathname === route.path;
          
          return (
            <Link
              key={route.path}
              to={route.path}
              className={`flex items-center p-2 rounded-md transition-colors duration-200 ${
                isActive 
                  ? 'bg-primary text-white hover:bg-primary-dark' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              <span className="text-sm font-medium">{route.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;