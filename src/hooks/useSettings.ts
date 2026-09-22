import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { StoreSettings } from '@/types';
import toast from 'react-hot-toast';

export const useStoreSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });
};

export const useUpdateStoreSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<StoreSettings>) => settingsService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Store settings saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update store settings');
    },
  });
};
