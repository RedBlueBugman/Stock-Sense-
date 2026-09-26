import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAlerts } from '../context/AlertContext';
import { AlertToast } from './AlertToast';

export const AlertToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useAlerts();

  return (
    <div
      className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-h-[85vh] overflow-hidden"
      aria-live="polite"
      aria-label="Notification alerts"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <AlertToast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
