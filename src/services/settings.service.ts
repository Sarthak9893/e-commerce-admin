import axiosInstance from '@/lib/axiosInstance';
import { ApiResponse, StoreSettings } from '@/types';

export const settingsService = {
  getSettings: async (): Promise<ApiResponse<StoreSettings>> => {
    const response = await axiosInstance.get<ApiResponse<StoreSettings>>(
      '/api/settings'
    );
    return response.data;
  },

  updateSettings: async (settings: Partial<StoreSettings>): Promise<ApiResponse<StoreSettings>> => {
    const response = await axiosInstance.patch<ApiResponse<StoreSettings>>(
      '/api/settings',
      settings
    );
    return response.data;
  },

  getPublicSettings: async (): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get(
      '/api/settings/public'
    );
    return response.data;
  },
};
