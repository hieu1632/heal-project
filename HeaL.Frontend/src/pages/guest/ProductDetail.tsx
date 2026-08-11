import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { productApi } from '../../api/productApi';
import type { Product, ProductSize } from '../../api/productApi';
import { cartApi } from '../../api/cartApi';
import { setCart } from '../../store/slices/cartSlice';  // ✅ Đổi từ setTotalItems
import { favoriteApi } from '../../api/favoriteApi';
import { reviewApi } from '../../api/reviewApi';
import type { Review } from '../../api/reviewApi';
import { ProductReview } from '../user/Reviews';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && product) {
      checkFavorite();
      loadReviews();
    }
  }, [product, isAuthenticated]);

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await productApi.getProductById(Number(id));
      setProduct(response.data);
      if (response.data.sizes && response.data.sizes.length > 0) {
        setSelectedSize(response.data.sizes[0]);
      }
    } catch (err: any) {
      setError('Không thể tải thông tin sản phẩm');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!id) return;
    try {
      const response = await favoriteApi.isFavorite(Number(id));
      setIsFavorite(response.data.isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReviews = async () => {
    if (!id) return;
    try {
      const response = await reviewApi.getReviews(Number(id));
      setReviews(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!id) return;

    try {
      if (isFavorite) {
        await favoriteApi.removeFavorite(Number(id));
        setIsFavorite(false);
      } else {
        await favoriteApi.addFavorite(Number(id));
        setIsFavorite(true);
      }
    } catch (err: any) {
      alert('Không thể thao tác với danh sách yêu thích');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      alert('Vui lòng chọn size');
      return;
    }

    setAddingToCart(true);
    try {
      const response = await cartApi.addToCart(selectedSize.id, quantity);
      // ✅ Sửa: Dùng setCart thay vì setTotalItems
      dispatch(setCart({
        items: response.data.items,
        totalAmount: response.data.totalAmount,
        totalItems: response.data.totalItems,
      }));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-12 text-center text-red-500">
        {error || 'Không tìm thấy sản phẩm'}
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {showToast && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✅ Đã thêm vào giỏ hàng!
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img 
            src={product.image || '/placeholder.jpg'} 
            alt={product.name}
            className="w-full h-96 object-cover"
          />
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
              <p className="text-gray-500 text-sm mt-1">{product.categoryName}</p>
            </div>
            <button
              onClick={handleToggleFavorite}
              className={`text-2xl transition-colors ${
                isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
              }`}
              aria-label="Toggle favorite"
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          {product.isBestSeller && (
            <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
              ⭐ Bán chạy
            </span>
          )}

          <div className="mt-4">
            <p className="text-gray-600">{product.description}</p>
          </div>

          {product.ingredients && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700">Thành phần:</h3>
              <p className="text-gray-600">{product.ingredients}</p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-2">Chọn size:</h3>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-3 border-2 rounded-lg transition-colors ${
                    selectedSize?.id === size.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-300 hover:border-primary'
                  } ${!size.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!size.isAvailable}
                >
                  <div className="font-semibold">{size.sizeName}</div>
                  <div className="text-sm text-gray-600">
                    {size.price.toLocaleString('vi-VN')}đ
                  </div>
                  {!size.isAvailable && (
                    <div className="text-xs text-red-500">Hết hàng</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <h3 className="font-semibold text-gray-700">Số lượng:</h3>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-6 py-2 border-x">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div>
              <span className="text-3xl font-bold text-primary">
                {selectedSize ? (selectedSize.price * quantity).toLocaleString('vi-VN') : '---'}đ
              </span>
              {quantity > 1 && (
                <span className="text-gray-500 text-sm ml-2">
                  ({selectedSize?.price.toLocaleString('vi-VN')}đ x {quantity})
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || !selectedSize || !selectedSize.isAvailable}
              className="flex-1 bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isAuthenticated ? (
                'Đăng nhập để mua'
              ) : addingToCart ? (
                'Đang thêm...'
              ) : !selectedSize ? (
                'Chọn size'
              ) : !selectedSize.isAvailable ? (
                'Hết hàng'
              ) : (
                '🛒 Thêm vào giỏ'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <h3 className="text-xl font-semibold text-gray-800">📝 Đánh giá ({reviews.length})</h3>
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm((value) => !value)}
              className="inline-flex items-center justify-center rounded-lg bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              {showReviewForm ? 'Ẩn form' : '✏️ Viết đánh giá'}
            </button>
          )}
        </div>

        {isAuthenticated && showReviewForm && (
          <div className="mb-6">
            <ProductReview productId={Number(id)} />
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {(review.user?.fullName || 'K').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{review.user?.fullName || 'Khách hàng'}</span>
                  </div>
                  <span className="text-yellow-500 text-sm">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">{review.comment}</p>
                <span className="text-xs text-gray-400 mt-2 block">
                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;