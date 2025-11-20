// app/users/components/RecommendedNext.tsx - WITH REACT QUERY CACHING ⚡
'use client';

import { useOverallProgress } from '@/hooks/use-progress';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUserId, useCurrentUser } from '@/hooks/use-current-user';

interface ModuleRecommendation {
  id: string;
  title: string;
  category: string;
  image?: string;
  completionPercentage: number;
  totalLessons: number;
  completedLessons: number;
  nextLessonId?: string;
  nextLessonTitle?: string;
}

interface ModuleData {
  id: string;
  title: string;
  imageSrc?: string;
  totalLessons: number;
  allLessons: Array<{ id: string; title: string }>;
}

interface ModulesResponse {
  modules: ModuleData[];
  timestamp: number;
  userId: string;
}

// ============================================================================
// FETCH FUNCTION
// ============================================================================

async function fetchModulesData(userId: string, userEmail?: string | null): Promise<ModulesResponse> {
  console.log(`📡 Fetching modules for user ${userEmail}`);
  
  // Cache busting with timestamp
  const cacheBuster = `t=${Date.now()}&r=${Math.random()}`;
  const response = await fetch(`/api/users/modules?${cacheBuster}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  });
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch modules');
  }

  console.log(`✅ Modules loaded for ${userEmail}: ${result.data.length} modules`);
  
  return {
    modules: result.data,
    timestamp: result.timestamp || Date.now(),
    userId: userId
  };
}

// ============================================================================
// HELPER FUNCTION - Find Next Lesson
// ============================================================================

function findNextLesson(module: ModuleData, moduleProgress: any): {
  nextLessonId: string | undefined;
  nextLessonTitle: string | undefined;
} {
  if (!module.allLessons || module.allLessons.length === 0) {
    return {
      nextLessonId: undefined,
      nextLessonTitle: undefined
    };
  }

  const completedLessonIds = moduleProgress?.completedLessons || [];
  
  console.log(`🔍 Finding next lesson for module ${module.title}:`, {
    totalLessons: module.allLessons.length,
    completedLessons: completedLessonIds.length,
    completedLessonIds
  });

  // Find the first lesson that hasn't been completed
  const nextLesson = module.allLessons.find((lesson: any) => 
    !completedLessonIds.includes(lesson.id)
  );

  if (nextLesson) {
    console.log(`✅ Next lesson found: ${nextLesson.title} (${nextLesson.id})`);
    return {
      nextLessonId: nextLesson.id,
      nextLessonTitle: nextLesson.title
    };
  } else {
    console.log(`⚠️ No incomplete lessons found for module ${module.title}`);
    return {
      nextLessonId: undefined,
      nextLessonTitle: undefined
    };
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RecommendedNext() {
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();
  const { overallProgress, loading: progressLoading, error: progressError } = useOverallProgress();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Number of items to show at once
  const ITEMS_PER_VIEW = 2;

  // ⚡ REACT QUERY - Fetch modules with INSTANT caching
  const { 
    data: modulesData, 
    isLoading: modulesLoading, 
    error: modulesQueryError,
    isFetching,
    refetch: refetchModules
  } = useQuery({
    queryKey: ['userModules', userId],
    queryFn: () => fetchModulesData(userId!, user?.email),
    enabled: !!userId,
    
    // ⚡ INSTANT MODE - matches progress/badges
    staleTime: 0, // Always fresh
    gcTime: 2 * 60 * 1000, // Cache for 2 minutes
    
    // SMART REFETCHING
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  });

  // Listen for events and invalidate cache INSTANTLY
  useEffect(() => {
    if (!userId) return;

    const handleLessonComplete = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('✅ Lesson completed - refreshing recommendations:', detail);
      
      // Invalidate both modules and progress
      queryClient.invalidateQueries({ 
        queryKey: ['userModules', userId],
        refetchType: 'active'
      });
    };

    const handleProgressRefresh = () => {
      console.log('🔄 Progress refresh - updating recommendations');
      queryClient.invalidateQueries({ 
        queryKey: ['userModules', userId],
        refetchType: 'active'
      });
    };

    const handleLessonStarted = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('🚀 Lesson started:', detail);
      // Optional: Could mark as "in progress" in UI
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lessonCompleted') {
        console.log('📚 Storage change detected - refreshing');
        queryClient.invalidateQueries({ 
          queryKey: ['userModules', userId],
          refetchType: 'active'
        });
      }
    };

    window.addEventListener('lessonCompleted', handleLessonComplete);
    window.addEventListener('progressRefresh', handleProgressRefresh);
    window.addEventListener('lessonStarted', handleLessonStarted);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonComplete);
      window.removeEventListener('progressRefresh', handleProgressRefresh);
      window.removeEventListener('lessonStarted', handleLessonStarted);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [queryClient, userId]);

  // ============================================================================
  // PROCESS RECOMMENDATIONS - Combines modules + progress
  // ============================================================================

  const recommendations: ModuleRecommendation[] = (() => {
    if (!modulesData || !overallProgress) {
      return [];
    }

    console.log('🔍 Processing recommendations with fresh data:', {
      totalModules: modulesData.modules.length,
      progressModules: Object.keys(overallProgress.moduleProgress).length,
      dataTimestamp: modulesData.timestamp
    });

    return modulesData.modules
      .map((module) => {
        const moduleProgress = overallProgress.moduleProgress[module.id];
        const completionPercentage = moduleProgress?.percentage || 0;
        
        // Find the actual next lesson
        const { nextLessonId, nextLessonTitle } = findNextLesson(module, moduleProgress);
        
        const recommendation = {
          id: module.id,
          title: module.title,
          category: 'Learning Module',
          image: module.imageSrc,
          completionPercentage,
          totalLessons: module.totalLessons || 0,
          completedLessons: moduleProgress?.completedLessons?.length || 0,
          nextLessonId,
          nextLessonTitle
        };

        console.log('🎯 Module processed:', {
          moduleId: module.id,
          title: module.title,
          completion: completionPercentage,
          totalLessons: recommendation.totalLessons,
          completedLessons: recommendation.completedLessons,
          hasNextLesson: !!recommendation.nextLessonId,
          nextLessonTitle: recommendation.nextLessonTitle
        });
        
        return recommendation;
      })
      .filter((module) => {
        const hasLessons = module.totalLessons > 0;
        const notComplete = module.completionPercentage < 100;
        const hasValidNext = module.nextLessonId && module.nextLessonTitle;
        
        // Only show modules with a valid next lesson
        const shouldShow = hasLessons && notComplete && hasValidNext;
        
        console.log(`🔎 Filter decision for ${module.title}:`, {
          hasLessons,
          notComplete,
          hasValidNext,
          completionPercentage: module.completionPercentage,
          shouldShow
        });
        
        return shouldShow;
      })
      .sort((a, b) => {
        // Prioritize modules with some progress but not complete
        if (a.completionPercentage > 0 && a.completionPercentage < 100 && 
            b.completionPercentage === 0) return -1;
        if (a.completionPercentage === 0 && 
            b.completionPercentage > 0 && b.completionPercentage < 100) return 1;
        
        // Sort by progress descending
        return b.completionPercentage - a.completionPercentage;
      });
  })();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleModuleClick = async (moduleId: string, lessonId?: string) => {
    if (lessonId) {
      console.log(`🚀 Starting lesson ${lessonId} in module ${moduleId}`);
      
      window.dispatchEvent(new CustomEvent('lessonStarted', { 
        detail: { lessonId, moduleId } 
      }));
      
      router.push(`/users/lessons/${lessonId}`);
    } else {
      console.log(`📚 Fetching first lesson for module ${moduleId}`);
      try {
        const response = await fetch(`/api/users/lessons?moduleId=${moduleId}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          const firstLesson = result.data[0];
          window.dispatchEvent(new CustomEvent('lessonStarted', { 
            detail: { lessonId: firstLesson.id, moduleId } 
          }));
          router.push(`/users/lessons/${firstLesson.id}`);
        } else {
          alert('No lessons available for this module yet.');
        }
      } catch (error) {
        console.error('Error fetching lessons for module:', moduleId, error);
        alert('Error loading lessons. Please try again.');
      }
    }
  };

  const handleForceRefresh = async () => {
    console.log('🔄 Force refresh triggered by user');
    await refetchModules();
  };

  // Navigation
  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - ITEMS_PER_VIEW));
  };

  const goToNext = () => {
    setCurrentIndex(prev => 
      Math.min(recommendations.length - ITEMS_PER_VIEW, prev + ITEMS_PER_VIEW)
    );
  };

  // Calculate display
  const displayedRecommendations = recommendations.slice(currentIndex, currentIndex + ITEMS_PER_VIEW);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex + ITEMS_PER_VIEW < recommendations.length;
  const totalPages = Math.ceil(recommendations.length / ITEMS_PER_VIEW);
  const currentPage = Math.floor(currentIndex / ITEMS_PER_VIEW) + 1;

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  const error = progressError || modulesQueryError?.message || null;

  if (error) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">
          Recommended Next
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-600">Unable to load recommendations</p>
          <p className="text-sm text-red-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">
          Recommended Next
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-600">
            {!overallProgress ? 'Loading progress data...' : 
             'Great job! You\'ve completed all available modules.'}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="p-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-600">
          Recommended Next
        </h3>
        
        {/* Navigation Controls */}
        {recommendations.length > ITEMS_PER_VIEW && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className={`p-1.5 rounded-full transition-colors ${
                canGoPrevious 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className={`p-1.5 rounded-full transition-colors ${
                canGoNext 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Recommendations Container */}
      <div className="space-y-3">
        {displayedRecommendations.map((module) => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.id, module.nextLessonId)}
            className="w-full flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {/* Document icon */}
            <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            {/* Module Info */}
            <div className="flex-1 text-left">
              <h4 className="font-medium text-gray-900">
                {module.nextLessonTitle || 'Continue Learning'}
              </h4>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {module.title}
                </p>
                <span className="text-xs text-blue-600 font-medium">
                  {module.completedLessons}/{module.totalLessons}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Dot indicators */}
      {recommendations.length > ITEMS_PER_VIEW && (
        <div className="flex justify-center mt-4 space-x-1">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * ITEMS_PER_VIEW)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentPage - 1 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}