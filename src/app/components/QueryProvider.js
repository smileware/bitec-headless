'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Cache for 15 minutes (longer to reduce server load)
                staleTime: 15 * 60 * 1000,
                // Keep cached data for 30 minutes
                gcTime: 30 * 60 * 1000,
                // Retry failed requests once
                retry: 1,
                // Disable ALL automatic refetching to reduce server load
                refetchOnWindowFocus: false,
                refetchOnMount: false, // Don't refetch on component mount if data exists
                refetchOnReconnect: false, // Don't refetch on reconnect
                refetchInterval: false, // Don't auto-refetch on interval
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

