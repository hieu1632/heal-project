import axiosClient from './axiosClient';

export interface CartItemDto {
  id: number;
  type: 'Product' | 'Combo';
  productSizeId?: number;
  productName: string;
  sizeName?: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
  isCombo: boolean;
  originalPrice?: number;
  comboItems?: {
    productName: string;
    sizeName?: string;
    quantity: number;
    isFreebie: boolean;
  }[];
}

export interface CartResponse {
  items: CartItemDto[];
  totalAmount: number;
  totalItems: number;
}

export const cartApi = {
  getCart: () => 
    axiosClient.get<CartResponse>('/api/cart'),
  
  addToCart: (productSizeId: number, quantity: number) => 
    axiosClient.post<CartResponse>('/api/cart/add', { productSizeId, quantity }),
  
  addComboToCart: (comboId: number, quantity: number) => 
    axiosClient.post<CartResponse>('/api/cart/add-combo', { comboId, quantity }),
  
  updateCart: (cartId: number, quantity: number) => 
    axiosClient.put<CartResponse>(`/api/cart/${cartId}`, { quantity }),
  
  removeFromCart: (cartId: number) => 
    axiosClient.delete<CartResponse>(`/api/cart/${cartId}`),
  
  clearCart: () => 
    axiosClient.delete('/api/cart/clear'),
};