import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsService } from '@/services/coupons.service';
import { CreateCouponDto, UpdateCouponDto, PaginationParams } from '@/types';
import toast from 'react-hot-toast';

export const useCoupons = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['coupons', params],
    queryFn: () => couponsService.getAll(params),
  });
};

export const useCoupon = (id: string) => {
  return useQuery({
    queryKey: ['coupon', id],
    queryFn: () => couponsService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCouponDto) => couponsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCouponDto }) =>
      couponsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon'] });
      toast.success('Coupon updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update coupon');
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    },
  });
};
