import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';

// Public Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import CustomCakePage from './pages/CustomCakePage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import PolicyPage from './pages/PolicyPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomQuotesPage from './pages/admin/AdminCustomQuotesPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

// Storefront Wrapper Layout
const StorefrontLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <StoreSettingsProvider>
        <CartProvider>
          <ErrorBoundary>
            <Routes>
              {/* Customer Storefront Routes */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmed/:orderNumber" element={<OrderTrackingPage />} />
                <Route path="/track" element={<OrderTrackingPage />} />
                <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
                <Route path="/custom-cake" element={<CustomCakePage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/policies/:type" element={<PolicyPage />} />
              </Route>

              {/* Admin Management Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="custom-quotes" element={<AdminCustomQuotesPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="coupons" element={<AdminCouponsPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </CartProvider>
      </StoreSettingsProvider>
    </AuthProvider>
  );
}

export default App;
