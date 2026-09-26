'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { MovementTrend } from '@/types/api';

// Demo trend fallback data so charts render beautifully right away
const mockTrend: MovementTrend[] = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    receipts: Math.floor(Math.random() * 25) + 5,
    deliveries: Math.floor(Math.random() * 20) + 3,
    transfers: Math.floor(Math.random() * 15) + 1,
    adjustments: Math.floor(Math.random() * 5),
  };
});

export function MovementChart({ trend }: { trend?: MovementTrend[] }) {
  const data = trend && trend.length > 0 ? trend : mockTrend;

  return (
    <div className="h-[300px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Line type="monotone" dataKey="receipts" name="Receipts" stroke="#10b981" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="deliveries" name="Deliveries" stroke="#ef4444" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="transfers" name="Transfers" stroke="#6366f1" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="adjustments" name="Adjustments" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
