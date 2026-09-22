import axiosInstance from '@/lib/axiosInstance';
import { ApiResponse, Payment, PaymentFilterParams } from '@/types';

export const paymentsService = {
  getAll: async (params?: PaymentFilterParams): Promise<ApiResponse<{ data?: Payment[]; items?: Payment[]; meta?: any }>> => {
    const response = await axiosInstance.get(
      '/api/payments',
      { params }
    );
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Payment>> => {
    const response = await axiosInstance.get<ApiResponse<Payment>>(
      `/api/payments/${id}`
    );
    return response.data;
  },

  getByOrderId: async (orderId: string): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get(
      `/api/payments/order/${orderId}`
    );
    return response.data;
  },

  refund: async (id: string, amount?: number, reason?: string): Promise<ApiResponse<Payment>> => {
    const response = await axiosInstance.post<ApiResponse<Payment>>(
      `/api/payments/${id}/refund`,
      { amount, reason }
    );
    return response.data;
  },
};
