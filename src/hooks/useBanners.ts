import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannersService } from '@/services/banners.service';
import { CreateBannerDto, UpdateBannerDto } from '@/types';
import toast from 'react-hot-toast';

export const useBanners = (params?: { position?: string; isActive?: boolean }) => {
  return useQuery({
    queryKey: ['banners', params],
    queryFn: () => bannersService.getAll(params),
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBannerDto) => bannersService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create banner');
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBannerDto }) =>
      bannersService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update banner');
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete banner');
    },
  });
};
