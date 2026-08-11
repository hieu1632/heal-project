import axiosClient from './axiosClient';

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface UpdateProfileData {
  fullName: string;
  phone: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userApi = {
  getProfile: () => 
    axiosClient.get<UserProfile>('/api/users/profile'),
  
  updateProfile: (data: UpdateProfileData) => 
    axiosClient.put<UserProfile>('/api/users/profile', data),
  
  changePassword: (data: ChangePasswordData) => 
    axiosClient.put('/api/users/change-password', data),
};