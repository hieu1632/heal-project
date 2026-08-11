import axiosClient from './axiosClient';

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  data?: string;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: () => 
    axiosClient.get<Notification[]>('/api/notifications'),
  
  getUnreadCount: () => 
    axiosClient.get<{ count: number }>('/api/notifications/unread-count'),
  
  markAsRead: (notificationIds?: number[]) => 
    axiosClient.post('/api/notifications/mark-read', { notificationIds }),
  
  markAllAsRead: () => 
    axiosClient.post('/api/notifications/mark-all-read'),
  
  deleteNotification: (id: number) => 
    axiosClient.delete(`/api/notifications/${id}`),
};