// hooks/use-user-achievements.ts - INSTANT DUOLINGO-STYLE with SMART CACHING ⚡
'use client'
import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentUserId, useCurrentUser } from './use-current-user'

export interface AchievementProgress {
  current: number;
  target: number;
  percentage: number;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  type: string;
  xpReward: number;
  isUnlocked: boolean;
  earnedAt: Date | null;
  xpAwarded: number;
  progress?: AchievementProgress;
  criteriaData?: any;
}

interface UseUserAchievementsResult {
  achievements: Achievement[];
  loading: boolean;
  isFetching: boolean; // Shows background refresh
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// FETCH FUNCTION with better error handling
// ============================================================================

async function fetchAchievementsData(userId: string, userEmail?: string | null): Promise<Achievement[]> {
  console.log(`Fetching achievements for user ${userEmail}`);
  
  const response = await fetch('/api/achievements', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch achievements: ${response.status}`)
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response')
  }

  const data = await response.json()
  
  if (!data.success || !data.achievements) {
    throw new Error(data.error || 'Invalid response format')
  }

  console.log(`✅ Loaded ${data.achievements.length} achievements for ${userEmail} (${data.achievements.filter((a: Achievement) => a.isUnlocked).length} unlocked)`)
  
  return data.achievements
}

// ============================================================================
// REACT QUERY HOOK - INSTANT + SMART CACHING ⚡
// ============================================================================

/**
 * Hook to get user achievements with instant updates
 * ⚡ INSTANT: Always fresh data on important events
 * 💾 CACHED: Keeps data for 5 min for smooth navigation
 */
export function useUserAchievements(): UseUserAchievementsResult {
  const userId = useCurrentUserId()
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()
  
  const { 
    data: achievements = [], 
    isLoading: loading,
    isFetching, // Shows background refetching
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['userAchievements', userId],
    queryFn: () => fetchAchievementsData(userId!, user?.email),
    enabled: !!userId,
    
    // ⚡ SMART CACHING
    staleTime: 0, // Always refetch for latest achievements
    gcTime: 5 * 60 * 1000, // Keep in cache 5 min
    
    // SMART REFETCHING
    refetchOnWindowFocus: true, // Update when user returns to tab
    refetchOnMount: true, // Always check on mount
    retry: 2,
  })

  // Real-time event listeners for instant cross-component updates
  useEffect(() => {
    if (!userId) return

    const handleXPGained = () => {
      console.log('🎯 XP gained - checking achievements instantly')
      queryClient.invalidateQueries({ 
        queryKey: ['userAchievements', userId],
        refetchType: 'active' // Only refetch if component is mounted
      })
    }

    const handleBadgesAwarded = (event: Event) => {
      const detail = (event as CustomEvent).detail
      console.log('🏅 Badges awarded - refreshing achievements instantly')
      
      // Invalidate achievements to show new unlocks
      queryClient.invalidateQueries({ 
        queryKey: ['userAchievements', userId],
        refetchType: 'active'
      })
      
      // If we got new achievement data, dispatch notifications
      if (detail?.newBadges && detail.newBadges.length > 0) {
        detail.newBadges.forEach((achievement: Achievement) => {
          console.log('🎉 Dispatching achievement notification:', achievement.name)
          window.dispatchEvent(new CustomEvent('achievementUnlocked', {
            detail: achievement
          }))
        })
      }
    }

    const handleLessonCompleted = () => {
      console.log('📚 Lesson completed - checking achievements')
      queryClient.invalidateQueries({ 
        queryKey: ['userAchievements', userId],
        refetchType: 'active'
      })
    }

    const handleProgressRefresh = () => {
      console.log('🔄 Progress refresh - checking achievements')
      queryClient.invalidateQueries({ 
        queryKey: ['userAchievements', userId],
        refetchType: 'active'
      })
    }

    // Listen to all relevant events
    window.addEventListener('xpGained', handleXPGained)
    window.addEventListener('badgesAwarded', handleBadgesAwarded as EventListener)
    window.addEventListener('lessonCompleted', handleLessonCompleted)
    window.addEventListener('progressRefresh', handleProgressRefresh)

    return () => {
      window.removeEventListener('xpGained', handleXPGained)
      window.removeEventListener('badgesAwarded', handleBadgesAwarded as EventListener)
      window.removeEventListener('lessonCompleted', handleLessonCompleted)
      window.removeEventListener('progressRefresh', handleProgressRefresh)
    }
  }, [queryClient, userId])

  const error = queryError?.message || null

  return {
    achievements,
    loading,
    isFetching, // New: shows background refresh
    error,
    refetch: async () => {
      await refetch()
    },
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get unlocked achievements count
 */
export function getUnlockedCount(achievements: Achievement[]): number {
  return achievements.filter(a => a.isUnlocked).length
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(achievements: Achievement[], category: string): Achievement[] {
  return achievements.filter(a => a.category === category)
}

/**
 * Get total XP earned from achievements
 */
export function getTotalAchievementXP(achievements: Achievement[]): number {
  return achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.xpAwarded, 0)
}

/**
 * Get achievement completion percentage
 */
export function getAchievementCompletionPercentage(achievements: Achievement[]): number {
  if (achievements.length === 0) return 0
  const unlocked = getUnlockedCount(achievements)
  return Math.round((unlocked / achievements.length) * 100)
}