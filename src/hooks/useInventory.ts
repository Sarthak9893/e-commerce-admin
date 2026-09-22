import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import { AdjustStockDto } from '@/types';
import toast from 'react-hot-toast';

export const useInventorySummary = () => {
  return useQuery({
    queryKey: ['inventory', 'summary'],
    queryFn: () => inventoryService.getSummary(),
  });
};

export const useLowStockInventory = (params?: {
  threshold?: number;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['inventory', 'lowStock', params],
    queryFn: () => inventoryService.getLowStock(params),
  });
};

export const useOutOfStockInventory = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['inventory', 'outOfStock', params],
    queryFn: () => inventoryService.getOutOfStock(params),
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AdjustStockDto) => inventoryService.adjustStock(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Inventory adjusted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
    },
  });
};
