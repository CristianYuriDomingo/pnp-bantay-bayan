// src/hooks/use-user-badges.ts - INSTANT DUOLINGO-STYLE ⚡
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentUserId, useCurrentUser } from './use-current-user'

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  triggerType: string;
  triggerValue: string;
  earnedAt: Date;
}

export interface BadgeStats {
  totalEarned: number;
  totalAvailable: number;
  completionPercentage: number;
  rarityBreakdown: {
    Common: number;
    Rare: number;
    Epic: number;
    Legendary: number;
  };
  latestBadge: UserBadge | null;
}

export interface BadgeAwardResult {
  newBadges: UserBadge[];
  badgeCount: number;
  success: boolean;
}

interface UserBadgesResponse {
  badges: UserBadge[];
  statistics: BadgeStats;
  userId: string;
}

async function fetchUserBadgesData(userId: string, userEmail?: string | null): Promise<UserBadgesResponse> {
  console.log(`Fetching badges for user ${userEmail}`)
  
  const response = await fetch('/api/users/badges')
  
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response')
  }
  
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch badges')
  }

  const data = result.data
  
  if (data.userId !== userId) {
    console.error('Security violation: Received badge data for different user')
    throw new Error('Data integrity error - user mismatch')
  }
  
  console.log(`Badge data loaded for ${userEmail}: ${data.badges.length} badges earned`)
  
  return {
    badges: data.badges.map((badge: any) => ({
      ...badge,
      earnedAt: new Date(badge.earnedAt)
    })),
    statistics: data.statistics,
    userId: data.userId
  }
}

// ============================================================================
// REACT QUERY HOOK - INSTANT MODE ⚡
// ============================================================================

/**
 * Hook to get user's earned badges - INSTANT UPDATES
 * ⚡ SAME AS PROGRESS: 0ms staleTime for instant badge updates
 */
export function useUserBadges() {
  const userId = useCurrentUserId()
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()
  
  const { 
    data, 
    isLoading: loading, 
    error: queryError,
    refetch,
    isFetching // Shows background refresh
  } = useQuery({
    queryKey: ['userBadges', userId],
    queryFn: () => fetchUserBadgesData(userId!, user?.email),
    enabled: !!userId,
    
    // ⚡ INSTANT MODE - MATCH PROGRESS SETTINGS
    staleTime: 0, // ALWAYS fresh - instant updates!
    gcTime: 2 * 60 * 1000, // 2 minutes (same as progress)
    
    // SMART REFETCHING
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  })

  // Listen for badge and progress events - INSTANT
  useEffect(() => {
    if (!userId) return;

    const handleBadgesAwarded = () => {
      console.log('🎉 Badge awarded! Instant refresh userBadges...')
      queryClient.invalidateQueries({ 
        queryKey: ['userBadges', userId],
        refetchType: 'active'
      })
    }

    const handleProgressRefresh = () => {
      console.log('🔄 Progress refresh - updating userBadges...')
      queryClient.invalidateQueries({ 
        queryKey: ['userBadges', userId],
        refetchType: 'active'
      })
    }

    const handleLessonComplete = () => {
      console.log('✅ Lesson complete - checking userBadges...')
      queryClient.invalidateQueries({ 
        queryKey: ['userBadges', userId],
        refetchType: 'active'
      })
    }

    window.addEventListener('badgesAwarded', handleBadgesAwarded)
    window.addEventListener('progressRefresh', handleProgressRefresh)
    window.addEventListener('lessonCompleted', handleLessonComplete)
    
    return () => {
      window.removeEventListener('badgesAwarded', handleBadgesAwarded)
      window.removeEventListener('progressRefresh', handleProgressRefresh)
      window.removeEventListener('lessonCompleted', handleLessonComplete)
    }
  }, [queryClient, userId])

  const error = queryError?.message || null
  const badges = data?.badges || []
  const statistics = data?.statistics || null

  return {
    badges,
    statistics,
    loading,
    isFetching, // NEW: shows background refresh
    error,
    refetch
  }
}

// ============================================================================
// BADGE AWARDING MUTATION
// ============================================================================

export function useBadgeAwarding() {
  const userId = useCurrentUserId()
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()

  const { 
    mutateAsync: awardBadgesMutation, 
    isPending: awarding,
    data: lastAwardResult 
  } = useMutation({
    mutationFn: async ({ lessonId, moduleId }: { lessonId: string; moduleId: string }) => {
      console.log(`Checking badge awards for user ${user?.email}: lesson ${lessonId}`)
      
      const response = await fetch('/api/users/badges/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          moduleId,
          type: 'lesson'
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to award badges')
      }

      const data = result.data
      
      if (data.userId !== userId) {
        throw new Error('Security violation in badge award response')
      }
      
      const awardResult: BadgeAwardResult = {
        newBadges: data.newBadges.map((badge: any) => ({
          ...badge,
          earnedAt: new Date(badge.earnedAt)
        })),
        badgeCount: data.badgeCount,
        success: data.success
      }
      
      if (awardResult.badgeCount > 0) {
        console.log(`🎉 Badge awards for ${user?.email}: ${awardResult.badgeCount} new badges!`)
        
        window.dispatchEvent(new CustomEvent('badgesAwarded', {
          detail: {
            userId: userId,
            newBadges: awardResult.newBadges,
            badgeCount: awardResult.badgeCount
          }
        }))
      }
      
      return awardResult
    },
    onSuccess: () => {
      // Instant invalidation of all badge queries
      queryClient.invalidateQueries({ queryKey: ['userBadges'] })
      queryClient.invalidateQueries({ queryKey: ['allBadges'] })
    }
  })

  return {
    awardBadges: async (lessonId: string, moduleId: string) => {
      try {
        return await awardBadgesMutation({ lessonId, moduleId })
      } catch (err) {
        console.error('Error awarding badges:', err)
        return null
      }
    },
    awarding,
    lastAwardResult: lastAwardResult || null
  }
}

// ============================================================================
// BADGE NOTIFICATIONS
// ============================================================================

export function useBadgeNotifications() {
  const [newBadges, setNewBadges] = useState<UserBadge[]>([])
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const handleBadgesAwarded = (event: CustomEvent) => {
      const { newBadges: earnedBadges, badgeCount } = event.detail
      
      if (badgeCount > 0) {
        setNewBadges(earnedBadges)
        setShowNotification(true)
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
          setShowNotification(false)
        }, 10000)
      }
    }

    window.addEventListener('badgesAwarded', handleBadgesAwarded as EventListener)
    
    return () => {
      window.removeEventListener('badgesAwarded', handleBadgesAwarded as EventListener)
    }
  }, [])

  const dismissNotification = useCallback(() => {
    setShowNotification(false)
    setNewBadges([])
  }, [])

  return {
    newBadges,
    showNotification,
    dismissNotification
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'Common': return 'text-gray-600 bg-gray-100 border-gray-300'
    case 'Rare': return 'text-blue-600 bg-blue-100 border-blue-300'
    case 'Epic': return 'text-purple-600 bg-purple-100 border-purple-300'
    case 'Legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300'
    default: return 'text-gray-600 bg-gray-100 border-gray-300'
  }
}

export function getRarityIcon(rarity: string): string {
  switch (rarity) {
    case 'Common': return '🥉'
    case 'Rare': return '🥈'
    case 'Epic': return '🥇'
    case 'Legendary': return '👑'
    default: return '🏅'
  }
}

export function formatBadgeCategory(category: string): string {
  return category.replace(/([A-Z])/g, ' $1').trim()
}