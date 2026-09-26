'use client';

import React from 'react';
import { Package, AlertTriangle, XCircle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { KPICard } from './KPICard';
import { DashboardKPIs } from '@/types/api';
import { formatNumber } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

export function KPIGrid({ kpis }: { kpis?: DashboardKPIs }) {
  const totalProducts = kpis?.total_products ?? kpis?.totalProducts ?? 0;
  const lowStock = kpis?.low_stock_count ?? kpis?.lowStockCount ?? 0;
  const outOfStock = kpis?.out_of_stock_count ?? kpis?.outOfStockCount ?? 0;
  const receipts = kpis?.pending_receipts ?? kpis?.pendingReceipts ?? 0;
  const deliveries = kpis?.pending_deliveries ?? kpis?.pendingDeliveries ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <KPICard
        title="Total Products"
        value={formatNumber(totalProducts)}
        icon={Package}
        color="indigo"
        href={ROUTES.PRODUCTS}
        subtitle="Catalog active SKUs"
      />
      <KPICard
        title="Low Stock"
        value={formatNumber(lowStock)}
        icon={AlertTriangle}
        color="amber"
        href={`${ROUTES.PRODUCTS}?stock_status=low`}
        subtitle="Below min reorder threshold"
      />
      <KPICard
        title="Out of Stock"
        value={formatNumber(outOfStock)}
        icon={XCircle}
        color="rose"
        href={`${ROUTES.PRODUCTS}?stock_status=out`}
        subtitle="Zero available units"
      />
      <KPICard
        title="Pending Receipts"
        value={formatNumber(receipts)}
        icon={ArrowDownToLine}
        color="emerald"
        href={ROUTES.RECEIPTS}
        subtitle="Inbound shipments"
      />
      <KPICard
        title="Pending Deliveries"
        value={formatNumber(deliveries)}
        icon={ArrowUpFromLine}
        color="blue"
        href={ROUTES.DELIVERIES}
        subtitle="Outbound customer orders"
      />
    </div>
  );
}
