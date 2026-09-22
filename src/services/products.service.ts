import axiosInstance from '@/lib/axiosInstance';
import {
  ApiResponse,
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterParams,
} from '@/types';

export const productsService = {
  getAll: async (params?: ProductFilterParams): Promise<ApiResponse<{ items?: Product[]; data?: Product[]; total?: number; page?: number; limit?: number; totalPages?: number }>> => {
    const response = await axiosInstance.get(
      '/api/products',
      { params }
    );
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.get<ApiResponse<Product>>(
      `/api/products/${id}`
    );
    return response.data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.get<ApiResponse<Product>>(
      `/api/products/slug/${slug}`
    );
    return response.data;
  },

  create: async (dto: CreateProductDto): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.post<ApiResponse<Product>>(
      '/api/products',
      dto
    );
    return response.data;
  },

  update: async (id: string, dto: UpdateProductDto): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.patch<ApiResponse<Product>>(
      `/api/products/${id}`,
      dto
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/api/products/${id}`
    );
    return response.data;
  },

  uploadImages: async (
    id: string,
    formData: FormData
  ): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>(
      `/api/products/${id}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteImage: async (productId: string, imageId: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/api/products/${productId}/images/${imageId}`
    );
    return response.data;
  },

  reorderImages: async (productId: string, imageIds: string[]): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.patch<ApiResponse<void>>(
      `/api/products/${productId}/images/reorder`,
      { imageIds }
    );
    return response.data;
  },
};
