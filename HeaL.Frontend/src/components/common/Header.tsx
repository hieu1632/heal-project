import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import Logo from './Logo';

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { totalItems } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          <Logo />
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/menu" className="hover:text-primary transition-colors">
            Menu
          </Link>
          
          {/* Admin Menu - chỉ hiển thị khi là Admin */}
          {isAdmin && isAuthenticated && (
            <div className="relative group">
              <button className="hover:text-primary transition-colors flex items-center gap-1 py-1">
                ⚙️ Quản trị
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-xl opacity-0 invisible pointer-events-none transition-all duration-200 ease-out group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-focus-within:pointer-events-auto z-50">
                <Link to="/admin/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors">
                  📊 Dashboard
                </Link>
                <Link to="/admin/products" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors">
                  📦 Sản phẩm
                </Link>
                <Link to="/admin/orders" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors">
                  📋 Đơn hàng
                </Link>
                <Link to="/admin/categories" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors">
                  📂 Danh mục
                </Link>
                <Link to="/admin/vouchers" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors">
                  🏷️ Voucher
                </Link>
                <Link to="/admin/combos" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors">
                  🎁 Combo
                </Link>
                <Link to="/admin/notifications" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors">
                  📢 Thông báo
                </Link>
              </div>
            </div>
          )}

          <Link to="/cart" className="hover:text-primary transition-colors relative">
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <div className="relative group flex items-center gap-3">
              <div className="relative">
                <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span>{user?.fullName || 'Tài khoản'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-xl opacity-0 invisible pointer-events-none transition-all duration-200 ease-out group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-focus-within:pointer-events-auto z-50">
                  <Link to="/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition-colors">
                    👤 Hồ sơ
                  </Link>
                  <Link to="/favorites" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition-colors">
                    💗 Yêu thích
                  </Link>
                  <Link to="/reviews" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition-colors">
                    📝 Đánh giá của tôi
                  </Link>
                  <Link to="/orders" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition-colors">
                    📦 Đơn hàng
                  </Link>
                  <Link to="/notifications" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition-colors">
                  📬 Thông báo
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary transition-colors">
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;