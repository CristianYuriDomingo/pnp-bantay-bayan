// hooks/use-leaderboard.ts - WITH REACT QUERY CACHING
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
// FETCH FUNCTIONS
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

async function fetchUserRankData(userId: string | null): Promise<UserRankInfo> {
  if (!userId) {
    throw new Error('User ID required');
  }

  const response = await fetch('/api/leaderboard/user');
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch user rank');
  }

  console.log(`✅ User rank loaded: #${result.data.rank}, Level ${result.data.level}`);
  
  return result.data;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Hook for leaderboard data with caching and auto-refresh
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
    dataUpdatedAt
  } = useQuery({
    queryKey: ['leaderboard', limit, page],
    queryFn: () => fetchLeaderboardData(limit, page),
    staleTime: 3 * 60 * 1000, // 3 minutes - leaderboard changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing leaderboard...');
      refetch();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Listen for XP gain events to refresh leaderboard
  useEffect(() => {
    const handleXPGain = () => {
      console.log('💎 XP gain detected, invalidating leaderboard cache...');
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['userRank'] });
    };

    window.addEventListener('xpGained', handleXPGain);
    window.addEventListener('badgesAwarded', handleXPGain);
    
    return () => {
      window.removeEventListener('xpGained', handleXPGain);
      window.removeEventListener('badgesAwarded', handleXPGain);
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
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for getting detailed current user rank info - WITH CACHING
 */
export function useUserRank() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  
  const { 
    data: rankInfo, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['userRank', user?.id],
    queryFn: () => fetchUserRankData(user?.id || null),
    enabled: !!user,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Refresh on XP/badge events
  useEffect(() => {
    const handleXPGain = () => {
      console.log('💎 XP gain detected, invalidating user rank cache...');
      queryClient.invalidateQueries({ queryKey: ['userRank'] });
    };

    window.addEventListener('xpGained', handleXPGain);
    window.addEventListener('badgesAwarded', handleXPGain);
    
    return () => {
      window.removeEventListener('xpGained', handleXPGain);
      window.removeEventListener('badgesAwarded', handleXPGain);
    };
  }, [queryClient]);

  const error = queryError?.message || null;

  return {
    rankInfo: rankInfo || null,
    loading,
    error,
    refresh: refetch
  };
}