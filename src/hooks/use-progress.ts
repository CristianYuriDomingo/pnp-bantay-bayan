// src/hooks/use-progress.ts - INSTANT DUOLINGO-STYLE with SMART CACHING ⚡
'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentUserId, useCurrentUser } from './use-current-user'
import { useEffect } from 'react'

export interface LessonProgress {
  completed: boolean;
  progress: number;
  timeSpent: number;
  completedAt?: Date;
  userId?: string;
}

export interface BadgeInfo {
  newBadges: any[];
  badgeCount: number;
  success: boolean;
  errors?: string[];
}

export interface LessonCompletionResult {
  lessonProgress: LessonProgress;
  moduleProgress: any;
  badges?: BadgeInfo;
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
  userId?: string;
  userEmail?: string;
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
  userId: string;
  userEmail: string;
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

// ============================================================================
// FETCH FUNCTIONS with better error handling
// ============================================================================

async function fetchLessonProgressData(lessonId: string, userId: string, userEmail?: string | null): Promise<LessonProgress> {
  console.log(`Fetching lesson progress for user ${userEmail}: lesson ${lessonId}`);
  
  const response = await fetch(`/api/users/progress/lesson/${lessonId}`);
  
  // Check if response is actually JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  const result = await response.json();

  if (result.success) {
    const data = result.data;
    
    if (data.userId && data.userId !== userId) {
      console.error('Security violation: Received progress data for different user');
      throw new Error('Data integrity error - user mismatch');
    }
    
    console.log(`Lesson progress loaded for ${userEmail}: ${data.completed ? 'completed' : 'in progress'}`);
    
    return {
      completed: data.completed,
      progress: data.progress,
      timeSpent: data.timeSpent,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      userId: data.userId
    };
  } else {
    console.log(`No progress found for ${userEmail} on lesson ${lessonId}`);
    // Return default progress
    return {
      completed: false,
      progress: 0,
      timeSpent: 0,
      userId: userId
    };
  }
}

async function fetchModuleProgressData(moduleId: string, userId: string, userEmail?: string | null): Promise<ModuleProgress> {
  console.log(`Fetching module progress for user ${userEmail}: module ${moduleId}`);
  
  const response = await fetch(`/api/users/progress/module/${moduleId}`);
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch module progress');
  }

  const data = result.data;
  
  if (data.userId && data.userId !== userId) {
    throw new Error('Data integrity error - user mismatch');
  }
  
  if (userEmail && data.userEmail && data.userEmail !== userEmail) {
    throw new Error('Data integrity error - email mismatch');
  }
  
  console.log(`Module progress loaded for ${userEmail}: ${data.completedLessons}/${data.totalLessons} lessons (${data.percentage}%)`);
  
  return {
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
  };
}

async function fetchOverallProgressData(userId: string, userEmail?: string | null): Promise<OverallProgress> {
  console.log(`Fetching overall progress for user ${userEmail}`);
  
  const response = await fetch('/api/users/progress');
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response. Check if API endpoint exists.');
  }
  
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch overall progress');
  }

  const data = result.data;
  
  if (data.userId !== userId) {
    throw new Error('Data integrity error - user mismatch');
  }
  
  if (userEmail && data.userEmail !== userEmail) {
    throw new Error('Data integrity error - email mismatch');
  }
  
  // Validate nested data
  const moduleProgressEntries = Object.values(data.moduleProgress || {});
  const invalidModuleEntries = moduleProgressEntries.filter((entry: any) => 
    entry.userId && entry.userId !== userId
  );
  
  const lessonProgressEntries = Object.values(data.lessonProgress || {});
  const invalidLessonEntries = lessonProgressEntries.filter((entry: any) => 
    entry.userId && entry.userId !== userId
  );
  
  if (invalidModuleEntries.length > 0 || invalidLessonEntries.length > 0) {
    throw new Error('Data integrity error - mixed user data');
  }
  
  console.log(`Overall progress loaded for ${userEmail}: ${data.statistics.completedModules}/${data.statistics.totalModules} modules completed (${data.statistics.overallProgress}%)`);
  
  return data;
}

