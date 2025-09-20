// src/hooks/use-all-badges.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useCurrentUserId, useCurrentUser } from './use-current-user'

export interface BadgeWithProgress {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_complete' | 'manual';
  triggerValue: string;
  prerequisites?: string[];
  earnedAt: Date | null;
  isEarned: boolean;
  createdAt: Date;
  updatedAt: Date;
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

// Helper function for cache-busting
function createCacheBustingFetch(url: string, options: RequestInit = {}) {
  const separator = url.includes('?') ? '&' : '?';
  const cacheBustingUrl = `${url}${separator}t=${Date.now()}&u=${Math.random()}`;
  
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

/**
 * Hook to get all badges with user progress (earned/unearned)
 */
export function useAllBadges() {
  const [badges, setBadges] = useState<BadgeWithProgress[]>([]);
  const [statistics, setStatistics] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();

  const fetchAllBadges = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching all badges for user ${user?.email}`);
      
      const response = await createCacheBustingFetch('/api/users/badges/public');
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        
        // Security check: Verify the data belongs to current user
        if (data.userId !== userId) {
          console.error('Security violation: Received badge data for different user');
          console.error(`Expected userId: ${userId}, Received: ${data.userId}`);
          setError('Data integrity error - user mismatch');
          return;
        }
        
        // Convert dates
        const badgesWithDates = data.badges.map((badge: any) => ({
          ...badge,
          earnedAt: badge.earnedAt ? new Date(badge.earnedAt) : null,
          createdAt: new Date(badge.createdAt),
          updatedAt: new Date(badge.updatedAt)
        }));
        
        setBadges(badgesWithDates);
        setStatistics(data.statistics);
        
        console.log(`All badges loaded for ${user?.email}: ${data.badges.length} total badges, ${data.statistics.totalEarned} earned`);
      } else {
        setError(result.error || 'Failed to fetch badges');
      }
    } catch (err) {
      console.error('Error fetching all badges:', err);
      setError('Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  }, [userId, user?.email]);

  useEffect(() => {
    fetchAllBadges();
  }, [fetchAllBadges]);

  // Listen for badge awards and refresh
  useEffect(() => {
    const handleBadgesAwarded = () => {
      console.log('Badge awarded event detected, refreshing badge collection...');
      fetchAllBadges();
    };

    window.addEventListener('badgesAwarded', handleBadgesAwarded);
    
    return () => {
      window.removeEventListener('badgesAwarded', handleBadgesAwarded);
    };
  }, [fetchAllBadges]);

  return {
    badges,
    statistics,
    loading,
    error,
    refetch: fetchAllBadges
  };
}

/**
 * Utility functions for badge filtering and sorting
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

export function filterBadgesByEarned(badges: BadgeWithProgress[], earnedOnly = false) {
  return earnedOnly ? badges.filter(b => b.isEarned) : badges;
}

export function filterBadgesByRarity(badges: BadgeWithProgress[], rarity?: string) {
  return rarity ? badges.filter(b => b.rarity === rarity) : badges;
}