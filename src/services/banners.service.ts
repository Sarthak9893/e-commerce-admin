import axiosInstance from '@/lib/axiosInstance';
import {
  ApiResponse,
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
  PaginationParams,
} from '@/types';

/**
 * Build a FormData from the DTO, skipping undefined/null values.
 * File values are appended as-is; primitives are stringified.
 */
function buildBannerFormData(dto: CreateBannerDto | UpdateBannerDto): FormData {
  const formData = new FormData();

  Object.entries(dto).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (value instanceof File) {
      formData.append(key, value, value.name);
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}

export const bannersService = {
  getAll: async (params?: PaginationParams & { position?: string; isActive?: boolean }): Promise<ApiResponse<{ data?: Banner[]; items?: Banner[]; meta?: any }>> => {
    const response = await axiosInstance.get(
      '/api/banners/admin',
      { params }
    );
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Banner>> => {
    const response = await axiosInstance.get<ApiResponse<Banner>>(
      `/api/banners/${id}`
    );
    return response.data;
  },

  create: async (dto: CreateBannerDto): Promise<ApiResponse<Banner>> => {
    const formData = buildBannerFormData(dto);
    const response = await axiosInstance.post<ApiResponse<Banner>>(
      '/api/banners',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  update: async (id: string, dto: UpdateBannerDto): Promise<ApiResponse<Banner>> => {
    const formData = buildBannerFormData(dto);
    const response = await axiosInstance.patch<ApiResponse<Banner>>(
      `/api/banners/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/api/banners/${id}`
    );
    return response.data;
  },

  reorder: async (banners: { id: string; sortOrder: number }[]): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.patch<ApiResponse<void>>(
      '/api/banners/reorder',
      { banners }
    );
    return response.data;
  },
};