async function updateLessonProgressData(
  lessonId: string, 
  userId: string, 
  timeSpent: number, 
  progress: number,
  userEmail?: string | null
): Promise<LessonCompletionResult> {
  console.log(`${userEmail} completing lesson ${lessonId} with ${timeSpent}s spent`);
  
  const response = await fetch(`/api/users/progress/lesson/${lessonId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeSpent,
      progress,
      userId: userId
    }),
  });

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to update lesson progress');
  }

  const data = result.data as LessonCompletionResult;
  
  if (data.moduleProgress?.userId && data.moduleProgress.userId !== userId) {
    throw new Error('Data integrity error - user mismatch in response');
  }
  
  console.log(`Successfully completed lesson ${lessonId} for ${userEmail}`);
  
  return data;
}

// ============================================================================
// REACT QUERY HOOKS - INSTANT + SMART CACHING ⚡
// ============================================================================

/**
 * Hook to get and update progress for a specific lesson
 * ⚡ INSTANT: Uses optimistic updates for 0ms perceived delay
 * 💾 CACHED: Keeps data for 2 min for smooth back navigation
 */
export function useLessonProgress(lessonId: string) {
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  // Query for fetching lesson progress
  const { 
    data: lessonProgress, 
    isLoading: loading, 
    error: queryError,
    refetch,
    isFetching // Shows background refetching
  } = useQuery({
    queryKey: ['lessonProgress', lessonId, userId],
    queryFn: () => fetchLessonProgressData(lessonId, userId!, user?.email),
    enabled: !!userId && !!lessonId,
    
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

    const handleProgressUpdate = () => {
      // Instant invalidation - refetches immediately
      queryClient.invalidateQueries({ 
        queryKey: ['lessonProgress', lessonId, userId],
        refetchType: 'active' // Only refetch if component is mounted
      });
    };

    window.addEventListener('progressRefresh', handleProgressUpdate);
    window.addEventListener('lessonCompleted', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progressRefresh', handleProgressUpdate);
      window.removeEventListener('lessonCompleted', handleProgressUpdate);
    };
  }, [queryClient, userId, lessonId]);

  // Mutation with OPTIMISTIC UPDATES (UI updates before server responds)
  const { 
    mutateAsync: updateProgressMutation, 
    isPending: updating,
    data: mutationResult 
  } = useMutation({
    mutationFn: async ({ timeSpent, progress }: { timeSpent: number; progress: number }) => {
      if (!userId || !lessonId) throw new Error('Missing userId or lessonId');
      
      const result = await updateLessonProgressData(lessonId, userId, timeSpent, progress, user?.email);
      
      // Handle badge information
      if (result.badges) {
        if (result.badges.success && result.badges.badgeCount > 0) {
          console.log(`Badge success! ${user?.email} earned ${result.badges.badgeCount} new badges`);
          
          // Dispatch badge notification event
          window.dispatchEvent(new CustomEvent('badgesAwarded', {
            detail: {
              userId: userId,
              newBadges: result.badges.newBadges,
              badgeCount: result.badges.badgeCount,
              lessonId: lessonId
            }
          }));
          
          // Dispatch lesson completion event with badge info
          window.dispatchEvent(new CustomEvent('lessonCompleted', {
            detail: { 
              lessonId, 
              moduleId: result.moduleProgress?.moduleId, 
              timestamp: Date.now(),
              badges: result.badges
            }
          }));
        } else if (result.badges.errors && result.badges.errors.length > 0) {
          console.warn('Badge awarding had errors:', result.badges.errors);
        }
      }
      
      return result;
    },
    // ⚡ OPTIMISTIC UPDATE - UI feels instant!
    onMutate: async ({ timeSpent, progress }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['lessonProgress', lessonId, userId] });
      
      // Snapshot the previous value for rollback
      const previousProgress = queryClient.getQueryData(['lessonProgress', lessonId, userId]);
      
      // Optimistically update the UI immediately
      queryClient.setQueryData(['lessonProgress', lessonId, userId], {
        completed: progress >= 100,
        progress,
        timeSpent,
        userId,
        completedAt: progress >= 100 ? new Date() : undefined
      });
      
      // Return context for potential rollback
      return { previousProgress };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      console.error('Error updating progress, rolling back:', err);
      if (context?.previousProgress) {
        queryClient.setQueryData(['lessonProgress', lessonId, userId], context.previousProgress);
      }
    },
    onSuccess: (data) => {
      // Invalidate ALL related queries instantly
      queryClient.invalidateQueries({ queryKey: ['lessonProgress', lessonId, userId] });
      queryClient.invalidateQueries({ queryKey: ['moduleProgress', data.moduleProgress?.moduleId, userId] });
      queryClient.invalidateQueries({ queryKey: ['overallProgress', userId] });
      queryClient.invalidateQueries({ queryKey: ['allBadges', userId] });
      queryClient.invalidateQueries({ queryKey: ['userBadges', userId] });
      
      // Broadcast to other components (no delay!)
      window.dispatchEvent(new CustomEvent('progressRefresh', {
        detail: { timestamp: Date.now() }
      }));
    },
  });

  const error = queryError?.message || null;
  const lastBadgeResult = mutationResult?.badges || null;

  return {
    lessonProgress: lessonProgress || null,
    loading,
    updating,
    isFetching, // New: shows background refresh
    error,
    lastBadgeResult,
    updateProgress: async (timeSpent: number, progress: number = 100) => {
      try {
        await updateProgressMutation({ timeSpent, progress });
        return true;
      } catch (err) {
        console.error('Error updating lesson progress:', err);
        return false;
      }
    },
    refetch
  };
}

/**
 * Hook to get module progress
 * ⚡ INSTANT: Always fresh data
 * 💾 CACHED: Keeps data for 2 min for smooth navigation
 */
export function useModuleProgress(moduleId: string) {
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const { 
    data: moduleProgress, 
    isLoading: loading, 
    error: queryError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['moduleProgress', moduleId, userId],
    queryFn: () => fetchModuleProgressData(moduleId, userId!, user?.email),
    enabled: !!userId && !!moduleId,
    
    staleTime: 0, // Always fresh
    gcTime: 2 * 60 * 1000, // Cache for 2 min
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  });

  // Listen for lesson completions in this module
  useEffect(() => {
    if (!userId) return;

    const handleLessonComplete = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.moduleId === moduleId) {
        queryClient.invalidateQueries({ 
          queryKey: ['moduleProgress', moduleId, userId],
          refetchType: 'active'
        });
      }
    };

    const handleProgressUpdate = () => {
      queryClient.invalidateQueries({ 
        queryKey: ['moduleProgress', moduleId, userId],
        refetchType: 'active'
      });
    };

    window.addEventListener('lessonCompleted', handleLessonComplete);
    window.addEventListener('progressRefresh', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonComplete);
      window.removeEventListener('progressRefresh', handleProgressUpdate);
    };
  }, [queryClient, userId, moduleId]);

  const error = queryError?.message || null;

  return {
    moduleProgress: moduleProgress || null,
    loading,
    isFetching,
    error,
    refetch
  };
}

/**
 * Hook to get overall progress
 * ⚡ INSTANT: Always fresh data
 * 💾 CACHED: Keeps data for 3 min for dashboard
 */
export function useOverallProgress() {
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const { 
    data: overallProgress, 
    isLoading: loading, 
    error: queryError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['overallProgress', userId],
    queryFn: () => fetchOverallProgressData(userId!, user?.email ?? undefined),
    enabled: !!userId,
    
    staleTime: 0, // Always fresh
    gcTime: 3 * 60 * 1000, // Cache for 3 min (dashboard data)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  });

  // Global progress updates
  useEffect(() => {
    if (!userId) return;

    const handleProgressUpdate = () => {
      queryClient.invalidateQueries({ 
        queryKey: ['overallProgress', userId],
        refetchType: 'active'
      });
    };

    window.addEventListener('progressRefresh', handleProgressUpdate);
    window.addEventListener('lessonCompleted', handleProgressUpdate);
    window.addEventListener('badgesAwarded', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progressRefresh', handleProgressUpdate);
      window.removeEventListener('lessonCompleted', handleProgressUpdate);
      window.removeEventListener('badgesAwarded', handleProgressUpdate);
    };
  }, [queryClient, userId]);

  const error = queryError?.message || null;

  return {
    overallProgress: overallProgress || null,
    loading,
    isFetching,
    error,
    refetch
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function isLessonCompleted(lessonId: string, overallProgress: OverallProgress | null, currentUserId?: string): boolean {
  if (!overallProgress) return false;
  
  if (currentUserId && overallProgress.userId !== currentUserId) {
    console.warn('User ID mismatch in progress check');
    return false;
  }
  
  return overallProgress.lessonProgress[lessonId]?.completed || false;
}

export function isModuleCompleted(moduleId: string, overallProgress: OverallProgress | null, currentUserId?: string): boolean {
  if (!overallProgress) return false;
  
  if (currentUserId && overallProgress.userId !== currentUserId) {
    console.warn('User ID mismatch in progress check');
    return false;
  }
  
  return overallProgress.moduleProgress[moduleId]?.percentage === 100 || false;
}

export function getModuleCompletionPercentage(moduleId: string, overallProgress: OverallProgress | null, currentUserId?: string): number {
  if (!overallProgress) return 0;
  
  if (currentUserId && overallProgress.userId !== currentUserId) {
    console.warn('User ID mismatch in progress check');
    return 0;
  }
  
  return overallProgress.moduleProgress[moduleId]?.percentage || 0;
}

export function useUserStats() {
  const { overallProgress, loading, error } = useOverallProgress();
  
  const userStats = overallProgress ? {
    userId: overallProgress.userId,
    userEmail: overallProgress.userEmail,
    totalModulesCompleted: overallProgress.statistics.completedModules,
    totalLessonsCompleted: overallProgress.statistics.completedLessons,
    overallProgressPercentage: overallProgress.statistics.overallProgress,
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