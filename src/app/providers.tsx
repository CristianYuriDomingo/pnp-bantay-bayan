// app/providers.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { UserProvider } from '@/contexts/user-context'
import { AchievementNotificationProvider } from '@/contexts/achievement-notification-context'
import { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // INSTANT UPDATES - DUOLINGO-STYLE ⚡
        staleTime: 0, // ALWAYS fresh - refetch immediately
        gcTime: 2 * 60 * 1000, // Keep in cache for 2 min for back navigation
        retry: 2, // Quick retries for flaky connections
        
        // REAL-TIME FEATURES
        refetchOnWindowFocus: true,
        refetchOnMount: true, // Always fetch latest
        refetchOnReconnect: true,
        
        // NO POLLING - use optimistic updates + events instead
        refetchInterval: false,
        refetchIntervalInBackground: false,
      },
    },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <AchievementNotificationProvider>
            {children}
          </AchievementNotificationProvider>
        </UserProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  )
}