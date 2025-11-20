// src/hooks/use-all-badges.ts - WITH REACT QUERY CACHING
'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentUserId, useCurrentUser } from './use-current-user'
import { useEffect } from 'react'

export interface BadgeWithProgress {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_mastery' | 'parent_quiz_mastery' | 'manual';
  triggerValue: string;
  prerequisites?: string[];
  earnedAt: Date | null;
  isEarned: boolean;
  createdAt: Date;
  updatedAt: Date;
  xpValue: number;
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
  latestBadge: BadgeWithProgress | null;
}

interface BadgeResponse {
  badges: BadgeWithProgress[];
  statistics: BadgeStats;
  userId: string;
}

// ============================================================================
// FETCH FUNCTION
// ============================================================================

async function fetchAllBadgesData(userId: string, userEmail?: string | null): Promise<BadgeResponse> {
  console.log(`Fetching all badges for user ${userEmail}`);
  
  const response = await fetch('/api/users/badges/public');
  
  // Check if response is actually JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch badges');
  }

  const data = result.data;
  
  // Security check: Verify the data belongs to current user
  if (data.userId !== userId) {
    console.error('Security violation: Received badge data for different user');
    console.error(`Expected userId: ${userId}, Received: ${data.userId}`);
    throw new Error('Data integrity error - user mismatch');
  }
  
  // Convert dates
  const badgesWithDates = data.badges.map((badge: any) => ({
    ...badge,
    earnedAt: badge.earnedAt ? new Date(badge.earnedAt) : null,
    createdAt: new Date(badge.createdAt),
    updatedAt: new Date(badge.updatedAt)
  }));
  
  console.log(`All badges loaded for ${userEmail}: ${data.badges.length} total badges, ${data.statistics.totalEarned} earned`);
  
  return {
    badges: badgesWithDates,
    statistics: data.statistics,
    userId: data.userId
  };
}

// ============================================================================
// REACT QUERY HOOK
// ============================================================================

/**
 * Hook to get all badges with user progress (earned/unearned) - WITH CACHING
 */
export function useAllBadges() {
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const { 
    data, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['allBadges', userId],
    queryFn: () => fetchAllBadgesData(userId!, user?.email),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds - very short for instant updates
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Listen for badge awards and invalidate cache
  useEffect(() => {
    const handleBadgesAwarded = (event: Event) => {
      console.log('Badge awarded event detected, invalidating badge cache...');
      
      // Invalidate immediately (no delay)
      queryClient.invalidateQueries({ queryKey: ['allBadges', userId] });
      
      // Also invalidate progress queries since badges are tied to progress
      queryClient.invalidateQueries({ queryKey: ['overallProgress', userId] });
    };

    const handleProgressRefresh = () => {
      console.log('Progress refresh detected, invalidating badge cache...');
      queryClient.invalidateQueries({ queryKey: ['allBadges', userId] });
    };

    window.addEventListener('badgesAwarded', handleBadgesAwarded);
    window.addEventListener('progressRefresh', handleProgressRefresh);
    
    return () => {
      window.removeEventListener('badgesAwarded', handleBadgesAwarded);
      window.removeEventListener('progressRefresh', handleProgressRefresh);
    };
  }, [queryClient, userId]);

  const error = queryError?.message || null;
  const badges = data?.badges || [];
  const statistics = data?.statistics || null;

  return {
    badges,
    statistics,
    loading,
    error,
    refetch
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Group badges by category with sorting
 */
export function groupBadgesByCategory(badges: BadgeWithProgress[]) {
  const categoryMap = new Map<string, BadgeWithProgress[]>();
  
  badges.forEach(badge => {
    if (!categoryMap.has(badge.category)) {
      categoryMap.set(badge.category, []);
    }
    categoryMap.get(badge.category)?.push(badge);
  });

  return Array.from(categoryMap.entries()).map(([name, categoryBadges]) => ({
    name,
    badges: categoryBadges.sort((a, b) => {
      // Sort earned badges first, then by rarity
      if (a.isEarned !== b.isEarned) {
        return b.isEarned ? 1 : -1;
      }
      
      const rarityOrder = { 'Legendary': 0, 'Epic': 1, 'Rare': 2, 'Common': 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    }),
    earnedCount: categoryBadges.filter(b => b.isEarned).length,
    totalCount: categoryBadges.length
  }));
}

/**
 * Filter badges by earned status
 */
export function filterBadgesByEarned(badges: BadgeWithProgress[], earnedOnly = false) {
  return earnedOnly ? badges.filter(b => b.isEarned) : badges;
}

/**
 * Filter badges by rarity
 */
export function filterBadgesByRarity(badges: BadgeWithProgress[], rarity?: string) {
  return rarity ? badges.filter(b => b.rarity === rarity) : badges;
}