import axiosClient from './axiosClient';

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    fullName: string;
  };
}

export interface ReviewCreate {
  productId: number;
  rating: number;
  comment: string;
}

export interface HomeReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  productName: string;
}

export const reviewApi = {
  // Lấy đánh giá của sản phẩm
  getReviews: (productId: number) => 
    axiosClient.get<Review[]>(`/api/reviews/product/${productId}`),
  
  // Lấy đánh giá của tôi
  getMyReviews: () => 
    axiosClient.get<Review[]>('/api/reviews/my-reviews'),
  
  // Lấy tất cả đánh giá (cho homepage)
  getAllReviews: (limit?: number) => 
    axiosClient.get<HomeReview[]>('/api/reviews/all', { params: { limit } }),
  
  // Tạo đánh giá
  createReview: (data: ReviewCreate) => 
    axiosClient.post<Review>('/api/reviews', data),
  
  // Cập nhật đánh giá
  updateReview: (id: number, data: Partial<ReviewCreate>) => 
    axiosClient.put(`/api/reviews/${id}`, data),
  
  // Xóa đánh giá
  deleteReview: (id: number) => 
    axiosClient.delete(`/api/reviews/${id}`),
};