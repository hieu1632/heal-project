import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/orderApi';
import type { Order } from '../../api/orderApi';

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderApi.getAllOrders();
      setOrders(response.data);
      setError(null);
    } catch (err: any) {
      setError('Không thể tải danh sách đơn hàng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, status: string) => {
    if (!confirm(`Cập nhật trạng thái đơn hàng #${orderId} thành "${status}"?`)) return;
    try {
      await orderApi.updateOrderStatus(orderId, status);
      // Cập nhật local state
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status } : o
      ));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
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
      case 'Completed': return '✅ Hoàn thành';
      case 'Processing': return '🔄 Đang xử lý';
      case 'Pending': return '⏳ Chờ xác nhận';
      case 'Cancelled': return '❌ Đã hủy';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchSearch = order.id.toString().includes(searchTerm) || 
                        order.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">📋 Quản lý đơn hàng</h1>
        <button
          onClick={fetchOrders}
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm kiếm theo ID hoặc tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Chờ xác nhận</option>
            <option value="Processing">Đang xử lý</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
          <span className="text-gray-500 self-center">
            {filteredOrders.length} đơn hàng
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Mã đơn</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Khách hàng</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Số điện thoại</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Ngày đặt</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">#{order.id}</td>
                  <td className="px-6 py-4">{order.user?.fullName || 'N/A'}</td>
                  <td className="px-6 py-4">{order.phone}</td>
                  <td className="px-6 py-4 font-semibold text-primary">
                    {order.finalAmount.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800 mr-2 text-sm"
                    >
                      👁️ Chi tiết
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Pending">Chờ xác nhận</option>
                      <option value="Processing">Đang xử lý</option>
                      <option value="Completed">Hoàn thành</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-primary">
                Chi tiết đơn hàng #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Khách hàng</p>
                <p className="font-semibold">{selectedOrder.user?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-semibold">{selectedOrder.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="font-semibold">{selectedOrder.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                <p className="font-semibold">{selectedOrder.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
              {selectedOrder.voucherCode && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Mã giảm giá</p>
                  <p className="font-semibold text-green-600">{selectedOrder.voucherCode}</p>
                </div>
              )}
              {selectedOrder.note && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Ghi chú</p>
                  <p className="font-semibold">{selectedOrder.note}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Sản phẩm</h3>
              <div className="space-y-2">
                {selectedOrder.orderDetails.map((item) => (
                  <div key={item.id} className="flex justify-between border-b pb-2">
                    <div>
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        Size: {item.sizeName} x {item.quantity}
                      </span>
                    </div>
                    <span className="text-primary">
                      {item.total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span>{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{selectedOrder.discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>Tổng cộng</span>
                <span className="text-primary">
                  {selectedOrder.finalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <select
                value={selectedOrder.status}
                onChange={(e) => {
                  handleStatusUpdate(selectedOrder.id, e.target.value);
                  setSelectedOrder({ ...selectedOrder, status: e.target.value });
                }}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Pending">Chờ xác nhận</option>
                <option value="Processing">Đang xử lý</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;