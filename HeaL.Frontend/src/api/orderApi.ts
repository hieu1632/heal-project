import axiosClient from './axiosClient';

export interface OrderCreate {
  address: string;
  phone: string;
  note?: string;
  paymentMethod: string;
  voucherCode?: string;
}

export interface OrderDetail {
  id: number;
  productName: string;
  sizeName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: string;
  address: string;
  phone: string;
  note: string;
  paymentMethod: string;
  voucherCode: string;
  user?: {
    fullName?: string;
  };
  orderDetails: OrderDetail[];
}

export const orderApi = {
  createOrder: (data: OrderCreate) =>
    axiosClient.post<Order>('/api/orders', data),
  getMyOrders: () =>
    axiosClient.get<Order[]>('/api/orders/my-orders'),
  getOrderById: (id: number) =>
    axiosClient.get<Order>(`/api/orders/${id}`),
  cancelOrder: (id: number) =>
    axiosClient.post(`/api/orders/${id}/cancel`),
  getAllOrders: () =>
    axiosClient.get<Order[]>('/api/orders/all'),
  updateOrderStatus: (id: number, status: string) =>
    axiosClient.put(`/api/orders/${id}/status`, { status }),
};