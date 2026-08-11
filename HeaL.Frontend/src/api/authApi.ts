import axiosClient from './axiosClient';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
  expiresAt: string;
}

export const authApi = {
  login: (data: LoginData) => 
    axiosClient.post<AuthResponse>('/api/auth/login', data),
  
  register: (data: RegisterData) => 
    axiosClient.post<AuthResponse>('/api/auth/register', data),
};