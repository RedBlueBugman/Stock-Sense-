'use client';

import React, { useState } from 'react';
import { Search, Bell, Menu, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/axios';
import Link from 'next/link';

export function TopBar() {
  const { toggleSidebar } = useUiStore();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data?.data);
    } catch (err) {
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/95 px-6 backdrop-blur dark:bg-slate-900/95">
      {/* Left: Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Center: Global Search Input */}
      <div className="relative w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products, SKUs, partners, locations..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        {/* Live Search Dropdown */}
        {searchResults && (
          <div className="absolute top-12 left-0 right-0 max-h-80 overflow-y-auto rounded-xl border bg-white p-3 shadow-xl dark:bg-slate-800">
            {searchResults.products?.length > 0 && (
              <div className="mb-3">
                <span className="text-xs font-bold uppercase text-slate-400">Products</span>
                {searchResults.products.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    onClick={() => setSearchResults(null)}
                    className="block rounded-lg px-2 py-1.5 text-sm hover:bg-indigo-50 font-medium text-slate-800 dark:text-slate-200"
                  >
                    {p.name} <span className="text-xs text-slate-400">({p.sku})</span>
                  </Link>
                ))}
              </div>
            )}
            {searchResults.partners?.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Partners</span>
                {searchResults.partners.map((pt: any) => (
                  <div key={pt.id} className="px-2 py-1 text-sm text-slate-700">
                    {pt.name} ({pt.type})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Sync status, Notifications, User Menu */}
      <div className="flex items-center gap-4">
        {/* Cloud Sync Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Cloud Sync Online</span>
        </div>

        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user?.name}</span>
            <span className="text-xs font-medium text-indigo-600 flex items-center gap-1 justify-end">
              <ShieldCheck className="h-3 w-3" /> {user?.role}
            </span>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
