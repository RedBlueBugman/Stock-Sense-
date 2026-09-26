'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { User, Shield, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500">Manage account credentials and role assignments</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
            {user?.name?.slice(0, 2).toUpperCase() || 'US'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 mt-1">
              <Shield className="h-3.5 w-3.5" /> {user?.role}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400">Account Status:</span>
            <p className="font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-4 w-4" /> Active Verified
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Sync Health:</span>
            <p className="font-semibold text-slate-700 mt-0.5">Connected (Port 3000)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
