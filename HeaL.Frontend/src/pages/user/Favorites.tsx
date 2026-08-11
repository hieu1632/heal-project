import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { favoriteApi } from '../../api/favoriteApi';
import type { Favorite } from '../../api/favoriteApi';  // ✅ Tách import type
import { cartApi } from '../../api/cartApi';
import { useAppDispatch } from '../../store/hooks';
import { setCart } from '../../store/slices/cartSlice';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoriteApi.getFavorites();
      setFavorites(response.data);
      setError(null);
    } catch (err: any) {
      setError('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: number) => {
    try {
      await favoriteApi.removeFavorite(productId);
      setFavorites(favorites.filter(f => f.productId !== productId));
    } catch (err: any) {
      alert('Không thể xóa khỏi danh sách yêu thích');
    }
  };

  // ✅ Bỏ productId không dùng
  const handleAddToCart = async (sizeId: number) => {
    try {
      const response = await cartApi.addToCart(sizeId, 1);
      dispatch(setCart({
        items: response.data.items,
        totalAmount: response.data.totalAmount,
        totalItems: response.data.totalItems,
      }));
      alert('Đã thêm vào giỏ hàng!');
    } catch (err: any) {
      alert('Không thể thêm vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">❤️ Sản phẩm yêu thích</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-semibold mb-2">Chưa có sản phẩm yêu thích</h2>
          <p className="text-gray-500 mb-6">Hãy khám phá menu và thêm sản phẩm bạn yêu thích</p>
          <Link to="/menu" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80">
            Xem menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((fav) => {
            const product = fav.product;
            const minPrice = product.sizes?.length > 0 
              ? Math.min(...product.sizes.map(s => s.price)) 
              : product.price;

            return (
              <div key={fav.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={product.image || '/placeholder.jpg'} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm">{product.categoryName}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-primary font-bold">
                      {minPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleRemoveFavorite(product.id)}
                      className="text-red-500 text-sm hover:text-red-700 flex-1 border border-red-200 px-3 py-1 rounded hover:bg-red-50"
                    >
                      ❌ Xóa
                    </button>
                    {product.sizes && product.sizes.length > 0 && (
                      <select
                        onChange={(e) => handleAddToCart(Number(e.target.value))}  // ✅ Bỏ productId
                        className="text-sm border rounded px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">+ Giỏ</option>
                        {product.sizes.map((size) => (
                          <option key={size.id} value={size.id}>
                            {size.sizeName} - {size.price.toLocaleString('vi-VN')}đ
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;