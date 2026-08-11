import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewApi } from '../../api/reviewApi';
import type { Review } from '../../api/reviewApi';

export const ProductReview: React.FC<{ productId: number }> = ({ productId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchExistingReview();
  }, [productId]);

  const fetchExistingReview = async () => {
    try {
      const response = await reviewApi.getReviews(productId);
      const myReview = response.data.find((r) => r.userId !== undefined);
      if (myReview) {
        setExistingReview(myReview);
        setRating(myReview.rating);
        setComment(myReview.comment);
      }
    } catch {
      // Ignore missing review data.
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (existingReview) {
        await reviewApi.updateReview(existingReview.id, { rating, comment });
        setSuccess('Cập nhật đánh giá thành công!');
      } else {
        await reviewApi.createReview({ productId, rating, comment });
        setSuccess('Đánh giá thành công!');
      }
      setTimeout(() => {
        setSuccess(null);
        fetchExistingReview();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold text-lg mb-4">
        {existingReview ? '✏️ Chỉnh sửa đánh giá' : '⭐ Đánh giá sản phẩm'}
      </h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số sao của bạn
          </label>
          <div className="flex gap-2 text-2xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-colors ${
                  star <= rating ? 'text-yellow-500' : 'text-gray-300'
                } hover:scale-110`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhận xét của bạn
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Đang gửi...' : existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
        </button>
      </form>
    </div>
  );
};

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewApi.getMyReviews();
      setReviews(response.data);
      setError(null);
    } catch (err: any) {
      setError('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await reviewApi.deleteReview(id);
      setReviews((current) => current.filter((r) => r.id !== id));
    } catch (err: any) {
      alert('Không thể xóa đánh giá');
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
      <h1 className="text-3xl font-bold text-primary mb-6">📝 Đánh giá của tôi</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">✍️</div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">Chưa có đánh giá nào</h2>
          <p className="text-gray-500 mb-6">Hãy mua sản phẩm và chia sẻ trải nghiệm của bạn</p>
          <Link to="/menu" className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/80 transition-colors shadow-sm">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <Link to={`/product/${review.productId}`} className="inline-block hover:text-primary transition-colors">
                    <h3 className="font-semibold text-lg text-gray-800">Sản phẩm #{review.productId}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-sm text-yellow-600 font-medium">
                      {'⭐'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </span>
                    <span className="text-sm text-gray-500">{review.rating}/5</span>
                  </div>
                  <p className="text-gray-700 mt-3 leading-relaxed">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(review.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;