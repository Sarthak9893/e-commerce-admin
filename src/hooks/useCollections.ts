import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsService } from '@/services/collections.service';
import { CreateCollectionDto, UpdateCollectionDto, PaginationParams } from '@/types';
import toast from 'react-hot-toast';

export const useCollections = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['collections', params],
    queryFn: () => collectionsService.getAll(params),
  });
};

export const useCollection = (id: string) => {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: () => collectionsService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCollectionDto) => collectionsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create collection');
    },
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCollectionDto }) =>
      collectionsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection'] });
      toast.success('Collection updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update collection');
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete collection');
    },
  });
};
