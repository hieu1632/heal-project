import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { orderApi } from '../../api/orderApi';
import type { OrderCreate } from '../../api/orderApi';
import { clearCart } from '../../store/slices/cartSlice';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrderCreate>({
    address: '',
    phone: user?.phone || '',
    note: '',
    paymentMethod: 'COD',
    voucherCode: '',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    setFormData((prev: OrderCreate) => ({ ...prev, phone: user?.phone || prev.phone || '' }));
  }, [items.length, navigate, user?.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }

    setLoading(true);
    try {
      const response = await orderApi.createOrder(formData);
      // Xóa giỏ hàng trong Redux
      dispatch(clearCart());
      // Chuyển đến trang xác nhận đơn hàng
      navigate(`/orders/${response.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">📋 Thanh toán</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ giao hàng *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Số điện thoại nhận hàng"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Ghi chú về đơn hàng (ví dụ: giao giờ hành chính...)"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                <option value="VNPay">VNPay</option>
                <option value="Momo">Momo</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã giảm giá (tùy chọn)
              </label>
              <input
                type="text"
                value={formData.voucherCode}
                onChange={(e) => setFormData({ ...formData, voucherCode: e.target.value })}
                placeholder="Nhập mã giảm giá"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h3 className="text-xl font-semibold mb-4">Đơn hàng</h3>
            <div className="max-h-60 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b">
                  <div>
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-sm text-gray-500 block">
                      {item.sizeName} x {item.quantity}
                    </span>
                  </div>
                  <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span className="text-primary">{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-4 bg-primary text-white py-3 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;