import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellOff, CheckCheck, Trash, ShieldAlert, Sparkles, Filter, Siren, AlertTriangle, Info } from 'lucide-react';
import { AlertItem, AlertType } from '../types/inventory';
import { AlertCard } from './AlertCard';

interface AlertDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  unreadCount: number;
  onMarkAsRead: (id: string | number) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onRemoveAlert: (id: string | number) => void;
}

export const AlertDropdown: React.FC<AlertDropdownProps> = ({
  isOpen,
  onClose,
  alerts,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onRemoveAlert,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [filterType, setFilterType] = useState<AlertType | 'all'>('all');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const filteredAlerts = filterType === 'all' 
    ? alerts 
    : alerts.filter((a) => a.type === filterType);

  const criticalCount = alerts.filter((a) => a.type === 'critical').length;
  const warningCount = alerts.filter((a) => a.type === 'warning').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-full mt-2 w-[360px] sm:w-[410px] max-w-[95vw] rounded-2xl bg-slate-900/95 border border-purple-500/30 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 overflow-hidden text-slate-100 flex flex-col"
          style={{ maxHeight: '520px' }}
          role="region"
          aria-label="Notifications panel"
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-800 bg-slate-950/70 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  Notifications
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {alerts.length} Total
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="px-2.5 py-1 text-[11px] font-semibold text-purple-300 hover:text-purple-200 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    title="Mark all alerts as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}

                {alerts.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                    title="Clear all notifications"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All ({alerts.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('critical')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  filterType === 'critical'
                    ? 'bg-red-600 text-white font-bold'
                    : 'text-red-400 hover:bg-red-950/40'
                }`}
              >
                <Siren className="w-3 h-3" />
                Critical ({criticalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('warning')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  filterType === 'warning'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-amber-400 hover:bg-amber-950/40'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                Warnings ({warningCount})
              </button>
            </div>
          </div>

          {/* Body / Scrollable List */}
          <div className="p-3 space-y-2.5 overflow-y-auto flex-1 max-h-[360px]">
            {filteredAlerts.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3">
                  <BellOff className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-bold text-slate-300">No notifications in view</h5>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                  Warehouse stock alerts and equipment telemetry will appear here in real time.
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onRemoveAlert}
                />
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 flex-shrink-0">
            <span className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-3 h-3" />
              StockSense Alert Gateway
            </span>
            <span className="font-mono text-slate-400">{unreadCount} unread</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
