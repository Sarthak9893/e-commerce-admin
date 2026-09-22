import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shippingService } from '@/services/shipping.service';
import {
  CreatePincodeDto,
  CreateShippingRuleDto,
  PaginationParams,
} from '@/types';
import toast from 'react-hot-toast';

export const usePincodes = (params?: PaginationParams & { isServiceable?: boolean; isDeliverable?: boolean; codAvailable?: boolean; applicableZone?: string }) => {
  return useQuery({
    queryKey: ['shipping', 'pincodes', params],
    queryFn: () => shippingService.getPincodes(params),
  });
};

export const useCreatePincode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePincodeDto) => shippingService.createPincode(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'pincodes'] });
      toast.success('Pincode added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add pincode');
    },
  });
};

export const useDeletePincode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.deletePincode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'pincodes'] });
      toast.success('Pincode deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete pincode');
    },
  });
};

export const useShippingRules = () => {
  return useQuery({
    queryKey: ['shipping', 'rules'],
    queryFn: () => shippingService.getRules(),
  });
};

export const useCreateShippingRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateShippingRuleDto) => shippingService.createRule(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'rules'] });
      toast.success('Shipping rule created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create shipping rule');
    },
  });
};

export const useDeleteShippingRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'rules'] });
      toast.success('Shipping rule deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete shipping rule');
    },
  });
};
