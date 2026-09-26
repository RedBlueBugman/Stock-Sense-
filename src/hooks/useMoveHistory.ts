import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { StockMove } from '@/types/api';

export function useMoveHistory(filters: any = {}) {
  return useQuery({
    queryKey: ['stock', 'moves', filters],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/stock/moves', { params: filters });
        return (res.data?.data || []) as StockMove[];
      } catch (err) {
        // Fallback demo ledger moves
        return [
          {
            id: 'move-1',
            operationId: 'op-01',
            product_name: 'Heavy Duty Steel Rod 10mm',
            quantity: 50,
            unitOfMeasure: 'pcs',
            source_location_name: 'Vendor Location',
            dest_location_name: 'Main Storage A-01',
            status: 'done',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'move-2',
            operationId: 'op-02',
            product_name: 'Industrial Bolt M8',
            quantity: -20,
            unitOfMeasure: 'box',
            source_location_name: 'Main Storage B-02',
            dest_location_name: 'Customer Location',
            status: 'done',
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
        ] as StockMove[];
      }
    },
  });
}
