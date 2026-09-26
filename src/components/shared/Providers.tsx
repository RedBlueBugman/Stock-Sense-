'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
