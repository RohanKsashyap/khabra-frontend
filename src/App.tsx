import  { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { BusinessPage } from './pages/BusinessPage';
import { ProductsPage } from './pages/ProductsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { useProductStore } from './store/productStore';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { MyOrdersPage } from './pages/MyOrdersPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EarningsPage from './pages/EarningsPage';
import RankRewardsPage from './pages/RankRewardsPage';
import SettingsPage from './pages/SettingsPage';
import MyNetworkPage from './pages/MyNetworkPage';
import { AuthProvider } from './contexts/AuthContext';
import { AdminReturnRequestsPage } from './pages/AdminReturnRequestsPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';

function App() {
  const { fetchProducts } = useProductStore();
  const { isAuthenticated, initialize } = useAuthStore();
  
  useEffect(() => {
    fetchProducts();
    initialize();
  }, [fetchProducts, initialize]);
  
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Toaster />
          <Routes>
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
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="earnings" element={<EarningsPage />} />
              <Route path="rank-rewards" element={<RankRewardsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="returns" element={<AdminReturnRequestsPage />} />
            </Route>
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/business" element={<BusinessPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:id" element={<ProductDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
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
                      <Route 
                        path="/login" 
                        element={
                          isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
                        } 
                      />
                      <Route 
                        path="/register" 
                        element={
                          isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />
                        } 
                      />
                      <Route 
                        path="/forgot-password" 
                        element={<ForgotPasswordPage />}
                      />
                      <Route
                        path="/reset-password/:token"
                        element={<ResetPasswordPage />}
                      />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;