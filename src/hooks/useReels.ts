import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reelsService } from '@/services/reels.service';
import { CreateReelDto, UpdateReelDto, ReelFilterParams } from '@/types';
import toast from 'react-hot-toast';

export const useReels = (params?: ReelFilterParams) => {
  return useQuery({
    queryKey: ['reels', params],
    queryFn: () => reelsService.getAll(params),
  });
};

export const useCreateReel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReelDto) => reelsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Reel created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create reel');
    },
  });
};

export const useUpdateReel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateReelDto }) =>
      reelsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Reel updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update reel');
    },
  });
};

export const useDeleteReel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reelsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Reel deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete reel');
    },
  });
};
