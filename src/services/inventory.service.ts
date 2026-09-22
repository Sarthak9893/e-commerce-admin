import axiosInstance from '@/lib/axiosInstance';
import {
  ApiResponse,
  InventorySummary,
  LowStockItem,
  AdjustStockDto,
} from '@/types';

export const inventoryService = {
  getSummary: async (): Promise<ApiResponse<InventorySummary>> => {
    const response = await axiosInstance.get<ApiResponse<InventorySummary>>(
      '/api/inventory/summary'
    );
    return response.data;
  },

  getLowStock: async (params?: {
    threshold?: number;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{ data: LowStockItem[]; meta: any }>> => {
    const response = await axiosInstance.get(
      '/api/inventory/low-stock',
      { params }
    );
    return response.data;
  },

  getOutOfStock: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{ data: LowStockItem[]; meta: any }>> => {
    const response = await axiosInstance.get(
      '/api/inventory/out-of-stock',
      { params }
    );
    return response.data;
  },

  adjustStock: async (dto: AdjustStockDto): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post(
      '/api/inventory/adjust',
      dto
    );
    return response.data;
  },

  getMovements: async (params?: {
    page?: number;
    limit?: number;
    variantId?: string;
    reason?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get(
      '/api/inventory/movements',
      { params }
    );
    return response.data;
  },
};
