import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '@/services/reviews.service';
import { ReviewStatus, PaginationParams } from '@/types';
import toast from 'react-hot-toast';

export const useReviews = (params?: PaginationParams & { status?: ReviewStatus; productId?: string }) => {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => reviewsService.getAll(params),
  });
};

export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReviewStatus }) =>
      reviewsService.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update review status');
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    },
  });
};
