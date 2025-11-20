// hooks/use-user-achievements.ts - WITH REACT QUERY CACHING
'use client'
import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentUserId } from './use-current-user'

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
  error: string | null;
  refetch: () => Promise<void>;
}

async function fetchAchievementsData(): Promise<Achievement[]> {
  const response = await fetch('/api/achievements', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch achievements')
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response')
  }

  const data = await response.json()
  
  if (!data.success || !data.achievements) {
    throw new Error('Invalid response format')
  }

  console.log(`✅ Loaded ${data.achievements.length} achievements`)
  
  return data.achievements
}

export function useUserAchievements(): UseUserAchievementsResult {
  const userId = useCurrentUserId()
  const queryClient = useQueryClient()
  
  const { 
    data: achievements = [], 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['userAchievements', userId],
    queryFn: fetchAchievementsData,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })

  useEffect(() => {
    const handleXPGained = () => {
      console.log('🎯 XP gained - invalidating achievements cache')
      queryClient.invalidateQueries({ queryKey: ['userAchievements'] })
    }

    const handleBadgesAwarded = () => {
      console.log('🏅 Badges awarded - invalidating achievements cache')
      queryClient.invalidateQueries({ queryKey: ['userAchievements'] })
    }

    window.addEventListener('xpGained', handleXPGained)
    window.addEventListener('badgesAwarded', handleBadgesAwarded)

    return () => {
      window.removeEventListener('xpGained', handleXPGained)
      window.removeEventListener('badgesAwarded', handleBadgesAwarded)
    }
  }, [queryClient])

  const error = queryError?.message || null

  return {
    achievements,
    loading,
    error,
    refetch: async () => {
      await refetch()
    },
  }
}