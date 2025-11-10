//hooks/use-rank.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useCurrentUser } from './use-current-user'
import { PNPRank, UserRankData } from '@/types/rank'
import { getRankInfo, getNextRank, isStarRank } from '@/lib/rank-config'

function createCacheBustingFetch(url: string, options: RequestInit = {}) {
  const separator = url.includes('?') ? '&' : '?'
  const cacheBustingUrl = `${url}${separator}t=${Date.now()}`
  
  return fetch(cacheBustingUrl, {
    ...options,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...options.headers,
    },
  })
}

/**
 * Hook for getting current user's rank data (with dual-track support)
 */
export function useUserRank() {
  const { user } = useCurrentUser()
  const [rankData, setRankData] = useState<UserRankData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchRankData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await createCacheBustingFetch(`/api/leaderboard/user`)
      const result = await response.json()

      if (result.success) {
        // ✅ Check if user is admin
        if (result.data.isAdmin) {
          setIsAdmin(true)
          setRankData(null)
          console.log('👤 Admin user detected - excluded from rankings')
        } else {
          setIsAdmin(false)
          setRankData(result.data)
          const starIndicator = isStarRank(result.data.pnpRank) ? '⭐' : ''
          console.log(
            `✅ User rank loaded: ${result.data.pnpRank}${starIndicator} (#${result.data.rank}) | Base: ${result.data.baseRank}`
          )
        }
      } else {
        setError(result.error || 'Failed to fetch rank data')
      }
    } catch (err) {
      console.error('❌ Error fetching rank data:', err)
      setError('Failed to fetch rank data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchRankData()
  }, [fetchRankData])

  // Refresh on XP/badge events
  useEffect(() => {
    window.addEventListener('xpGained', fetchRankData)
    window.addEventListener('badgesAwarded', fetchRankData)
    
    return () => {
      window.removeEventListener('xpGained', fetchRankData)
      window.removeEventListener('badgesAwarded', fetchRankData)
    }
  }, [fetchRankData])

  const rankInfo = rankData ? getRankInfo(rankData.pnpRank) : null
  const baseRankInfo = rankData?.baseRank ? getRankInfo(rankData.baseRank) : null
  const nextRank = rankData ? getNextRank(rankData.pnpRank) : null
  const nextRankInfo = nextRank ? getRankInfo(nextRank) : null
  const isCurrentlyStarRank = rankData ? isStarRank(rankData.pnpRank) : false

  return {
    rankData,
    rankInfo,
    baseRankInfo,
    nextRank,
    nextRankInfo,
    isStarRank: isCurrentlyStarRank,
    isAdmin, // ✅ NEW: Flag to indicate admin user
    loading,
    error,
    refresh: fetchRankData
  }
}

/**
 * Hook for getting rank progress (XP to next rank) - UPDATED for dual-track
 */
export function useRankProgress() {
  const { user } = useCurrentUser()
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await createCacheBustingFetch(`/api/users/${user.id}/rank-progress`)
      const result = await response.json()

      if (result.success) {
        setProgress(result.data)
        
        if (result.data.type === 'sequential') {
          console.log(`✅ Learning progress: ${result.data.xpNeeded} XP to ${result.data.nextRank}`)
        } else if (result.data.type === 'star_rank') {
          console.log(`✅ Competitive progress: ${result.data.xpNeeded} XP to overtake ${result.data.targetUser}`)
        } else {
          console.log(`✅ Rank progress: ${result.data.message}`)
        }
      } else {
        setError(result.error || 'Failed to fetch rank progress')
      }
    } catch (err) {
      console.error('❌ Error fetching rank progress:', err)
      setError('Failed to fetch rank progress')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  // Refresh on XP/badge events
  useEffect(() => {
    window.addEventListener('xpGained', fetchProgress)
    window.addEventListener('badgesAwarded', fetchProgress)
    
    return () => {
      window.removeEventListener('xpGained', fetchProgress)
      window.removeEventListener('badgesAwarded', fetchProgress)
    }
  }, [fetchProgress])

  return { 
    progress, 
    loading, 
    error,
    refresh: fetchProgress 
  }
}