// src/hooks/use-user-badges.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
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
 * Hook to manage user badges
 */
export function useUserBadges() {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [statistics, setStatistics] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();

  const fetchUserBadges = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching badges for user ${user?.email}`);
      
      const response = await createCacheBustingFetch('/api/users/badges');
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
        
        setBadges(data.badges.map((badge: any) => ({
          ...badge,
          earnedAt: new Date(badge.earnedAt)
        })));
        
        setStatistics(data.statistics);
        
        console.log(`Badge data loaded for ${user?.email}: ${data.badges.length} badges earned`);
      } else {
        setError(result.error || 'Failed to fetch badges');
      }
    } catch (err) {
      console.error('Error fetching user badges:', err);
      setError('Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  }, [userId, user?.email]);

  useEffect(() => {
    fetchUserBadges();
  }, [fetchUserBadges]);

  return {
    badges,
    statistics,
    loading,
    error,
    refetch: fetchUserBadges
  };
}

/**
 * Hook to trigger badge awards (called after lesson completion)
 */
export function useBadgeAwarding() {
  const [awarding, setAwarding] = useState(false);
  const [lastAwardResult, setLastAwardResult] = useState<BadgeAwardResult | null>(null);
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();

  const awardBadges = useCallback(async (lessonId: string, moduleId: string): Promise<BadgeAwardResult | null> => {
    if (!userId || awarding) return null;

    try {
      setAwarding(true);
      
      console.log(`Checking badge awards for user ${user?.email}: lesson ${lessonId}`);
      
      const response = await createCacheBustingFetch('/api/users/badges/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          moduleId,
          type: 'lesson'
        }),
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        
        // Security check
        if (data.userId !== userId) {
          console.error('Security violation in badge award response');
          return null;
        }
        
        const awardResult: BadgeAwardResult = {
          newBadges: data.newBadges.map((badge: any) => ({
            ...badge,
            earnedAt: new Date(badge.earnedAt)
          })),
          badgeCount: data.badgeCount,
          success: data.success
        };
        
        setLastAwardResult(awardResult);
        
        if (awardResult.badgeCount > 0) {
          console.log(`Badge awards for ${user?.email}: ${awardResult.badgeCount} new badges!`);
          
          // Dispatch event for other components to listen
          window.dispatchEvent(new CustomEvent('badgesAwarded', {
            detail: {
              userId: userId,
              newBadges: awardResult.newBadges,
              badgeCount: awardResult.badgeCount
            }
          }));
        }
        
        return awardResult;
      } else {
        console.error('Badge award failed:', result.error);
        return null;
      }
    } catch (err) {
      console.error('Error awarding badges:', err);
      return null;
    } finally {
      setAwarding(false);
    }
  }, [userId, user?.email, awarding]);

  return {
    awardBadges,
    awarding,
    lastAwardResult
  };
}

/**
 * Hook for badge notifications (to show newly earned badges to user)
 */
export function useBadgeNotifications() {
  const [newBadges, setNewBadges] = useState<UserBadge[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleBadgesAwarded = (event: CustomEvent) => {
      const { newBadges: earnedBadges, badgeCount } = event.detail;
      
      if (badgeCount > 0) {
        setNewBadges(earnedBadges);
        setShowNotification(true);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 10000);
      }
    };

    window.addEventListener('badgesAwarded', handleBadgesAwarded as EventListener);
    
    return () => {
      window.removeEventListener('badgesAwarded', handleBadgesAwarded as EventListener);
    };
  }, []);

  const dismissNotification = useCallback(() => {
    setShowNotification(false);
    setNewBadges([]);
  }, []);

  return {
    newBadges,
    showNotification,
    dismissNotification
  };
}

/**
 * Utility functions for badge display
 */
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'Common': return 'text-gray-600 bg-gray-100 border-gray-300';
    case 'Rare': return 'text-blue-600 bg-blue-100 border-blue-300';
    case 'Epic': return 'text-purple-600 bg-purple-100 border-purple-300';
    case 'Legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    default: return 'text-gray-600 bg-gray-100 border-gray-300';
  }
}

export function getRarityIcon(rarity: string): string {
  switch (rarity) {
    case 'Common': return '🥉';
    case 'Rare': return '🥈';
    case 'Epic': return '🥇';
    case 'Legendary': return '👑';
    default: return '🏅';
  }
}

export function formatBadgeCategory(category: string): string {
  return category.replace(/([A-Z])/g, ' $1').trim();
}