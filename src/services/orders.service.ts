import axiosInstance from '@/lib/axiosInstance';
import {
  ApiResponse,
  Order,
  OrderFilterParams,
  UpdateOrderStatusDto,
} from '@/types';

export const ordersService = {
  getAll: async (params?: OrderFilterParams): Promise<ApiResponse<{ data?: Order[]; items?: Order[]; meta?: any }>> => {
    const response = await axiosInstance.get(
      '/api/orders/admin',
      { params }
    );
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await axiosInstance.get<ApiResponse<Order>>(
      `/api/orders/admin/${id}`
    );
    return response.data;
  },

  updateStatus: async (
    id: string,
    dto: UpdateOrderStatusDto
  ): Promise<ApiResponse<Order>> => {
    const response = await axiosInstance.patch<ApiResponse<Order>>(
      `/api/orders/admin/${id}/status`,
      dto
    );
    return response.data;
  },

  cancelOrder: async (id: string, reason?: string): Promise<ApiResponse<Order>> => {
    const response = await axiosInstance.patch<ApiResponse<Order>>(
      `/api/orders/admin/${id}/status`,
      { status: 'cancelled', note: reason }
    );
    return response.data;
  },
};
