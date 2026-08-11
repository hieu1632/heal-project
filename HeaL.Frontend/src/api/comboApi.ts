import axiosClient from './axiosClient';

export interface ComboItem {
  id: number;
  productId: number;
  productName: string;
  productSizeId?: number;
  sizeName?: string;
  quantity: number;
  price: number;
  isFreebie: boolean;
  note?: string;
}

export interface Combo {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountPercent?: number;
  image?: string;
  type: string;
  isActive: boolean;
  items: ComboItem[];
  originalPrice: number;
  discountAmount: number;
}

export interface ComboCreate {
  name: string;
  description?: string;
  price?: number;
  discountPercent?: number;
  image?: string;
  type: string;
  isActive: boolean;
  items: {
    productId: number;
    productSizeId?: number;
    quantity: number;
    isFreebie: boolean;
    note?: string;
  }[];
}

export const comboApi = {
  getCombos: (isActive?: boolean) => 
    axiosClient.get<Combo[]>('/api/combos', { params: { isActive } }),
  
  getActiveCombos: () => 
    axiosClient.get<Combo[]>('/api/combos/active'),
  
  getComboById: (id: number) => 
    axiosClient.get<Combo>(`/api/combos/${id}`),
  
  createCombo: (data: ComboCreate) => 
    axiosClient.post<Combo>('/api/combos', data),
  
  updateCombo: (id: number, data: ComboCreate) => 
    axiosClient.put(`/api/combos/${id}`, data),
  
  deleteCombo: (id: number) => 
    axiosClient.delete(`/api/combos/${id}`),
};