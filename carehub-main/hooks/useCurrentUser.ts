import { useQuery } from '@tanstack/react-query';
import { accountsService } from '@/lib/api/services/accounts.service';
import { useAuth } from './useAuth';

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: accountsService.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
