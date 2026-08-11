import axiosClient from './axiosClient';

export interface Voucher {
  id: number;
  code: string;
  description?: string;
  discountPercent: number;
  maxDiscount?: number;
  minOrderValue?: number;
  expiryDate: string;
  quantity: number;
  isActive: boolean;
}

export interface VoucherCreate {
  code: string;
  description?: string;
  discountPercent: number;
  maxDiscount?: number;
  minOrderValue?: number;
  expiryDate: string;
  quantity: number;
  isActive: boolean;
}

export const voucherApi = {
  getAll: () => axiosClient.get<Voucher[]>('/api/vouchers'),
  getById: (id: number) => axiosClient.get<Voucher>(`/api/vouchers/${id}`),
  create: (data: VoucherCreate) => axiosClient.post<Voucher>('/api/vouchers', data),
  update: (id: number, data: Partial<VoucherCreate>) => 
    axiosClient.put(`/api/vouchers/${id}`, data),
  delete: (id: number) => axiosClient.delete(`/api/vouchers/${id}`),
  validate: (code: string, totalAmount: number) =>
    axiosClient.get<{ isValid: boolean; discountAmount: number }>(
      `/api/vouchers/validate?code=${code}&total=${totalAmount}`
    ),
};