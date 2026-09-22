import axiosInstance from '@/lib/axiosInstance';
import { ApiResponse, Review, PaginationParams, UpdateReviewStatusDto } from '@/types';

export const reviewsService = {
  getAll: async (params?: PaginationParams & {
    status?: string;
    productId?: string;
    userId?: string;
    rating?: number;
    isVerifiedPurchase?: boolean;
  }): Promise<ApiResponse<{ data?: Review[]; items?: Review[]; meta?: any }>> => {
    const response = await axiosInstance.get(
      '/api/reviews/admin',
      { params }
    );
    return response.data;
  },

  updateStatus: async (id: string, dto: UpdateReviewStatusDto): Promise<ApiResponse<Review>> => {
    const response = await axiosInstance.patch<ApiResponse<Review>>(
      `/api/reviews/admin/${id}/status`,
      dto
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/api/reviews/admin/${id}`
    );
    return response.data;
  },
};
