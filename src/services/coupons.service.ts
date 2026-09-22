import axiosInstance from '@/lib/axiosInstance';
import {
  ApiResponse,
  Coupon,
  CreateCouponDto,
  UpdateCouponDto,
  PaginationParams,
} from '@/types';

export const couponsService = {
  getAll: async (params?: PaginationParams & { type?: string; isActive?: boolean }): Promise<ApiResponse<{ data?: Coupon[]; items?: Coupon[]; meta?: any }>> => {
    const response = await axiosInstance.get(
      '/api/coupons',
      { params }
    );
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Coupon>> => {
    const response = await axiosInstance.get<ApiResponse<Coupon>>(
      `/api/coupons/${id}`
    );
    return response.data;
  },

  create: async (dto: CreateCouponDto): Promise<ApiResponse<Coupon>> => {
    const response = await axiosInstance.post<ApiResponse<Coupon>>(
      '/api/coupons',
      dto
    );
    return response.data;
  },

  update: async (id: string, dto: UpdateCouponDto): Promise<ApiResponse<Coupon>> => {
    const response = await axiosInstance.patch<ApiResponse<Coupon>>(
      `/api/coupons/${id}`,
      dto
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/api/coupons/${id}`
    );
    return response.data;
  },
};
