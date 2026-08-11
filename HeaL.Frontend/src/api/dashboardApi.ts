import axiosClient from './axiosClient';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  processingOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: {
    id: number;
    customerName: string;
    finalAmount: number;
    status: string;
    createdAt: string;
  }[];
  topProducts: {
    productName: string;
    sizeName: string;
    totalSold: number;
    totalRevenue: number;
  }[];
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export const dashboardApi = {
  getStats: () => 
    axiosClient.get<DashboardStats>('/api/dashboard/stats'),
  
  getRevenue: (period: string) => 
    axiosClient.get<RevenueData[]>('/api/dashboard/revenue', { params: { period } }),
};