import axiosClient from './axiosClient';

export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
}

export const categoryApi = {
  getAll: (isActive?: boolean) => 
    axiosClient.get<Category[]>('/api/categories', { params: { isActive } }),
  
  getById: (id: number) => 
    axiosClient.get<Category>(`/api/categories/${id}`),
  
  create: (data: CategoryCreate) => 
    axiosClient.post<Category>('/api/categories', data),
  
  update: (id: number, data: Partial<CategoryCreate>) => 
    axiosClient.put(`/api/categories/${id}`, data),
  
  delete: (id: number) => 
    axiosClient.delete(`/api/categories/${id}`),
};