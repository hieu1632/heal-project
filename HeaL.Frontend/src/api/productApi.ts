import axiosClient from './axiosClient';

export interface ProductSize {
  id: number;
  sizeName: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  displayOrder: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  categoryId: number;
  categoryName: string;
  sizes: ProductSize[];
  reviews: any[];
}

export interface ProductCreate {
  name: string;
  description: string;
  categoryId: number;
  image: string;
  ingredients: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  sizes: {
    sizeName: string;
    price: number;
    stock: number;
    isAvailable: boolean;
    displayOrder: number;
  }[];
}

export interface ProductUpdate extends ProductCreate {}

export const productApi = {
  getProducts: (params?: { 
    categoryId?: number; 
    search?: string; 
    sortBy?: string; 
    isAvailable?: boolean;
  }) => axiosClient.get<Product[]>('/api/products', { params }),
  
  getProductById: (id: number) => 
    axiosClient.get<Product>(`/api/products/${id}`),
  
  getBestSellers: (count?: number) => 
    axiosClient.get<Product[]>('/api/products/bestsellers', { params: { count } }),
  
  createProduct: (data: ProductCreate) => 
    axiosClient.post<Product>('/api/products', data),
  
  updateProduct: (id: number, data: ProductUpdate) => 
    axiosClient.put(`/api/products/${id}`, data),
  
  deleteProduct: (id: number) => 
    axiosClient.delete(`/api/products/${id}`),
};

export const categoryApi = {
  getCategories: () => 
    axiosClient.get<{ id: number; name: string }[]>('/api/categories'),
};