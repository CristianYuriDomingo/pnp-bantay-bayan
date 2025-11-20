// hooks/use-rank.ts - INSTANT DUOLINGO-STYLE with SMART CACHING ⚡
'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser } from './use-current-user'
import { useEffect } from 'react'
import { PNPRank, UserRankData } from '@/types/rank'
import { getRankInfo, getNextRank, isStarRank } from '@/lib/rank-config'

// ============================================================================
// FETCH FUNCTIONS with better error handling
// ============================================================================

async function fetchRankData(userId: string, userEmail?: string | null): Promise<UserRankData> {
  console.log(`Fetching rank data for user ${userEmail}`);
  
  const response = await fetch(`/api/users/${userId}/rank`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
  
  // Check if response is actually JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch rank data');
  }

  const data = result.data;
  
  // Security validation
  if (data.userId && data.userId !== userId) {
    console.error('Security violation: Received rank data for different user');
    throw new Error('Data integrity error - user mismatch');
  }
  
  const starIndicator = isStarRank(data.currentRank) ? '⭐' : '';
  console.log(
    `✅ User rank loaded: ${data.currentRank}${starIndicator} (#${data.leaderboardPosition}) | Base: ${data.baseRank}`
  );
  
  return data;
}

async function fetchRankProgress(userId: string, userEmail?: string | null): Promise<any> {
  console.log(`Fetching rank progress for user ${userEmail}`);
  
  const response = await fetch(`/api/users/${userId}/rank-progress`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch rank progress');
  }

  const data = result.data;
  
  if (data.type === 'sequential') {
    console.log(`✅ Learning progress: ${data.xpNeeded} XP to ${data.nextRank}`);
  } else if (data.type === 'star_rank') {
    console.log(`✅ Competitive progress: ${data.xpNeeded} XP to overtake ${data.targetUser}`);
  } else {
    console.log(`✅ Rank progress: ${data.message}`);
  }
  
  return data;
}

// ============================================================================
// REACT QUERY HOOKS - INSTANT + SMART CACHING ⚡
// ============================================================================

/**
 * Hook for getting current user's rank data (with dual-track support)
 * ⚡ INSTANT: Uses React Query for 0ms perceived delay
 * 💾 CACHED: Keeps data for 2 min for smooth navigation
 */
export function useUserRank() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const userId = user?.id;

  // Query for fetching rank data
  const { 
    data: rankData, 
    isLoading: loading, 
    error: queryError,
    refetch,
    isFetching // Shows background refetching
  } = useQuery({
    queryKey: ['userRank', userId],
    queryFn: () => fetchRankData(userId!, user?.email),
    enabled: !!userId,
    
    // ⚡ INSTANT MODE
    staleTime: 0, // Always refetch for latest data
    gcTime: 2 * 60 * 1000, // Keep in cache 2 min (for back button)
    
    // SMART REFETCHING
    refetchOnWindowFocus: true, // Update when user returns to tab
    refetchOnMount: true, // Always check on mount
    retry: 2,
  });

  // Real-time event listeners for instant cross-component updates
  useEffect(() => {
    if (!userId) return;

    const handleRankUpdate = () => {
      // Instant invalidation - refetches immediately
      queryClient.invalidateQueries({ 
        queryKey: ['userRank', userId],
        refetchType: 'active' // Only refetch if component is mounted
      });
      queryClient.invalidateQueries({ 
        queryKey: ['rankProgress', userId],
        refetchType: 'active'
      });
    };

    // Listen for XP and badge events
    window.addEventListener('xpGained', handleRankUpdate);
    window.addEventListener('badgesAwarded', handleRankUpdate);
    window.addEventListener('rankUpdated', handleRankUpdate);
    window.addEventListener('lessonCompleted', handleRankUpdate);
    
    return () => {
      window.removeEventListener('xpGained', handleRankUpdate);
      window.removeEventListener('badgesAwarded', handleRankUpdate);
      window.removeEventListener('rankUpdated', handleRankUpdate);
      window.removeEventListener('lessonCompleted', handleRankUpdate);
    };
  }, [queryClient, userId]);

  const error = queryError?.message || null;

  // Derived data
  const rankInfo = rankData ? getRankInfo(rankData.currentRank) : null;
  const baseRankInfo = rankData?.baseRank ? getRankInfo(rankData.baseRank) : null;
  const nextRank = rankData ? getNextRank(rankData.currentRank) : null;
  const nextRankInfo = nextRank ? getRankInfo(nextRank) : null;
  const isCurrentlyStarRank = rankData ? isStarRank(rankData.currentRank) : false;

  return {
    rankData: rankData || null,
    rankInfo,
    baseRankInfo,
    nextRank,
    nextRankInfo,
    isStarRank: isCurrentlyStarRank,
    loading,
    isFetching, // New: shows background refresh
    error,
    refresh: refetch
  };
}

/**
 * Hook for getting rank progress (XP to next rank) - UPDATED for dual-track
 * ⚡ INSTANT: Always fresh data
 * 💾 CACHED: Keeps data for 2 min for smooth navigation
 */
export function useRankProgress() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { 
    data: progress, 
    isLoading: loading, 
    error: queryError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['rankProgress', userId],
    queryFn: () => fetchRankProgress(userId!, user?.email),
    enabled: !!userId,
    
    staleTime: 0, // Always fresh
    gcTime: 2 * 60 * 1000, // Cache for 2 min
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  });

  // Real-time event listeners
  useEffect(() => {
    if (!userId) return;

    const handleProgressUpdate = () => {
      queryClient.invalidateQueries({ 
        queryKey: ['rankProgress', userId],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['userRank', userId],
        refetchType: 'active'
      });
    };

    window.addEventListener('xpGained', handleProgressUpdate);
    window.addEventListener('badgesAwarded', handleProgressUpdate);
    window.addEventListener('rankUpdated', handleProgressUpdate);
    window.addEventListener('lessonCompleted', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('xpGained', handleProgressUpdate);
      window.removeEventListener('badgesAwarded', handleProgressUpdate);
      window.removeEventListener('rankUpdated', handleProgressUpdate);
      window.removeEventListener('lessonCompleted', handleProgressUpdate);
    };
  }, [queryClient, userId]);

  const error = queryError?.message || null;

  return { 
    progress: progress || null, 
    loading,
    isFetching,
    error,
    refresh: refetch 
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Combined hook for both rank data and progress
 * Useful for components that need both
 */
export function useRankWithProgress() {
  const rankQuery = useUserRank();
  const progressQuery = useRankProgress();

  return {
    ...rankQuery,
    progress: progressQuery.progress,
    progressLoading: progressQuery.loading,
    progressError: progressQuery.error,
    refreshAll: async () => {
      await Promise.all([
        rankQuery.refresh(),
        progressQuery.refresh()
      ]);
    }
  };
}