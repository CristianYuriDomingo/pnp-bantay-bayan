// hooks/use-user-achievements.ts - WITH PROGRESS DATA

import { useState, useEffect } from 'react';

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
  progress?: AchievementProgress; // Add progress tracking
  criteriaData?: any; // Include criteriaData for badge type filtering
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

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/achievements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const data = await response.json();
      
      if (data.success && data.achievements) {
        setAchievements(data.achievements);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  return {
    achievements,
    loading,
    error,
    refetch: fetchAchievements,
  };
}