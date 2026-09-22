import axiosInstance from '@/lib/axiosInstance';
import { ApiResponse, NotificationLog, PaginationParams } from '@/types';

export const notificationsService = {
  getLogs: async (params?: PaginationParams & {
    type?: string;
    status?: string;
    recipientEmail?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ data?: NotificationLog[]; items?: NotificationLog[]; meta?: any }>> => {
    const response = await axiosInstance.get(
      '/api/notifications/logs',
      { params }
    );
    return response.data;
  },
};
