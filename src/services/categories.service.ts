import axiosInstance from '@/lib/axiosInstance';
import { ApiResponse, Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';

export const categoriesService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
    parentId?: string;
    rootOnly?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ items?: Category[]; data?: Category[]; total?: number; page?: number; limit?: number; totalPages?: number }>> => {
    const response = await axiosInstance.get(
      '/api/categories',
      { params }
    );
    return response.data;
  },

  getTree: async (status?: 'active' | 'inactive'): Promise<ApiResponse<Category[]>> => {
    const response = await axiosInstance.get<ApiResponse<Category[]>>(
      '/api/categories/tree',
      { params: { status } }
    );
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.get<ApiResponse<Category>>(
      `/api/categories/${id}`
    );
    return response.data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.get<ApiResponse<Category>>(
      `/api/categories/slug/${slug}`
    );
    return response.data;
  },

  create: async (dto: CreateCategoryDto): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.post<ApiResponse<Category>>(
      '/api/categories',
      dto
    );
    return response.data;
  },

  update: async (id: string, dto: UpdateCategoryDto): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.patch<ApiResponse<Category>>(
      `/api/categories/${id}`,
      dto
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/api/categories/${id}`
    );
    return response.data;
  },

  uploadImage: async (id: string, formData: FormData): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>(
      `/api/categories/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteImage: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/api/categories/${id}/image`
    );
    return response.data;
  },
};
