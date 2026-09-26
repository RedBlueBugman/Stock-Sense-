'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/api';

interface ProtectedComponentProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { user, hasPermission } = useAuthStore();

  if (!user || !hasPermission(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
