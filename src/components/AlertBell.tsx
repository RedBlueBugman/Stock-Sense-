import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';
import { AlertDropdown } from './AlertDropdown';

interface AlertBellProps {
  className?: string;
}

export const AlertBell: React.FC<AlertBellProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {
    alerts,
    unreadCount,
    isBellWiggling,
    markAsRead,
    markAllAsRead,
    clearAllAlerts,
    removeAlert,
  } = useAlerts();

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Bell Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        animate={
          isBellWiggling
            ? {
                rotate: [0, -22, 22, -16, 16, -10, 10, 0],
                scale: [1, 1.2, 1],
              }
            : {}
        }
        transition={{ duration: 0.65, ease: 'easeInOut' }}
        className="relative p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/80 text-slate-300 hover:text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer flex items-center justify-center"
      >
        <Bell className="w-5 h-5 text-purple-200" />

        {/* Unread Badge with Pulsing Ping Glow */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              key="badge-container"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 flex items-center justify-center"
            >
              {/* Outer Pulsing Ping Ring */}
              <span className="absolute w-5 h-5 rounded-full bg-red-500 opacity-75 animate-ping pointer-events-none" />
              
              {/* Core Badge */}
              <span className="relative min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-mono font-black rounded-full flex items-center justify-center border-2 border-slate-950 shadow-[0_0_15px_rgba(239,68,68,0.9)]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Alert Dropdown Panel */}
      <AlertDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        alerts={alerts}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onClearAll={clearAllAlerts}
        onRemoveAlert={removeAlert}
      />
    </div>
  );
};
