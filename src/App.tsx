import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useProductStore } from './store/productStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';

// Import HomePage directly instead of lazy loading
import { HomePage } from './pages/HomePage';
const BusinessPage = lazy(() => import('./pages/BusinessPage').then(module => ({ default: module.BusinessPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(module => ({ default: module.ProductsPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(module => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage').then(module => ({ default: module.CheckoutSuccessPage })));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(module => ({ default: module.ProductDetailPage })));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage').then(module => ({ default: module.OrderDetailPage })));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage').then(module => ({ default: module.MyOrdersPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const TermsAndConditionsPage = lazy(() => import('./pages/TermsAndConditionsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const FranchisesPage = lazy(() => import('./pages/FranchisesPage'));
const FranchiseDashboard = lazy(() => import('./pages/FranchiseDashboard'));
const FranchiseCreateOrderPage = lazy(() => import('./pages/FranchiseCreateOrderPage'));
const FranchiseProductsPage = lazy(() => import('./pages/FranchiseProductsPage'));

// Dashboard pages
const DashboardOverview = lazy(() => import('./components/dashboard/DashboardOverview').then(module => ({ default: module.DashboardOverview })));
const MyNetworkPage = lazy(() => import('./pages/MyNetworkPage'));
const DownlineVisualizer = lazy(() => import('./components/dashboard/DownlineVisualizer'));
const EarningsPage = lazy(() => import('./pages/EarningsPage'));
const WithdrawalPanel = lazy(() => import('./components/dashboard/WithdrawalPanel'));
const RankRewardsPage = lazy(() => import('./pages/RankRewardsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotificationPage = lazy(() => import('./pages/NotificationPage').then(module => ({ default: module.NotificationPage })));

// Admin pages
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const AdminFranchisePage = lazy(() => import('./pages/AdminFranchisePage'));
const AdminFranchiseDetailPage = lazy(() => import('./pages/AdminFranchiseDetailPage'));
const AdminClientManagementPage = lazy(() => import('./pages/AdminClientManagementPage'));
const AdminRanksPage = lazy(() => import('./pages/AdminRanksPage'));
const AdminReturnRequestsPage = lazy(() => import('./pages/AdminReturnRequestsPage'));
const AdminWithdrawalsPage = lazy(() => import('./pages/AdminWithdrawalsPage'));
const AdminTotalSalesPage = lazy(() => import('./pages/AdminTotalSalesPage'));
const AdminOfflineOrdersPage = lazy(() => import('./pages/AdminOfflineOrdersPage'));
const AdminNotificationsPage = lazy(() => import('./pages/AdminNotificationsPage'));
const AdminInventoryPage = lazy(() => import('./pages/AdminInventoryPage').then(module => ({ default: module.AdminInventoryPage })));
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage'));
const AdminUserCommissionPage = lazy(() => import('./pages/AdminUserCommissionPage'));
const UserNetworkManagementPage = lazy(() => import('./pages/UserNetworkManagementPage'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const { fetchProducts } = useProductStore();
  const location = useLocation();
  
  useEffect(() => {
    // Only fetch products if we're on a page that needs them and not on auth pages
    const productPages = ['/products', '/', '/business'];
    
    if (productPages.includes(location.pathname) || location.pathname.startsWith('/products/')) {
      fetchProducts();
    }
  }, [location.pathname, fetchProducts]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/business" element={<PageTransition><BusinessPage /></PageTransition>} />
          <Route path="/products" element={<PageTransition><ProductsPage /></PageTransition>} />
          <Route path="/products/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
          <Route path="/checkout/success" element={<PageTransition><CheckoutSuccessPage /></PageTransition>} />
          <Route path="/payment/success" element={<PageTransition><PaymentSuccessPage /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsAndConditionsPage /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPolicyPage /></PageTransition>} />
          <Route path="/franchises" element={<PageTransition><FranchisesPage /></PageTransition>} />

          {/* Auth Routes */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
          <Route path="/reset-password/:token" element={<PageTransition><ResetPasswordPage /></PageTransition>} />

          {/* User & Admin Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="network" element={<MyNetworkPage />} />
            <Route path="downline" element={<DownlineVisualizer />} />
            <Route path="network-management" element={<UserNetworkManagementPage />} />
            <Route path="orders" element={<MyOrdersPage />} />
            <Route path="earnings" element={<EarningsPage />} />
            <Route path="withdrawals" element={<WithdrawalPanel />} />
            <Route path="rank-rewards" element={<RankRewardsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationPage />} />
            {/* Franchise Owner Only Route */}
            <Route path="franchise" element={<ProtectedRoute franchiseOwnerOnly><FranchiseDashboard /></ProtectedRoute>} />
            {/* Franchise Product Management */}
            <Route path="franchise-products" element={<ProtectedRoute><FranchiseProductsPage /></ProtectedRoute>} />
            {/* Admin Only Routes */}
            <Route path="users" element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />
            <Route path="products" element={<ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>} />
            <Route path="franchises" element={<ProtectedRoute adminOnly><AdminFranchisePage /></ProtectedRoute>} />
            <Route path="franchises/:id" element={<ProtectedRoute adminOnly><AdminFranchiseDetailPage /></ProtectedRoute>} />
            <Route path="clients" element={<ProtectedRoute adminOnly><AdminClientManagementPage /></ProtectedRoute>} />
            <Route path="ranks" element={<ProtectedRoute adminOnly><AdminRanksPage /></ProtectedRoute>} />
            <Route path="returns" element={<ProtectedRoute adminOnly><AdminReturnRequestsPage /></ProtectedRoute>} />
            <Route path="withdrawals-admin" element={<ProtectedRoute adminOnly><AdminWithdrawalsPage /></ProtectedRoute>} />
            <Route path="sales" element={<ProtectedRoute adminOnly><AdminTotalSalesPage /></ProtectedRoute>} />
            <Route path="offline-orders" element={<ProtectedRoute adminOnly><AdminOfflineOrdersPage /></ProtectedRoute>} />
            <Route path="notifications-admin" element={<ProtectedRoute adminOnly><AdminNotificationsPage /></ProtectedRoute>} />
            <Route path="inventory" element={<ProtectedRoute><AdminInventoryPage /></ProtectedRoute>} />
            <Route path="categories" element={<ProtectedRoute adminOnly><AdminCategoriesPage /></ProtectedRoute>} />
            <Route path="user-commission/:userId" element={<ProtectedRoute adminOnly><AdminUserCommissionPage /></ProtectedRoute>} />
          </Route>

          {/* Franchise Owner Only Route: Franchise Create Order */}
          <Route path="/franchise/create-order" element={<ProtectedRoute franchiseOwnerOnly><FranchiseCreateOrderPage /></ProtectedRoute>} />

          <Route
            path="/my-orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Notification redirect */}
          <Route path="/notifications" element={<Navigate to="/dashboard/notifications" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-4">
            <Suspense fallback={<LoadingSpinner />}>
              <AppRoutes />
            </Suspense>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;