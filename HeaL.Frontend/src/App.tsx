import type { ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import HomePage from './pages/guest/HomePage';
import MenuPage from './pages/guest/MenuPage';
import ProductDetail from './pages/guest/ProductDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Orders from './pages/user/Orders';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Dashboard from './pages/admin/Dashboard';
import ProductsManagement from './pages/admin/ProductsManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import VouchersManagement from './pages/admin/VouchersManagement';
import Profile from './pages/user/Profile';
import Favorites from './pages/user/Favorites';
import Reviews from './pages/user/Reviews';
import CombosManagement from './pages/admin/CombosManagement';
import Notifications from './pages/user/Notifications';
import NotificationsManagement from './pages/admin/NotificationsManagement';

// Protected Route component
const ProtectedRoute = ({ children, requireAdmin = false }: { children: ReactElement; requireAdmin?: boolean }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && role !== 'Admin') return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Guest Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* User Routes */}
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requireAdmin>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute requireAdmin>
                  <ProductsManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute requireAdmin>
                  <OrdersManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute requireAdmin>
                  <CategoriesManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/vouchers" element={
                <ProtectedRoute requireAdmin>
                  <VouchersManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/combos" element={
                <ProtectedRoute requireAdmin>
                 <CombosManagement />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
  <ProtectedRoute>
    <Notifications />
  </ProtectedRoute>
} />
<Route path="/admin/notifications" element={
  <ProtectedRoute requireAdmin>
    <NotificationsManagement />
  </ProtectedRoute>
} />
              <Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />
<Route path="/favorites" element={
  <ProtectedRoute>
    <Favorites />
  </ProtectedRoute>
} />
<Route path="/reviews" element={
  <ProtectedRoute>
    <Reviews />
  </ProtectedRoute>
} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;