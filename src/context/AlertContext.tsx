import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AlertItem, AlertType, Product } from '../types/inventory';
import { playAlertSound } from '../utils/audio';
import { triggerStockAlert, RANDOM_ALERT_TEMPLATES } from '../utils/alertUtils';

export interface ToastItem extends AlertItem {
  duration?: number;
}

interface AlertContextType {
  alerts: AlertItem[];
  toasts: ToastItem[];
  unreadCount: number;
  isBellWiggling: boolean;
  addAlert: (alertData: Omit<AlertItem, 'id' | 'timestamp' | 'isRead'> & { id?: string | number }) => AlertItem;
  removeAlert: (id: string | number) => void;
  dismissToast: (id: string | number) => void;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  clearAllAlerts: () => void;
  checkProductStockAlert: (product: Product) => AlertItem | null;
  triggerRandomAlert: () => AlertItem;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Initial initial sample alerts for rich demo state
const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'INIT-1',
    type: 'critical',
    title: 'OUT OF STOCK',
    message: 'Office Chairs is completely out of stock in warehouse.',
    productName: 'Office Chairs',
    timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 mins ago
    isRead: false,
  },
  {
    id: 'INIT-2',
    type: 'warning',
    title: 'Low Stock Warning',
    message: 'Steel Rods: 15/50 units remaining (below reorder threshold).',
    productName: 'Steel Rods',
    timestamp: new Date(Date.now() - 1000 * 60 * 14), // 14 mins ago
    isRead: false,
  },
  {
    id: 'INIT-3',
    type: 'info',
    title: 'Dock 1 Inbound Received',
    message: 'Batch LOT-2026-WP14 scanned and logged successfully.',
    productName: 'Wood Planks',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    isRead: true,
  },
];

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isBellWiggling, setIsBellWiggling] = useState<boolean>(false);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  // Add Alert and Toast
  const addAlert = useCallback(
    (alertData: Omit<AlertItem, 'id' | 'timestamp' | 'isRead'> & { id?: string | number }) => {
      const newAlert: AlertItem = {
        id: alertData.id || `ALERT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: alertData.type,
        title: alertData.title,
        message: alertData.message,
        productName: alertData.productName,
        timestamp: new Date(),
        isRead: false,
      };

      // 1. Play auditory alert
      playAlertSound(newAlert.type);

      // 2. Trigger bell shake animation
      setIsBellWiggling(true);
      setTimeout(() => setIsBellWiggling(false), 800);

      // 3. Prepend to alerts list
      setAlerts((prev) => [newAlert, ...prev]);

      // 4. Add to active toasts (floating popup)
      const toastItem: ToastItem = { ...newAlert, duration: 5000 };
      setToasts((prev) => [toastItem, ...prev]);

      return newAlert;
    },
    []
  );

  // Auto-dismiss toast after duration (default 5000ms)
  const dismissToast = useCallback((id: string | number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Remove alert completely from history & toasts
  const removeAlert = useCallback((id: string | number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Mark single alert as read
  const markAsRead = useCallback((id: string | number) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
  }, []);

  // Mark all alerts as read
  const markAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
    setToasts([]);
  }, []);

  // Check product stock and emit alert
  const checkProductStockAlert = useCallback(
    (product: Product) => {
      const alertInfo = triggerStockAlert(product);
      if (!alertInfo) return null;
      return addAlert(alertInfo);
    },
    [addAlert]
  );

  // Trigger random demo alert
  const triggerRandomAlert = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * RANDOM_ALERT_TEMPLATES.length);
    const template = RANDOM_ALERT_TEMPLATES[randomIndex];
    return addAlert(template);
  }, [addAlert]);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        toasts,
        unreadCount,
        isBellWiggling,
        addAlert,
        removeAlert,
        dismissToast,
        markAsRead,
        markAllAsRead,
        clearAllAlerts,
        checkProductStockAlert,
        triggerRandomAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
