import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { dashboardApi } from '../../api/dashboardApi';
import type { DashboardStats, RevenueData } from '../../api/dashboardApi';

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, revenueRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRevenue(period),
      ]);
      setStats(statsRes.data);
      setRevenueData(revenueRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Completed': return 'Hoàn thành';
      case 'Processing': return 'Đang xử lý';
      case 'Pending': return 'Chờ xác nhận';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
        <button 
          onClick={fetchData}
          className="ml-4 text-primary hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">📊 Dashboard</h1>
        <div className="text-gray-600">
          Xin chào, {user?.fullName} 👋
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Doanh thu</p>
          <p className="text-2xl font-bold text-primary">
            {stats?.totalRevenue.toLocaleString('vi-VN')}đ
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Tổng đơn hàng</p>
          <p className="text-2xl font-bold">{stats?.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Đang xử lý</p>
          <p className="text-2xl font-bold text-blue-600">{stats?.processingOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Sản phẩm</p>
          <p className="text-2xl font-bold">{stats?.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Khách hàng</p>
          <p className="text-2xl font-bold">{stats?.totalUsers}</p>
        </div>
      </div>

      {/* Revenue Chart - Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">📈 Doanh thu theo {period === 'week' ? 'tuần' : period === 'month' ? 'tháng' : 'năm'}</h2>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
        <div className="h-64 flex items-end gap-2">
          {revenueData.length > 0 ? (
            revenueData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary/80 rounded-t"
                  style={{ 
                    height: `${(item.revenue / Math.max(...revenueData.map(d => d.revenue), 1)) * 100}%`,
                    minHeight: '4px'
                  }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <div className="w-full text-center text-gray-500">
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </div>
        {revenueData.length > 0 && (
          <div className="mt-2 text-right text-sm text-gray-500">
            Tổng: {revenueData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString('vi-VN')}đ
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📋 Đơn hàng gần đây</h2>
            <Link to="/admin/orders" className="text-primary hover:underline text-sm">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats?.recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">#{order.id} - {order.customerName}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">
                    {order.finalAmount.toLocaleString('vi-VN')}đ
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <div className="text-center text-gray-500 py-4">
                Chưa có đơn hàng nào
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🏆 Sản phẩm bán chạy</h2>
          <div className="space-y-3">
            {stats?.topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">
                    {index + 1}. {product.productName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Size: {product.sizeName} - Đã bán: {product.totalSold}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-primary font-semibold">
                    {product.totalRevenue.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>
            ))}
            {(!stats?.topProducts || stats.topProducts.length === 0) && (
              <div className="text-center text-gray-500 py-4">
                Chưa có sản phẩm nào được bán
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/admin/products" className="bg-primary text-white p-4 rounded-lg text-center hover:bg-primary/80 transition-colors">
          📦 Quản lý sản phẩm
        </Link>
        <Link to="/admin/orders" className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors">
          📋 Quản lý đơn hàng
        </Link>
        <Link to="/admin/categories" className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors">
          📂 Quản lý danh mục
        </Link>
        <Link to="/admin/vouchers" className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors">
          🏷️ Quản lý voucher
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;