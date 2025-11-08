// hooks/use-user-achievements.ts - ENHANCED WITH AUTO-VERIFICATION

import { useState, useEffect, useCallback } from 'react';

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

export function useUserAchievements(): UseUserAchievementsResult {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/achievements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const data = await response.json();
      
      if (data.success && data.achievements) {
        setAchievements(data.achievements);
        console.log(`✅ Loaded ${data.achievements.length} achievements`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Error fetching achievements:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Listen for XP gain events to refetch achievements
  useEffect(() => {
    const handleXPGained = () => {
      console.log('🎯 XP gained - refreshing achievements');
      fetchAchievements();
    };

    const handleBadgesAwarded = () => {
      console.log('🏅 Badges awarded - refreshing achievements');
      fetchAchievements();
    };

    window.addEventListener('xpGained', handleXPGained);
    window.addEventListener('badgesAwarded', handleBadgesAwarded);

    return () => {
      window.removeEventListener('xpGained', handleXPGained);
      window.removeEventListener('badgesAwarded', handleBadgesAwarded);
    };
  }, [fetchAchievements]);

  return {
    achievements,
    loading,
    error,
    refetch: fetchAchievements,
  };
}