// hooks/use-progress.ts - Enhanced user-specific progress tracking hooks
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useCurrentUserId, useCurrentUser } from './use-current-user'

export interface LessonProgress {
  completed: boolean;
  progress: number;
  timeSpent: number;
  completedAt?: Date;
  userId?: string; // 🔒 User verification
}

export interface ModuleProgress {
  moduleId: string;
  title: string;
  image?: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  completed: boolean;
  completedAt?: Date;
  userId?: string; // 🔒 User verification
  userEmail?: string; // 🔒 User verification
  lessons: LessonDetail[];
}

export interface LessonDetail {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  progress: number;
  timeSpent: number;
  completedAt?: Date;
}

export interface OverallProgress {
  userId: string; // 🔒 User verification
  userEmail: string; // 🔒 User verification
  moduleProgress: { [key: string]: any };
  lessonProgress: { [key: string]: any };
  statistics: {
    totalModules: number;
    completedModules: number;
    overallProgress: number;
    totalLessons: number;
    completedLessons: number;
  };
}

/**
 * Hook to get and update progress for a specific lesson - USER SPECIFIC
 */
export function useLessonProgress(lessonId: string) {
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();

  const fetchLessonProgress = useCallback(async () => {
    if (!userId || !lessonId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Fetching lesson progress for user ${user?.email}: lesson ${lessonId}`)
      
      const response = await fetch(`/api/users/progress/lesson/${lessonId}`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        
        // 🔒 SECURITY CHECK: Verify the data belongs to current user
        if (data.userId && data.userId !== userId) {
          console.error('⚠️ Security violation: Received progress data for different user');
          setError('Data integrity error');
          return;
        }
        
        setLessonProgress({
          completed: data.completed,
          progress: data.progress,
          timeSpent: data.timeSpent,
          completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
          userId: data.userId
        });
        
        console.log(`✅ Lesson progress loaded for ${user?.email}: ${data.completed ? 'completed' : 'in progress'}`)
      } else {
        // If no progress found, set default values
        console.log(`📋 No progress found for ${user?.email} on lesson ${lessonId}`)
        setLessonProgress({
          completed: false,
          progress: 0,
          timeSpent: 0,
          userId: userId
        });
      }
    } catch (err) {
      console.error('Error fetching lesson progress:', err);
      setError('Failed to fetch lesson progress');
      setLessonProgress({
        completed: false,
        progress: 0,
        timeSpent: 0,
        userId: userId
      });
    } finally {
      setLoading(false);
    }
  }, [userId, lessonId, user?.email]);

  const updateLessonProgress = useCallback(async (timeSpent: number, progress: number = 100) => {
    if (!userId || !lessonId || updating) return false;

    try {
      setUpdating(true);
      setError(null);
      
      console.log(`📚 ${user?.email} completing lesson ${lessonId} with ${timeSpent}s spent`)
      
      const response = await fetch(`/api/users/progress/lesson/${lessonId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeSpent,
          progress
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 🔒 SECURITY CHECK: Verify the returned data belongs to current user
        if (result.data.moduleProgress?.userId && result.data.moduleProgress.userId !== userId) {
          console.error('⚠️ Security violation: Received progress data for different user');
          setError('Data integrity error');
          return false;
        }
        
        setLessonProgress({
          completed: true,
          progress: progress,
          timeSpent: timeSpent,
          completedAt: new Date(),
          userId: userId
        });
        
        console.log(`🎉 ${user?.email} successfully completed lesson ${lessonId}`)
        return true;
      } else {
        setError(result.error || 'Failed to update lesson progress');
        return false;
      }
    } catch (err) {
      console.error('Error updating lesson progress:', err);
      setError('Failed to update lesson progress');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [userId, lessonId, updating, user?.email]);

  useEffect(() => {
    fetchLessonProgress();
  }, [fetchLessonProgress]);

  return {
    lessonProgress,
    loading,
    updating,
    error,
    updateProgress: updateLessonProgress,
    refetch: fetchLessonProgress
  };
}

/**
 * Hook to get progress for a specific module - USER SPECIFIC
 */
export function useModuleProgress(moduleId: string) {
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();

  const fetchModuleProgress = useCallback(async () => {
    if (!userId || !moduleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Fetching module progress for user ${user?.email}: module ${moduleId}`)
      
      const response = await fetch(`/api/users/progress/module/${moduleId}`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        
        // 🔒 SECURITY CHECK: Verify the data belongs to current user
        if (data.userId && data.userId !== userId) {
          console.error('⚠️ Security violation: Received progress data for different user');
          setError('Data integrity error');
          return;
        }
        
        if (data.userEmail && data.userEmail !== user?.email) {
          console.error('⚠️ Security violation: Email mismatch in progress data');
          setError('Data integrity error');
          return;
        }
        
        setModuleProgress({
          moduleId: data.moduleId,
          title: data.title,
          image: data.image,
          totalLessons: data.totalLessons,
          completedLessons: data.completedLessons,
          percentage: data.percentage,
          completed: data.completed,
          completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
          userId: data.userId,
          userEmail: data.userEmail,
          lessons: data.lessons.map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            completed: lesson.completed,
            progress: lesson.progress,
            timeSpent: lesson.timeSpent,
            completedAt: lesson.completedAt ? new Date(lesson.completedAt) : undefined
          }))
        });
        
        console.log(`✅ Module progress loaded for ${user?.email}: ${data.completedLessons}/${data.totalLessons} lessons (${data.percentage}%)`)
      } else {
        setError(result.error || 'Failed to fetch module progress');
      }
    } catch (err) {
      console.error('Error fetching module progress:', err);
      setError('Failed to fetch module progress');
    } finally {
      setLoading(false);
    }
  }, [userId, moduleId, user?.email]);

  useEffect(() => {
    fetchModuleProgress();
  }, [fetchModuleProgress]);

  return {
    moduleProgress,
    loading,
    error,
    refetch: fetchModuleProgress
  };
}

/**
 * Hook to get overall progress for the current user - USER SPECIFIC
 */
export function useOverallProgress() {
  const [overallProgress, setOverallProgress] = useState<OverallProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();

  const fetchOverallProgress = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Fetching overall progress for user ${user?.email}`)
      
      const response = await fetch('/api/users/progress');
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        
        // 🔒 SECURITY CHECK: Verify the data belongs to current user
        if (data.userId !== userId) {
          console.error('⚠️ Security violation: Received progress data for different user');
          console.error(`Expected user ID: ${userId}, Received: ${data.userId}`);
          setError('Data integrity error - user mismatch');
          return;
        }
        
        if (data.userEmail !== user?.email) {
          console.error('⚠️ Security violation: Email mismatch in progress data');
          console.error(`Expected email: ${user?.email}, Received: ${data.userEmail}`);
          setError('Data integrity error - email mismatch');
          return;
        }
        
        // Additional verification: Check that all progress entries belong to this user
        const moduleProgressEntries = Object.values(data.moduleProgress || {});
        const invalidModuleEntries = moduleProgressEntries.filter((entry: any) => 
          entry.userId && entry.userId !== userId
        );
        
        const lessonProgressEntries = Object.values(data.lessonProgress || {});
        const invalidLessonEntries = lessonProgressEntries.filter((entry: any) => 
          entry.userId && entry.userId !== userId
        );
        
        if (invalidModuleEntries.length > 0 || invalidLessonEntries.length > 0) {
          console.error('⚠️ Security violation: Mixed user data in progress entries');
          setError('Data integrity error - mixed user data');
          return;
        }
        
        setOverallProgress(data);
        
        console.log(`✅ Overall progress loaded for ${user?.email}: ${data.statistics.completedModules}/${data.statistics.totalModules} modules completed (${data.statistics.overallProgress}%)`)
      } else {
        setError(result.error || 'Failed to fetch overall progress');
      }
    } catch (err) {
      console.error('Error fetching overall progress:', err);
      setError('Failed to fetch overall progress');
    } finally {
      setLoading(false);
    }
  }, [userId, user?.email]);

  useEffect(() => {
    fetchOverallProgress();
  }, [fetchOverallProgress]);

  return {
    overallProgress,
    loading,
    error,
    refetch: fetchOverallProgress
  };
}

