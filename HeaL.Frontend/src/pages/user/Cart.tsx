import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { cartApi } from '../../api/cartApi';
import { setCart, removeItem, updateQuantity, clearCart } from '../../store/slices/cartSlice';

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, totalAmount, totalItems } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await cartApi.getCart();
      dispatch(setCart({
        items: response.data.items,
        totalAmount: response.data.totalAmount,
        totalItems: response.data.totalItems,
      }));
      setError(null);
    } catch (err: any) {
      setError('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const handleUpdateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await cartApi.updateCart(cartId, newQuantity);
      dispatch(updateQuantity({ id: cartId, quantity: newQuantity }));
    } catch (err: any) {
      alert('Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (cartId: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await cartApi.removeFromCart(cartId);
      dispatch(removeItem(cartId));
    } catch (err: any) {
      alert('Không thể xóa sản phẩm');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;
    try {
      await cartApi.clearCart();
      dispatch(clearCart());
    } catch (err: any) {
      alert('Không thể xóa giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-xl">Đang tải giỏ hàng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-semibold mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
        <Link to="/menu" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">🛒 Giỏ hàng</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <span className="font-semibold">Giỏ hàng ({totalItems} sản phẩm)</span>
            </div>
            {items.map((item) => (
              <div key={item.id} className="p-4 border-b hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  <img 
                    src={item.image || '/placeholder.jpg'} 
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{item.productName}</h3>
                        <p className="text-sm text-gray-500">Size: {item.sizeName}</p>
                        <p className="text-primary font-semibold">
                          {item.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 border rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                      <span className="ml-4 text-sm text-gray-500">
                        Tạm tính: {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 bg-gray-50">
              <button
                onClick={handleClearCart}
                className="text-red-500 hover:text-red-700"
              >
                🗑️ Xóa toàn bộ
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h3 className="text-xl font-semibold mb-4">Tổng kết đơn hàng</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính ({totalItems} sản phẩm)</span>
                <span className="font-semibold">{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-4 bg-primary text-white py-3 rounded-lg hover:bg-primary/80 transition-colors font-semibold"
            >
              Tiến hành thanh toán →
            </button>
            <Link to="/menu" className="block text-center text-sm text-gray-500 hover:text-primary mt-2">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;