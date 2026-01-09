import { useQuery } from '@tanstack/react-query';
import { accountsService } from '@/lib/api/services/accounts.service';
import { useAuth } from './useAuth';

export const useStats = () => {
  const { isRole } = useAuth();

  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: accountsService.getDashboardStats,
    enabled: isRole('admin'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
