import axiosClient from './axiosClient';

export interface UserSimple {
  id: number;
  fullName: string;
  email: string;
}

export interface SendToUserDto {
  userId: number;
  title: string;
  content: string;
}

export interface SendToAllDto {
  title: string;
  content: string;
}

export const adminNotificationApi = {
  getUsers: () => 
    axiosClient.get<UserSimple[]>('/api/admin/notification/users'),
  
  sendToUser: (data: SendToUserDto) => 
    axiosClient.post('/api/admin/notification/send-to-user', data),
  
  sendToAll: (data: SendToAllDto) => 
    axiosClient.post('/api/admin/notification/send-to-all', data),
};