/**
 * Shared React Query defaults — keep server prefetch QueryClient
 * in sync with the client QueryProvider.
 */
export const defaultQueryOptions = {
  queries: {
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  },
};

/** Per-hook staleTime used by useBlockQueries (10 min) */
export const BLOCK_QUERY_STALE_TIME = 10 * 60 * 1000;

/** WhatsOn / filtered events staleTime (5 min) */
export const EVENTS_QUERY_STALE_TIME = 5 * 60 * 1000;
