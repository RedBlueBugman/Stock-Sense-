import React from 'react';
import { motion } from 'framer-motion';
import { Siren, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { AlertItem, AlertType } from '../types/inventory';
import { formatTimeAgo } from '../utils/alertUtils';

interface AlertCardProps {
  alert: AlertItem;
  onMarkAsRead: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}

const TYPE_CONFIG: Record<
  AlertType,
  {
    icon: React.ComponentType<{ className?: string }>;
    bgClass: string;
    borderClass: string;
    titleColor: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    dotColor: string;
  }
> = {
  critical: {
    icon: Siren,
    bgClass: 'bg-gradient-to-r from-red-950/60 via-rose-950/50 to-red-900/50 hover:from-red-950/80 hover:to-red-900/70',
    borderClass: 'border-2 border-red-500/60 hover:border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)]',
    titleColor: 'text-red-200 font-extrabold',
    iconColor: 'text-red-400 animate-pulse',
    badgeBg: 'bg-red-500/30',
    badgeText: 'text-red-200 border-red-400/50 font-black',
    dotColor: 'bg-red-500 shadow-[0_0_10px_#ef4444]',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-gradient-to-r from-amber-950/50 via-orange-950/40 to-amber-900/40 hover:from-amber-950/70 hover:to-amber-900/60',
    borderClass: 'border border-amber-500/50 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    titleColor: 'text-amber-200 font-bold',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/25',
    badgeText: 'text-amber-200 border-amber-400/40 font-bold',
    dotColor: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
  },
  info: {
    icon: Info,
    bgClass: 'bg-gradient-to-r from-slate-900/80 via-indigo-950/40 to-slate-900/80 hover:bg-slate-800/80',
    borderClass: 'border border-purple-500/40 hover:border-purple-400/70',
    titleColor: 'text-purple-200 font-semibold',
    iconColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-200 border-purple-400/30 font-semibold',
    dotColor: 'bg-purple-400 shadow-[0_0_8px_#c084fc]',
  },
};

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onMarkAsRead,
  onDelete,
}) => {
  const config = TYPE_CONFIG[alert.type] || TYPE_CONFIG.info;
  const IconComponent = config.icon;
  const isCritical = alert.type === 'critical';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={() => onMarkAsRead(alert.id)}
      className={`group relative p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left ${config.bgClass} ${config.borderClass} ${
        !alert.isRead ? 'ring-1 ring-white/10' : 'opacity-85'
      }`}
    >
      {/* Unread Indicator Dot */}
      {!alert.isRead && (
        <span
          className={`absolute top-4 left-2 w-2.5 h-2.5 rounded-full ${config.dotColor} animate-ping opacity-90`}
        />
      )}
      {!alert.isRead && (
        <span
          className={`absolute top-4 left-2 w-2.5 h-2.5 rounded-full ${config.dotColor}`}
        />
      )}

      <div className={`flex flex-col gap-1.5 ${!alert.isRead ? 'pl-3' : ''}`}>
        {/* Top Header Row: Icon, Title, Time Ago */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`flex-shrink-0 ${config.iconColor}`}>
              <IconComponent className="w-4 h-4" />
            </span>
            <span className={`text-xs tracking-tight truncate ${config.titleColor}`}>
              {alert.title}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider border shadow-sm ${config.badgeBg} ${config.badgeText}`}
            >
              {alert.type}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-mono text-slate-400">
              {formatTimeAgo(alert.timestamp)}
            </span>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(alert.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 rounded transition-all"
                title="Dismiss alert"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Message Row */}
        <p className="text-xs text-slate-200 leading-snug break-words font-normal">
          {alert.message}
        </p>

        {alert.productName && (
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
            <span>Target:</span>
            <span className="text-slate-300 font-semibold">{alert.productName}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
