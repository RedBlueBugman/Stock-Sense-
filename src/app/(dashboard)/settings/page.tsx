'use client';

import React from 'react';
import { Settings, Save, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings</h1>
        <p className="text-sm text-slate-500">Configure global warehouse rules, thresholds, and defaults</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 border-b pb-2">General System Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700">Reservation Timeout (Minutes)</label>
            <input type="number" defaultValue={60} className="mt-1 w-full rounded-xl border p-2.5" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700">Stock Valuation Method</label>
            <select className="mt-1 w-full rounded-xl border p-2.5">
              <option>FIFO (First In First Out)</option>
              <option>Standard Cost</option>
              <option>Average Cost</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => toast.success('Settings updated successfully')}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white"
        >
          <Save className="h-4 w-4" /> Save System Settings
        </button>
      </div>
    </div>
  );
}
