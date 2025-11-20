// hooks/use-leaderboard.ts - INSTANT DUOLINGO-STYLE with SMART CACHING ⚡
'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser } from './use-current-user'
import { useEffect } from 'react'
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

// ============================================================================
// FETCH FUNCTIONS with better error handling
// ============================================================================

async function fetchLeaderboardData(
  limit: number, 
  page: number, 
  forceRefresh: boolean = false
): Promise<LeaderboardResponse> {
  const url = `/api/leaderboard?limit=${limit}&page=${page}${forceRefresh ? '&refresh=true' : ''}`;
  console.log(`📊 Fetching leaderboard: ${url}`);
  
  const response = await fetch(url);
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch leaderboard');
  }

  const data: LeaderboardResponse = result.data;
  
  // Convert date strings to Date objects
  const processedLeaderboard = data.leaderboard.map(entry => ({
    ...entry,
    createdAt: new Date(entry.createdAt)
  }));
  
  const processedCurrentUser = data.currentUser ? {
    ...data.currentUser,
    createdAt: new Date(data.currentUser.createdAt)
  } : null;
  
  console.log(`✅ Leaderboard loaded: ${processedLeaderboard.length} entries, current user rank: ${processedCurrentUser?.rank || 'N/A'}`);
  
  return {
    leaderboard: processedLeaderboard,
    currentUser: processedCurrentUser,
    stats: {
      ...data.stats,
      lastUpdated: new Date(data.stats.lastUpdated)
    },
    pagination: data.pagination
  };
}

async function fetchUserRankData(userId: string, userEmail?: string | null): Promise<UserRankInfo> {
  console.log(`Fetching user rank info for ${userEmail}`);
  
  const response = await fetch('/api/leaderboard/user');
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch user rank');
  }

  console.log(`✅ User rank loaded for ${userEmail}: #${result.data.rank}, Level ${result.data.level}, Badges ${result.data.earnedBadges}/${result.data.totalBadges}`);
  
  return result.data;
}

// ============================================================================
// REACT QUERY HOOKS - INSTANT + SMART CACHING ⚡
// ============================================================================

/**
 * Hook for leaderboard data with instant updates and smart caching
 * ⚡ INSTANT: Updates immediately on XP/badge events
 * 💾 CACHED: Keeps data for 5 min, refetches when stale
 */
export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const { limit = 25, page = 1, autoRefresh = false } = options;
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  
  const { 
    data, 
    isLoading: loading, 
    error: queryError,
    refetch,
    isFetching,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['leaderboard', limit, page],
    queryFn: () => fetchLeaderboardData(limit, page),
    
    // ⚡ INSTANT MODE - but longer cache for leaderboard
    staleTime: 2 * 60 * 1000, // 2 minutes - leaderboard changes less frequently
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    
    // SMART REFETCHING
    refetchOnWindowFocus: true, // Update when user returns
    refetchOnMount: true,
    retry: 1,
  });

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing leaderboard...');
      queryClient.invalidateQueries({ 
        queryKey: ['leaderboard'],
        refetchType: 'active'
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, queryClient]);

  // Real-time event listeners for instant cross-component updates
  useEffect(() => {
    const handleLeaderboardUpdate = () => {
      console.log('💎 Leaderboard event detected, invalidating cache...');
      // Instant invalidation - refetches immediately
      queryClient.invalidateQueries({ 
        queryKey: ['leaderboard'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['userRank'],
        refetchType: 'active'
      });
    };

    // Listen for events that affect leaderboard
    window.addEventListener('xpGained', handleLeaderboardUpdate);
    window.addEventListener('badgesAwarded', handleLeaderboardUpdate);
    window.addEventListener('lessonCompleted', handleLeaderboardUpdate);
    window.addEventListener('rankUpdated', handleLeaderboardUpdate);
    
    return () => {
      window.removeEventListener('xpGained', handleLeaderboardUpdate);
      window.removeEventListener('badgesAwarded', handleLeaderboardUpdate);
      window.removeEventListener('lessonCompleted', handleLeaderboardUpdate);
      window.removeEventListener('rankUpdated', handleLeaderboardUpdate);
    };
  }, [queryClient]);

  const error = queryError?.message || null;
  const leaderboard = data?.leaderboard || [];
  const currentUserEntry = data?.currentUser || null;
  const stats = data?.stats || null;
  const pagination = data?.pagination || {
    page: 1,
    limit: 25,
    total: 0,
    hasMore: false
  };
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const refresh = async () => {
    console.log('🔄 Manual refresh triggered...');
    await refetch();
  };

  return {
    leaderboard,
    currentUserEntry,
    stats,
    pagination,
    loading,
    isFetching, // New: shows background refresh
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for getting detailed current user rank info
 * ⚡ INSTANT: Always fresh data for user's own rank
 * 💾 CACHED: Keeps data for 2 min for smooth navigation
 */
export function useUserRank() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const userId = user?.id;
  
  const { 
    data: rankInfo, 
    isLoading: loading, 
    error: queryError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['userRank', userId],
    queryFn: () => fetchUserRankData(userId!, user?.email),
    enabled: !!userId,
    
    // ⚡ INSTANT MODE
    staleTime: 0, // Always refetch for latest data
    gcTime: 2 * 60 * 1000, // Keep in cache 2 min
    
    // SMART REFETCHING
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  });

  // Real-time event listeners for instant updates
  useEffect(() => {
    if (!userId) return;

    const handleRankUpdate = () => {
      console.log('💎 Rank event detected, invalidating user rank cache...');
      queryClient.invalidateQueries({ 
        queryKey: ['userRank', userId],
        refetchType: 'active'
      });
    };

    window.addEventListener('xpGained', handleRankUpdate);
    window.addEventListener('badgesAwarded', handleRankUpdate);
    window.addEventListener('lessonCompleted', handleRankUpdate);
    window.addEventListener('rankUpdated', handleRankUpdate);
    
    return () => {
      window.removeEventListener('xpGained', handleRankUpdate);
      window.removeEventListener('badgesAwarded', handleRankUpdate);
      window.removeEventListener('lessonCompleted', handleRankUpdate);
      window.removeEventListener('rankUpdated', handleRankUpdate);
    };
  }, [queryClient, userId]);

  const error = queryError?.message || null;

  return {
    rankInfo: rankInfo || null,
    loading,
    isFetching, // New: shows background refresh
    error,
    refresh: refetch
  };
}