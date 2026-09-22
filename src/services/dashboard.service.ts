import axiosInstance from '@/lib/axiosInstance';
import {
  ApiResponse,
  DashboardSummary,
  SalesChartItem,
  BestSellingProduct,
  Order,
  LowStockItem,
} from '@/types';

export const dashboardService = {
  getSummary: async (): Promise<ApiResponse<DashboardSummary>> => {
    const response = await axiosInstance.get<ApiResponse<DashboardSummary>>(
      '/api/dashboard/summary'
    );
    return response.data;
  },

  getSalesChart: async (
    interval: 'day' | 'week' | 'month' = 'day',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<SalesChartItem[]>> => {
    const response = await axiosInstance.get<ApiResponse<SalesChartItem[]>>(
      '/api/dashboard/sales-chart',
      { params: { interval, startDate, endDate } }
    );
    return response.data;
  },

  getBestSellingProducts: async (
    limit: number = 5,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<BestSellingProduct[]>> => {
    const response = await axiosInstance.get<ApiResponse<BestSellingProduct[]>>(
      '/api/dashboard/best-selling-products',
      { params: { limit, startDate, endDate } }
    );
    return response.data;
  },

  getRecentOrders: async (limit: number = 5): Promise<ApiResponse<Order[]>> => {
    const response = await axiosInstance.get<ApiResponse<Order[]>>(
      '/api/dashboard/recent-orders',
      { params: { limit } }
    );
    return response.data;
  },

  getLowStockReport: async (
    threshold: number = 10,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ApiResponse<{ data: LowStockItem[]; meta: any }>> => {
    const response = await axiosInstance.get<ApiResponse<{ data: LowStockItem[]; meta: any }>>(
      '/api/dashboard/low-stock',
      { params: { threshold, page, limit, search } }
    );
    return response.data;
  },
};
