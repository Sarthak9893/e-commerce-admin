import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { PaginationParams } from '@/types';

export const useNotificationLogs = (params?: PaginationParams & {
  type?: string;
  status?: string;
  recipientEmail?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  return useQuery({
    queryKey: ['notifications', 'logs', params],
    queryFn: () => notificationsService.getLogs(params),
  });
};

// Aliases for compatibility
export const useNotifications = useNotificationLogs;
