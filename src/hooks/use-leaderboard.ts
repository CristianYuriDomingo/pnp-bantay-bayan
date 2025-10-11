// hooks/use-leaderboard.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useCurrentUser } from './use-current-user'
import { 
  LeaderboardEntry, 
  LeaderboardStats, 
  LeaderboardResponse,
  LeaderboardPaginationLimit,
  UserRankInfo 
} from '@/types/leaderboard'

interface UseLeaderboardOptions {
  limit?: LeaderboardPaginationLimit;
  page?: number;
  autoRefresh?: boolean; // Auto-refresh every 5 minutes
}

function createCacheBustingFetch(url: string, options: RequestInit = {}) {
  const separator = url.includes('?') ? '&' : '?';
  const cacheBustingUrl = `${url}${separator}t=${Date.now()}`;
  
  return fetch(cacheBustingUrl, {
    ...options,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...options.headers,
    },
  });
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const { limit = 25, page = 1, autoRefresh = false } = options
  const { user } = useCurrentUser()
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null)
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    hasMore: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchLeaderboard = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const url = `/api/leaderboard?limit=${limit}&page=${page}${forceRefresh ? '&refresh=true' : ''}`
      console.log(`📊 Fetching leaderboard: ${url}`)
      
      const response = await createCacheBustingFetch(url)
      const result = await response.json()

      if (result.success) {
        const data: LeaderboardResponse = result.data
        
        // Convert date strings to Date objects
        const processedLeaderboard = data.leaderboard.map(entry => ({
          ...entry,
          createdAt: new Date(entry.createdAt)
        }))
        
        const processedCurrentUser = data.currentUser ? {
          ...data.currentUser,
          createdAt: new Date(data.currentUser.createdAt)
        } : null
        
        setLeaderboard(processedLeaderboard)
        setCurrentUserEntry(processedCurrentUser)
        setStats({
          ...data.stats,
          lastUpdated: new Date(data.stats.lastUpdated)
        })
        setPagination(data.pagination)
        setLastUpdated(new Date())
        
        console.log(`✅ Leaderboard loaded: ${processedLeaderboard.length} entries, current user rank: ${processedCurrentUser?.rank || 'N/A'}`)
      } else {
        setError(result.error || 'Failed to fetch leaderboard')
      }
    } catch (err) {
      console.error('❌ Error fetching leaderboard:', err)
      setError('Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }, [limit, page])

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing leaderboard...')
      fetchLeaderboard()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [autoRefresh, fetchLeaderboard])

  // Listen for XP gain events to refresh leaderboard
  useEffect(() => {
    const handleXPGain = () => {
      console.log('💎 XP gain detected, refreshing leaderboard...')
      fetchLeaderboard(true)
    }

    window.addEventListener('xpGained', handleXPGain)
    window.addEventListener('badgesAwarded', handleXPGain)
    
    return () => {
      window.removeEventListener('xpGained', handleXPGain)
      window.removeEventListener('badgesAwarded', handleXPGain)
    }
  }, [fetchLeaderboard])

  const refresh = useCallback(() => {
    fetchLeaderboard(true)
  }, [fetchLeaderboard])

  return {
    leaderboard,
    currentUserEntry,
    stats,
    pagination,
    loading,
    error,
    lastUpdated,
    refresh
  }
}

/**
 * Hook for getting detailed current user rank info
 */
export function useUserRank() {
  const { user } = useCurrentUser()
  const [rankInfo, setRankInfo] = useState<UserRankInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserRank = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await createCacheBustingFetch('/api/leaderboard/user')
      const result = await response.json()

      if (result.success) {
        setRankInfo(result.data)
        console.log(`✅ User rank loaded: #${result.data.rank}, Level ${result.data.level}`)
      } else {
        setError(result.error || 'Failed to fetch user rank')
      }
    } catch (err) {
      console.error('❌ Error fetching user rank:', err)
      setError('Failed to fetch user rank')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchUserRank()
  }, [fetchUserRank])

  // Refresh on XP/badge events
  useEffect(() => {
    window.addEventListener('xpGained', fetchUserRank)
    window.addEventListener('badgesAwarded', fetchUserRank)
    
    return () => {
      window.removeEventListener('xpGained', fetchUserRank)
      window.removeEventListener('badgesAwarded', fetchUserRank)
    }
  }, [fetchUserRank])

  return {
    rankInfo,
    loading,
    error,
    refresh: fetchUserRank
  }
}