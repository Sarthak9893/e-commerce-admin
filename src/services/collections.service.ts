import axiosInstance from '@/lib/axiosInstance';
import {
  ApiResponse,
  Collection,
  CreateCollectionDto,
  UpdateCollectionDto,
  PaginationParams,
} from '@/types';

function buildCollectionFormData(dto: CreateCollectionDto | UpdateCollectionDto): FormData {
  const formData = new FormData();
  if (dto.name !== undefined) formData.append('name', dto.name);
  if (dto.slug !== undefined && dto.slug !== '') formData.append('slug', dto.slug);
  if (dto.description !== undefined && dto.description !== '') formData.append('description', dto.description);
  if (dto.status !== undefined) formData.append('status', dto.status);
  if (dto.isFeatured !== undefined) formData.append('isFeatured', String(dto.isFeatured));
  if (dto.sortOrder !== undefined) formData.append('sortOrder', String(dto.sortOrder));
  if (dto.image && dto.image instanceof File) {
    formData.append('image', dto.image);
  }
  if (dto.productIds && Array.isArray(dto.productIds)) {
    dto.productIds.forEach((id) => formData.append('productIds', id));
  }
  return formData;
}

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
    let payload: any = dto;
    let headers: Record<string, string> | undefined = undefined;

    if (dto.image instanceof File) {
      payload = buildCollectionFormData(dto);
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    const response = await axiosInstance.post<ApiResponse<Collection>>(
      '/api/collections',
      payload,
      headers ? { headers } : undefined
    );
    return response.data;
  },

  update: async (id: string, dto: UpdateCollectionDto): Promise<ApiResponse<Collection>> => {
    let payload: any = dto;
    let headers: Record<string, string> | undefined = undefined;

    if (dto.image instanceof File) {
      payload = buildCollectionFormData(dto);
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    const response = await axiosInstance.patch<ApiResponse<Collection>>(
      `/api/collections/${id}`,
      payload,
      headers ? { headers } : undefined
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
