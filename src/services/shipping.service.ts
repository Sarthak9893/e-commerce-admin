import axiosInstance from '@/lib/axiosInstance';
import {
  ApiResponse,
  Pincode,
  CreatePincodeDto,
  UpdatePincodeDto,
  ShippingRule,
  CreateShippingRuleDto,
  UpdateShippingRuleDto,
  PaginationParams,
} from '@/types';

export const shippingService = {
  // Pincodes
  getPincodes: async (params?: PaginationParams & {
    isServiceable?: boolean;
    codAvailable?: boolean;
    applicableZone?: string;
  }): Promise<ApiResponse<{ data?: Pincode[]; items?: Pincode[]; meta?: any }>> => {
    const response = await axiosInstance.get(
      '/api/shipping/pincodes',
      { params }
    );
    return response.data;
  },

  getPincodeById: async (id: string): Promise<ApiResponse<Pincode>> => {
    const response = await axiosInstance.get<ApiResponse<Pincode>>(
      `/api/shipping/pincodes/${id}`
    );
    return response.data;
  },

  createPincode: async (dto: CreatePincodeDto): Promise<ApiResponse<Pincode>> => {
    const response = await axiosInstance.post<ApiResponse<Pincode>>(
      '/api/shipping/pincodes',
      dto
    );
    return response.data;
  },

  updatePincode: async (id: string, dto: UpdatePincodeDto): Promise<ApiResponse<Pincode>> => {
    const response = await axiosInstance.patch<ApiResponse<Pincode>>(
      `/api/shipping/pincodes/${id}`,
      dto
    );
    return response.data;
  },

  deletePincode: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/api/shipping/pincodes/${id}`
    );
    return response.data;
  },

  // Rules
  getRules: async (params?: PaginationParams & {
    applicableZone?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ data?: ShippingRule[]; items?: ShippingRule[]; meta?: any }>> => {
    const response = await axiosInstance.get(
      '/api/shipping/rules',
      { params }
    );
    return response.data;
  },

  getRuleById: async (id: string): Promise<ApiResponse<ShippingRule>> => {
    const response = await axiosInstance.get<ApiResponse<ShippingRule>>(
      `/api/shipping/rules/${id}`
    );
    return response.data;
  },

  createRule: async (dto: CreateShippingRuleDto): Promise<ApiResponse<ShippingRule>> => {
    const response = await axiosInstance.post<ApiResponse<ShippingRule>>(
      '/api/shipping/rules',
      dto
    );
    return response.data;
  },

  updateRule: async (id: string, dto: UpdateShippingRuleDto): Promise<ApiResponse<ShippingRule>> => {
    const response = await axiosInstance.patch<ApiResponse<ShippingRule>>(
      `/api/shipping/rules/${id}`,
      dto
    );
    return response.data;
  },

  deleteRule: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/api/shipping/rules/${id}`
    );
    return response.data;
  },
};
