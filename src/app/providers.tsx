// app/providers.tsx - Updated to include UserProvider
'use client'

import { SessionProvider } from 'next-auth/react'
import { UserProvider } from '@/contexts/user-context'
import { AchievementNotificationProvider } from '@/contexts/achievement-notification-context'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <UserProvider>
        <AchievementNotificationProvider>
          {children}
        </AchievementNotificationProvider>
      </UserProvider>
    </SessionProvider>
  )
}