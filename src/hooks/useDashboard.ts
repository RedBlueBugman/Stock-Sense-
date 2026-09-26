import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { DashboardKPIs, MovementTrend, StockOperation, Product } from '@/types/api';

export function useDashboard(warehouseId?: string) {
  // 1. Fetch KPIs (Auto-refresh every 30 seconds as specified)
  const kpiQuery = useQuery({
    queryKey: ['dashboard', 'kpis', { warehouseId }],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/kpis', {
        params: warehouseId ? { warehouse_id: warehouseId } : {},
      });
      return res.data?.data as DashboardKPIs;
    },
    refetchInterval: 30_000,
  });

  // 2. Fetch 30-day Movement Trend for Charts
  const trendQuery = useQuery({
    queryKey: ['dashboard', 'trend', { warehouseId }],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/movement-trend', {
        params: { days: 30, ...(warehouseId ? { warehouse_id: warehouseId } : {}) },
      });
      return (res.data?.data || []) as MovementTrend[];
    },
  });

  // 3. Fetch Recent Operations
  const recentOpsQuery = useQuery({
    queryKey: ['dashboard', 'recent-operations', { warehouseId }],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/recent-operations', {
        params: { limit: 10, ...(warehouseId ? { warehouse_id: warehouseId } : {}) },
      });
      return (res.data?.data || []) as StockOperation[];
    },
    refetchInterval: 30_000,
  });

  // 4. Fetch Low Stock Alerts
  const lowStockQuery = useQuery({
    queryKey: ['dashboard', 'low-stock', { warehouseId }],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/low-stock', {
        params: { limit: 10, ...(warehouseId ? { warehouse_id: warehouseId } : {}) },
      });
      return (res.data?.data || []) as Product[];
    },
  });

  return {
    kpis: kpiQuery.data,
    isLoadingKpis: kpiQuery.isLoading,
    trend: trendQuery.data || [],
    isLoadingTrend: trendQuery.isLoading,
    recentOps: recentOpsQuery.data || [],
    isLoadingRecentOps: recentOpsQuery.isLoading,
    lowStock: lowStockQuery.data || [],
    isLoadingLowStock: lowStockQuery.isLoading,
    refetchAll: () => {
      kpiQuery.refetch();
      trendQuery.refetch();
      recentOpsQuery.refetch();
      lowStockQuery.refetch();
    },
  };
}
