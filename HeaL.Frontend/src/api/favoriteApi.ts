import axiosClient from './axiosClient';
import type { Product } from './productApi';

export interface Favorite {
  id: number;
  productId: number;
  product: Product;
  createdAt: string;
}

export const favoriteApi = {
  getFavorites: () => 
    axiosClient.get<Favorite[]>('/api/favorites'),
  
  addFavorite: (productId: number) => 
    axiosClient.post('/api/favorites', { productId }),
  
  removeFavorite: (productId: number) => 
    axiosClient.delete(`/api/favorites/${productId}`),
  
  isFavorite: (productId: number) => 
    axiosClient.get<{ isFavorite: boolean }>(`/api/favorites/check/${productId}`),
};