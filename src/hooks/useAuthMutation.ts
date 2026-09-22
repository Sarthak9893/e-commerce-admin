import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { LoginDto } from '@/types';
import toast from 'react-hot-toast';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (credentials: LoginDto) => authService.login(credentials),
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    },
  });
};

export const useAdminProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['adminProfile'],
    queryFn: () => authService.getProfile(),
    enabled,
    staleTime: 1000 * 60 * 15,
  });
};
