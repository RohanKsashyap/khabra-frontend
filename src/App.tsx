import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';
import { AnimatePresence } from 'framer-motion';
import { useProductStore } from './store/productStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Lazy load pages to reduce initial bundle size
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const BusinessPage = lazy(() => import('./pages/BusinessPage').then(module => ({ default: module.BusinessPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(module => ({ default: module.ProductsPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(module => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage').then(module => ({ default: module.CheckoutSuccessPage })));
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
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const { fetchProducts } = useProductStore();
  const location = useLocation();
  
  useEffect(() => {
    // Only fetch products if we're on a page that needs them and not on auth pages
    const productPages = ['/products', '/', '/business'];
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
    
    if (productPages.includes(location.pathname) || location.pathname.startsWith('/products/')) {
      fetchProducts();
    }
  }, [location.pathname, fetchProducts]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && ['/login', '/register'].includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/business" element={<Layout><BusinessPage /></Layout>} />
            <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/about" element={<Layout><AboutPage /></Layout>} />
            <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
            <Route path="/cart" element={<Layout><CartPage /></Layout>} />
            <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
            <Route path="/checkout/success" element={<Layout><CheckoutSuccessPage /></Layout>} />
            <Route path="/terms" element={<Layout><TermsAndConditionsPage /></Layout>} />
            <Route path="/privacy" element={<Layout><PrivacyPolicyPage /></Layout>} />

            {/* Notification redirect */}
            <Route path="/notifications" element={<Navigate to="/dashboard/notifications" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
            <Route path="/forgot-password" element={<Layout><ForgotPasswordPage /></Layout>} />
            <Route path="/reset-password/:token" element={<Layout><ResetPasswordPage /></Layout>} />

            {/* Protected Routes */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-orders/:orderId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrderDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyOrdersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout>
                    {/* Only render for admin users */}
                    {user && user.role === 'admin' ? <AdminDashboardPage /> : <Navigate to="/dashboard" replace />}
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;