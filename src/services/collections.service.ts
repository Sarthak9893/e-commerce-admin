import axiosInstance from '@/lib/axiosInstance';
import {
  ApiResponse,
  Collection,
  CreateCollectionDto,
  UpdateCollectionDto,
  PaginationParams,
} from '@/types';

export const collectionsService = {
  getAll: async (params?: PaginationParams & { status?: string; isFeatured?: boolean }): Promise<ApiResponse<{ data?: Collection[]; items?: Collection[]; meta?: any }>> => {
    const response = await axiosInstance.get(
      '/api/collections',
      { params }
    );
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Collection>> => {
    const response = await axiosInstance.get<ApiResponse<Collection>>(
      `/api/collections/${id}`
    );
    return response.data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Collection>> => {
    const response = await axiosInstance.get<ApiResponse<Collection>>(
      `/api/collections/slug/${slug}`
    );
    return response.data;
  },

  create: async (dto: CreateCollectionDto): Promise<ApiResponse<Collection>> => {
    const response = await axiosInstance.post<ApiResponse<Collection>>(
      '/api/collections',
      dto
    );
    return response.data;
  },

  update: async (id: string, dto: UpdateCollectionDto): Promise<ApiResponse<Collection>> => {
    const response = await axiosInstance.patch<ApiResponse<Collection>>(
      `/api/collections/${id}`,
      dto
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/api/collections/${id}`
    );
    return response.data;
  },

  getProducts: async (id: string, params?: PaginationParams): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get(
      `/api/collections/${id}/products`,
      { params }
    );
    return response.data;
  },

  addProducts: async (id: string, productIds: string[]): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post(
      `/api/collections/${id}/products`,
      { productIds }
    );
    return response.data;
  },

  removeProduct: async (id: string, productId: string): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.delete(
      `/api/collections/${id}/products/${productId}`
    );
    return response.data;
  },
};
