import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, Info, X, Siren, Zap } from 'lucide-react';
import { AlertType } from '../types/inventory';
import { ToastItem } from '../context/AlertContext';

interface AlertToastProps {
  toast: ToastItem;
  onDismiss: (id: string | number) => void;
}

const TOAST_THEMES: Record<
  AlertType,
  {
    icon: React.ComponentType<{ className?: string }>;
    bgClass: string;
    borderClass: string;
    titleColor: string;
    iconColor: string;
    progressClass: string;
    badgeBg: string;
    badgeText: string;
    glowClass: string;
  }
> = {
  critical: {
    icon: Siren,
    bgClass: 'bg-gradient-to-r from-red-950/95 via-rose-950/90 to-red-900/90',
    borderClass: 'border-2 border-red-500/80',
    titleColor: 'text-red-200 font-black',
    iconColor: 'text-red-400 animate-bounce',
    progressClass: 'bg-gradient-to-r from-red-500 via-rose-400 to-red-600 shadow-[0_0_12px_#ef4444]',
    badgeBg: 'bg-red-500/30',
    badgeText: 'text-red-100 border-red-400/50 font-black',
    glowClass: 'shadow-[0_0_40px_rgba(239,68,68,0.55)] ring-1 ring-red-500/40',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-gradient-to-r from-amber-950/95 via-orange-950/90 to-amber-900/90',
    borderClass: 'border border-amber-500/70',
    titleColor: 'text-amber-200 font-bold',
    iconColor: 'text-amber-400 animate-pulse',
    progressClass: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 shadow-[0_0_10px_#f59e0b]',
    badgeBg: 'bg-amber-500/30',
    badgeText: 'text-amber-100 border-amber-400/50 font-bold',
    glowClass: 'shadow-[0_0_30px_rgba(245,158,11,0.4)]',
  },
  info: {
    icon: Info,
    bgClass: 'bg-gradient-to-r from-slate-900/95 via-indigo-950/90 to-purple-950/90',
    borderClass: 'border border-purple-500/50',
    titleColor: 'text-purple-200 font-bold',
    iconColor: 'text-purple-400',
    progressClass: 'bg-gradient-to-r from-purple-500 to-indigo-400 shadow-[0_0_10px_#a855f7]',
    badgeBg: 'bg-purple-500/30',
    badgeText: 'text-purple-100 border-purple-400/50 font-bold',
    glowClass: 'shadow-[0_0_25px_rgba(139,92,246,0.35)]',
  },
};

export const AlertToast: React.FC<AlertToastProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration || 5000;
  const theme = TOAST_THEMES[toast.type] || TOAST_THEMES.info;
  const IconComponent = theme.icon;
  const isCritical = toast.type === 'critical';

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`relative w-[360px] sm:w-[400px] max-w-[92vw] rounded-2xl p-4.5 backdrop-blur-2xl text-slate-100 overflow-hidden pointer-events-auto transition-all ${theme.bgClass} ${theme.borderClass} ${theme.glowClass}`}
      role="alert"
    >
      {/* Urgent Warning Beacon Strobe for Critical Alerts */}
      {isCritical && (
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse" />
      )}

      <div className="flex items-start gap-3.5">
        {/* Type Icon Container */}
        <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isCritical ? 'bg-red-500/20 border border-red-500/40' : 'bg-slate-800/80 border border-slate-700/60'
        } ${theme.iconColor}`}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className={`text-xs uppercase tracking-wider truncate ${theme.titleColor}`}>
              {toast.title}
            </h4>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border shadow-sm ${theme.badgeBg} ${theme.badgeText}`}
            >
              {toast.type}
            </span>
            {toast.productName && (
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                [{toast.productName}]
              </span>
            )}
          </div>
          <p className="text-xs text-slate-100 leading-relaxed font-medium">
            {toast.message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-dismiss progress timer bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950/60 overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`h-full ${theme.progressClass}`}
        />
      </div>
    </motion.div>
  );
};
