import axiosInstance from '@/lib/axiosInstance';
import {
  ApiResponse,
  Reel,
  CreateReelDto,
  UpdateReelDto,
  ReelFilterParams,
} from '@/types';

// Strip empty strings, undefined, and null values from params, and format sortOrder to uppercase
function cleanParams(params?: Record<string, any>): Record<string, any> | undefined {
  if (!params) return undefined;
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'sortOrder' && typeof value === 'string') {
        cleaned[key] = value.toUpperCase();
      } else {
        cleaned[key] = value;
      }
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export const reelsService = {
  getAll: async (params?: ReelFilterParams): Promise<ApiResponse<{ data?: Reel[]; items?: Reel[]; meta?: any }>> => {
    const response = await axiosInstance.get(
      '/api/reels/admin',
      { params: cleanParams(params) }
    );
    return response.data;
  },

  getPublic: async (): Promise<ApiResponse<Reel[]>> => {
    const response = await axiosInstance.get<ApiResponse<Reel[]>>(
      '/api/reels'
    );
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Reel>> => {
    const response = await axiosInstance.get<ApiResponse<Reel>>(
      `/api/reels/${id}`
    );
    return response.data;
  },

  create: async (dto: CreateReelDto): Promise<ApiResponse<Reel>> => {
    const response = await axiosInstance.post<ApiResponse<Reel>>(
      '/api/reels',
      dto
    );
    return response.data;
  },

  update: async (id: string, dto: UpdateReelDto): Promise<ApiResponse<Reel>> => {
    const response = await axiosInstance.patch<ApiResponse<Reel>>(
      `/api/reels/${id}`,
      dto
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/api/reels/${id}`
    );
    return response.data;
  },
};