/**
 * Utility function to check if a lesson is completed - USER SPECIFIC
 */
export function isLessonCompleted(lessonId: string, overallProgress: OverallProgress | null, currentUserId?: string): boolean {
  if (!overallProgress) return false;
  
  // 🔒 Additional security check
  if (currentUserId && overallProgress.userId !== currentUserId) {
    console.warn('⚠️ User ID mismatch in progress check');
    return false;
  }
  
  return overallProgress.lessonProgress[lessonId]?.completed || false;
}

/**
 * Utility function to check if a module is completed - USER SPECIFIC
 */
export function isModuleCompleted(moduleId: string, overallProgress: OverallProgress | null, currentUserId?: string): boolean {
  if (!overallProgress) return false;
  
  // 🔒 Additional security check
  if (currentUserId && overallProgress.userId !== currentUserId) {
    console.warn('⚠️ User ID mismatch in progress check');
    return false;
  }
  
  return overallProgress.moduleProgress[moduleId]?.percentage === 100 || false;
}

/**
 * Utility function to get module completion percentage - USER SPECIFIC
 */
export function getModuleCompletionPercentage(moduleId: string, overallProgress: OverallProgress | null, currentUserId?: string): number {
  if (!overallProgress) return 0;
  
  // 🔒 Additional security check
  if (currentUserId && overallProgress.userId !== currentUserId) {
    console.warn('⚠️ User ID mismatch in progress check');
    return 0;
  }
  
  return overallProgress.moduleProgress[moduleId]?.percentage || 0;
}

/**
 * NEW: Hook to get user-specific leaderboard/stats (without exposing other users' data)
 */
export function useUserStats() {
  const { overallProgress, loading, error } = useOverallProgress();
  const { user } = useCurrentUser();
  
  const userStats = overallProgress ? {
    userId: overallProgress.userId,
    userEmail: overallProgress.userEmail,
    totalModulesCompleted: overallProgress.statistics.completedModules,
    totalLessonsCompleted: overallProgress.statistics.completedLessons,
    overallProgressPercentage: overallProgress.statistics.overallProgress,
    // You can add more computed stats here
    averageProgressPerModule: overallProgress.statistics.totalModules > 0 
      ? Math.round(overallProgress.statistics.overallProgress / overallProgress.statistics.totalModules) 
      : 0
  } : null;
  
  return {
    userStats,
    loading,
    error
  };
}