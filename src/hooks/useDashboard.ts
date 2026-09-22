import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardService.getSummary(),
  });
};

export const useSalesChart = (
  interval: 'day' | 'week' | 'month' = 'day',
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['dashboard', 'salesChart', interval, startDate, endDate],
    queryFn: () => dashboardService.getSalesChart(interval, startDate, endDate),
  });
};

export const useBestSellingProducts = (
  limit: number = 5,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['dashboard', 'bestSelling', limit, startDate, endDate],
    queryFn: () => dashboardService.getBestSellingProducts(limit, startDate, endDate),
  });
};

export const useRecentOrders = (limit: number = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'recentOrders', limit],
    queryFn: () => dashboardService.getRecentOrders(limit),
  });
};

export const useLowStockReport = (
  threshold: number = 10,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['dashboard', 'lowStock', threshold, page, limit],
    queryFn: () => dashboardService.getLowStockReport(threshold, page, limit),
  });
};
