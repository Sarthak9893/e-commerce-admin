import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '@/services/payments.service';
import { PaymentFilterParams } from '@/types';
import toast from 'react-hot-toast';

export const usePayments = (params?: PaymentFilterParams) => {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsService.getAll(params),
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentsService.getById(id),
    enabled: !!id,
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount?: number; reason?: string }) =>
      paymentsService.refund(id, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Refund initiated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    },
  });
};
