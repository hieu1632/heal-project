import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/orderApi';
import type { Order } from '../../api/orderApi';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const response = await orderApi.getMyOrders();
      setOrders(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải đơn hàng của bạn');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Processing':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Chờ xác nhận';
      case 'Processing':
        return 'Đang xử lý';
      case 'Completed':
        return 'Hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-xl">Đang tải đơn hàng...</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-primary">📦 Đơn hàng của tôi</h1>
        <button
          onClick={fetchMyOrders}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          🔄 Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mb-4 text-5xl">🧾</div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-800">Bạn chưa có đơn hàng nào</h2>
          <p className="text-gray-500">Hãy đặt hàng và quay lại xem lịch sử mua sắm của mình.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Đơn hàng #{order.id}</p>
                  <p className="mt-1 text-lg font-semibold text-gray-800">
                    {new Date(order.orderDate).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {order.orderDetails.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        {item.sizeName} • Số lượng: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      {item.total.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
                <div>
                  <p>Địa chỉ: {order.address}</p>
                  <p>Phương thức: {order.paymentMethod}</p>
                </div>
                <div className="text-left md:text-right">
                  <p>Giảm giá: {order.discountAmount.toLocaleString('vi-VN')}đ</p>
                  <p className="text-lg font-bold text-primary">
                    Tổng: {order.finalAmount.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
