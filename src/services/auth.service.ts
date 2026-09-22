import axiosInstance from '@/lib/axiosInstance';
import { ApiResponse, AuthTokens, LoginDto, AdminUser } from '@/types';

export const authService = {
  login: async (credentials: LoginDto): Promise<ApiResponse<AuthTokens>> => {
    const response = await axiosInstance.post<ApiResponse<AuthTokens>>(
      '/api/auth/admin/login',
      credentials
    );
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<AdminUser>> => {
    const response = await axiosInstance.get<ApiResponse<AdminUser>>(
      '/api/auth/me'
    );
    return response.data;
  },

  refreshToken: async (token: string): Promise<ApiResponse<AuthTokens>> => {
    const response = await axiosInstance.post<ApiResponse<AuthTokens>>(
      '/api/auth/refresh',
      { refreshToken: token }
    );
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(
      '/api/auth/logout'
    );
    return response.data;
  },
};
