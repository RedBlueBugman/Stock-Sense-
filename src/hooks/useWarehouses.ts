import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Warehouse, Location } from '@/types/api';

export function useWarehouses() {
  const warehousesQuery = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await apiClient.get('/warehouses');
      return (res.data?.data || []) as Warehouse[];
    },
  });

  return {
    warehouses: warehousesQuery.data || [],
    isLoading: warehousesQuery.isLoading,
  };
}

export function useLocations(warehouseId?: string) {
  return useQuery({
    queryKey: ['locations', { warehouseId }],
    queryFn: async () => {
      if (!warehouseId) return [];
      const res = await apiClient.get('/locations', { params: { warehouse_id: warehouseId } });
      return (res.data?.data || []) as Location[];
    },
    enabled: !!warehouseId,
  });
}
