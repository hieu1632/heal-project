import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

const menuItems = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/products', icon: '📦', label: 'Sản phẩm' },
  { path: '/admin/orders', icon: '📋', label: 'Đơn hàng' },
  { path: '/admin/categories', icon: '📂', label: 'Danh mục' },
  { path: '/admin/vouchers', icon: '🏷️', label: 'Voucher' },
  { path: '/admin/reviews', icon: '📝', label: 'Đánh giá' },
  { path: '/admin/combos', icon: '🎁', label: 'Combo' }, 
  { path: '/admin/notifications', icon: '📢', label: 'Thông báo' },
];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md min-h-screen">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-primary">HeaL Admin</h2>
          <p className="text-sm text-gray-500 mt-1">{user?.fullName}</p>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;