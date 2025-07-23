// contexts/user-context.tsx - Client-side user context
'use client'
import { createContext, useContext, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'

interface UserContextType {
  user: Session['user'] | null
  isLoading: boolean
  isAuthenticated: boolean
  hasRole: (role: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const { data: session, status } = useSession()
  
  const contextValue: UserContextType = {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    hasRole: (role: string) => session?.user?.role === role
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

/**
 * Hook to access user context
 * Throws error if used outside UserProvider
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

/**
 * Hook that requires authentication
 * Returns user or null if loading, throws if not authenticated
 */
export function useRequireAuth(): Session['user'] | null {
  const { user, isLoading, isAuthenticated } = useUser()
  
  if (isLoading) return null
  
  if (!isAuthenticated) {
    throw new Error('Authentication required')
  }
  
  return user
}
