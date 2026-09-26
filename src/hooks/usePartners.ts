import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Partner } from '@/types/api';

export function usePartners(type?: 'supplier' | 'customer' | 'both') {
  return useQuery({
    queryKey: ['partners', { type }],
    queryFn: async () => {
      const res = await apiClient.get('/partners', {
        params: type ? { type } : {},
      });
      return (res.data?.data || []) as Partner[];
    },
  });
}
