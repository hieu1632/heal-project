import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { productApi } from '../../api/productApi';
import { comboApi } from '../../api/comboApi';
import { cartApi } from '../../api/cartApi';
import { setCart } from '../../store/slices/cartSlice';
import type { Product } from '../../api/productApi';
import type { Combo } from '../../api/comboApi';
import ProductCard from '../../components/common/features/ProductCard';

const MenuPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'products' | 'combos'>(
    searchParams.get('tab') === 'combos' ? 'combos' : 'products'
  );
  
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCombos, setErrorCombos] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [addingCombo, setAddingCombo] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCombos();
  }, []);

  // Khi tab thay đổi, update URL
  useEffect(() => {
    if (activeTab === 'combos') {
      setSearchParams({ tab: 'combos' });
    } else {
      setSearchParams({});
    }
  }, [activeTab, setSearchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productApi.getProducts({ search, sortBy });
      setProducts(response.data);
      setError(null);
    } catch (err: any) {
      setError('Không thể tải danh sách sản phẩm');
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
      setErrorCombos('Không thể tải danh sách combo');
    } finally {
      setLoadingCombos(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
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

  // Phân loại combo để hiển thị badge
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

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">☕ Menu HeaL</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-6 font-medium transition-colors ${
            activeTab === 'products'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('combos')}
          className={`pb-3 px-6 font-medium transition-colors ${
            activeTab === 'combos'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🎁 Combo tiết kiệm
          {combos.length > 0 && (
            <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
              {combos.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Products */}
      {activeTab === 'products' && (
        <>
          <div className="mb-8 flex flex-wrap gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80"
              >
                Tìm
              </button>
            </form>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sắp xếp</option>
              <option value="price">Giá thấp đến cao</option>
              <option value="price_desc">Giá cao đến thấp</option>
              <option value="bestseller">Bán chạy</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không có sản phẩm nào
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab Combos */}
      {activeTab === 'combos' && (
        <>
          <div className="mb-6">
            <p className="text-gray-500">
              🎁 Các combo đặc biệt giúp bạn tiết kiệm hơn khi mua nhiều sản phẩm.
            </p>
          </div>

          {loadingCombos ? (
            <div className="text-center py-12 text-gray-500">Đang tải combo...</div>
          ) : errorCombos ? (
            <div className="text-center py-12 text-red-500">{errorCombos}</div>
          ) : combos.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-amber-50/50 rounded-2xl">
              <span className="text-4xl block mb-2">🎁</span>
              Chưa có combo nào. Hãy quay lại sau!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {combos.map((combo) => {
                const badge = getComboBadge(combo.type);
                const freebieItems = combo.items.filter(item => item.isFreebie);
                const paidItems = combo.items.filter(item => !item.isFreebie);

                return (
                  <div key={combo.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-amber-100/50">
                    <div className="relative">
                      <img 
                        src={combo.image || '/combo-placeholder.jpg'} 
                        alt={combo.name}
                        className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-800">{combo.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{combo.description}</p>
                      
                      <div className="mt-4 space-y-1.5">
                        <p className="text-sm font-medium text-gray-700">Bao gồm:</p>
                        {paidItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <span>{item.productName}</span>
                            {item.sizeName && <span className="text-xs text-gray-400">({item.sizeName})</span>}
                          </div>
                        ))}
                        {freebieItems.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-dashed border-green-200">
                            <p className="text-sm font-medium text-green-600">🎁 Quà tặng:</p>
                            {freebieItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-green-600">
                                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                                  {item.quantity}
                                </span>
                                <span>{item.productName}</span>
                                {item.sizeName && <span className="text-xs text-green-400">({item.sizeName})</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-primary">
                            {combo.price.toLocaleString('vi-VN')}đ
                          </span>
                          {combo.originalPrice > combo.price && (
                            <>
                              <span className="text-gray-400 line-through text-sm">
                                {combo.originalPrice.toLocaleString('vi-VN')}đ
                              </span>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                -{((combo.originalPrice - combo.price) / combo.originalPrice * 100).toFixed(0)}%
                              </span>
                            </>
                          )}
                        </div>
                        {combo.discountPercent && combo.discountPercent > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            💰 Tiết kiệm {(combo.originalPrice - combo.price).toLocaleString('vi-VN')}đ
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleAddComboToCart(combo)}
                        disabled={addingCombo === combo.id}
                        className="mt-4 w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/80 transition-colors font-medium disabled:opacity-50"
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
        </>
      )}
    </div>
  );
};

export default MenuPage;