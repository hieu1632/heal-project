import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { productApi } from '../../api/productApi';
import { reviewApi } from '../../api/reviewApi';
import { comboApi } from '../../api/comboApi';
import { cartApi } from '../../api/cartApi';
import { setCart } from '../../store/slices/cartSlice';
import type { Product } from '../../api/productApi';
import type { HomeReview } from '../../api/reviewApi';
import type { Combo } from '../../api/comboApi';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [reviews, setReviews] = useState<HomeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCombos, setErrorCombos] = useState<string | null>(null);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);
  const [addingCombo, setAddingCombo] = useState<number | null>(null);

  useEffect(() => {
    fetchBestSellers();
    fetchCombos();
    fetchReviews();
  }, []);

  const fetchBestSellers = async () => {
    setLoading(true);
    try {
      const response = await productApi.getBestSellers(4);
      setBestSellers(response.data);
      setError(null);
    } catch (err: any) {
      setError('Không thể tải sản phẩm nổi bật');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCombos = async () => {
    setLoadingCombos(true);
    try {
      const response = await comboApi.getActiveCombos();
      setCombos(response.data);
      setErrorCombos(null);
    } catch (err: any) {
      setErrorCombos('Không thể tải combo');
      console.error(err);
    } finally {
      setLoadingCombos(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await reviewApi.getAllReviews(6);
      setReviews(response.data);
      setErrorReviews(null);
    } catch (err: any) {
      setErrorReviews('Không thể tải đánh giá');
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const getMinPrice = (product: Product) => {
    if (product.sizes && product.sizes.length > 0) {
      return Math.min(...product.sizes.map((s) => s.price));
    }
    return product.price || 0;
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getComboBadge = (type: string) => {
    switch (type) {
      case 'Freebie':
        return { label: '🎁 Mua tặng', color: 'bg-red-100 text-red-800' };
      case 'Quantity':
        return { label: '📦 Số lượng', color: 'bg-blue-100 text-blue-800' };
      default:
        return { label: '💰 Tiết kiệm', color: 'bg-green-100 text-green-800' };
    }
  };

  // ✅ Xử lý thêm combo vào giỏ hàng - ĐÃ SỬA
  const handleAddComboToCart = async (combo: Combo) => {
    setAddingCombo(combo.id);
    try {
      const response = await cartApi.addComboToCart(combo.id, 1);
      dispatch(setCart({
        items: response.data.items,
        totalAmount: response.data.totalAmount,
        totalItems: response.data.totalItems,
      }));
      alert(`✅ Đã thêm combo "${combo.name}" vào giỏ hàng!`);
    } catch (err: any) {
      console.error('Lỗi khi thêm combo:', err);
      alert(err.response?.data?.message || 'Không thể thêm combo vào giỏ hàng');
    } finally {
      setAddingCombo(null);
    }
  };

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-100/60 py-20 md:py-28">
        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span>🌿</span>
                Tinh tế & Tự nhiên
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                Chạm vào <br />
                <span className="text-primary">hương vị tinh tế</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                HeaL - Nơi những tách trà thơm và chiếc bánh ngọt được 
                làm bằng tình yêu, dành cho những khoảnh khắc đáng nhớ.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  to="/menu"
                  className="group inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-medium hover:bg-primary/80 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>☕</span>
                  Khám phá menu
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-3.5 rounded-full font-medium hover:bg-white transition-all shadow-sm hover:shadow-md"
                >
                  Câu chuyện HeaL
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-amber-200/50 to-primary/20 flex items-center justify-center">
                  <span className="text-8xl md:text-9xl opacity-80">🍵</span>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 border-2 border-primary/20 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 border-2 border-amber-300/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🌿', title: 'Nguyên liệu sạch', desc: 'Chọn lọc từ những nguồn nguyên liệu tự nhiên, tươi ngon nhất.' },
              { icon: '❤️', title: 'Yêu thương vào từng sản phẩm', desc: 'Mỗi món đều được pha chế với sự tỉ mỉ và tâm huyết.' },
              { icon: '🏡', title: 'Không gian ấm cúng', desc: 'Nơi bạn có thể thư giãn, trò chuyện và tận hưởng.' },
            ].map((item, index) => (
              <div key={index} className="text-center p-8 bg-amber-50/50 rounded-2xl hover:bg-amber-50 transition-colors">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 bg-amber-50/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full">
              ⭐ Gợi ý từ HeaL
            </span>
            <h2 className="text-3xl font-bold text-gray-800 mt-3">Sản phẩm nổi bật</h2>
            <p className="text-gray-500 mt-1">Những món được yêu thích nhất tại HeaL</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải sản phẩm...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {bestSellers.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="aspect-square overflow-hidden bg-amber-50">
                    <img
                      src={product.image || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors text-sm md:text-base">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-400">{product.categoryName}</p>
                      </div>
                      {product.isBestSeller && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⭐</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-primary font-bold text-sm md:text-base">
                        {getMinPrice(product).toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">
                        Đặt ngay →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              Xem tất cả sản phẩm
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Combo Section */}
      <section className="py-16 bg-gradient-to-b from-amber-50/30 to-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full">
              🎁 Ưu đãi đặc biệt
            </span>
            <h2 className="text-3xl font-bold text-gray-800 mt-3">Combo tiết kiệm</h2>
            <p className="text-gray-500 mt-1">Mua nhiều - Tiết kiệm nhiều, ưu đãi dành riêng cho bạn</p>
          </div>

          {loadingCombos ? (
            <div className="text-center py-12 text-gray-500">Đang tải combo...</div>
          ) : errorCombos ? (
            <div className="text-center py-12 text-red-500">{errorCombos}</div>
          ) : combos.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm">
              <span className="text-4xl block mb-2">🎁</span>
              Chưa có combo nào. Hãy quay lại sau!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {combos.slice(0, 3).map((combo) => {
                const badge = getComboBadge(combo.type);
                const freebieItems = combo.items.filter(item => item.isFreebie);
                const paidItems = combo.items.filter(item => !item.isFreebie);

                return (
                  <div key={combo.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-amber-100/50">
                    <div className="relative">
                      <img 
                        src={combo.image || '/combo-placeholder.jpg'} 
                        alt={combo.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800">{combo.name}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{combo.description}</p>
                      
                      <div className="mt-3 space-y-1 text-sm">
                        {paidItems.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-600">
                            <span>{item.quantity}x {item.productName}</span>
                            {item.sizeName && <span className="text-xs text-gray-400">({item.sizeName})</span>}
                          </div>
                        ))}
                        {paidItems.length > 2 && (
                          <span className="text-xs text-gray-400">+{paidItems.length - 2} món khác</span>
                        )}
                        {freebieItems.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-dashed border-green-200">
                            <span className="text-green-600 font-medium text-xs">🎁 Tặng:</span>
                            {freebieItems.map((item, idx) => (
                              <span key={idx} className="ml-2 text-green-600 text-xs">
                                {item.quantity}x {item.productName}
                                {item.sizeName && ` (${item.sizeName})`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center gap-3">
                        <span className="text-xl font-bold text-primary">
                          {combo.price.toLocaleString('vi-VN')}đ
                        </span>
                        {combo.originalPrice > combo.price && (
                          <>
                            <span className="text-gray-400 line-through text-sm">
                              {combo.originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                              -{((combo.originalPrice - combo.price) / combo.originalPrice * 100).toFixed(0)}%
                            </span>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleAddComboToCart(combo)}
                        disabled={addingCombo === combo.id}
                        className="mt-4 w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary/80 transition-colors font-medium disabled:opacity-50"
                      >
                        {addingCombo === combo.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Đang thêm...
                          </span>
                        ) : (
                          '🛒 Chọn combo'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {combos.length > 3 && (
            <div className="text-center mt-10">
              <Link
                to="/menu?tab=combos"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                Xem tất cả combo
                <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full">
              💬 Yêu thương từ khách hàng
            </span>
            <h2 className="text-3xl font-bold text-gray-800 mt-3">Họ nói gì về HeaL?</h2>
          </div>

          {loadingReviews ? (
            <div className="text-center py-12 text-gray-500">Đang tải đánh giá...</div>
          ) : errorReviews ? (
            <div className="text-center py-12 text-red-500">{errorReviews}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-amber-50/50 rounded-2xl">
              <span className="text-4xl block mb-2">☕</span>
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-amber-50/50 p-6 rounded-2xl hover:bg-amber-50 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{review.userName}</div>
                      <div className="text-yellow-500 text-xs">
                        {getRatingStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                  <p className="text-xs text-gray-400 mt-3">
                    🍵 {review.productName} • {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-amber-50/80 to-primary/5">
        <div className="container-custom text-center">
          <div className="max-w-2xl mx-auto">
            <span className="text-6xl block mb-4">☕</span>
            <h2 className="text-3xl font-bold text-gray-800">
              Sẵn sàng cho <span className="text-primary">một trải nghiệm</span>?
            </h2>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed">
              Đặt món ngay để thưởng thức hương vị tinh tế,<br />
              hoặc đăng ký thành viên để nhận ưu đãi đặc biệt.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-medium hover:bg-primary/80 transition-all shadow-lg hover:shadow-xl"
              >
                Đặt món ngay
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-full font-medium border-2 border-primary/20 hover:bg-primary/5 transition-all"
              >
                Đăng ký thành viên
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;