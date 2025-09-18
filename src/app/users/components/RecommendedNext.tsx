// app/users/components/RecommendedNext.tsx - FIXED NEXT LESSON LOGIC
'use client';

import { useOverallProgress } from '@/hooks/use-progress';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

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

export default function RecommendedNext() {
  const { overallProgress, loading, error, refetch } = useOverallProgress();
  const [recommendations, setRecommendations] = useState<ModuleRecommendation[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const router = useRouter();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Number of items to show at once
  const ITEMS_PER_VIEW = 2;

  // Enhanced refetch function with delayed refresh for data consistency
  const refreshProgress = useCallback(async (delay: number = 0) => {
    console.log(`🔄 Scheduling progress refresh with ${delay}ms delay...`);
    
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const performRefresh = async () => {
      console.log('📊 Executing progress refresh...');
      await refetch();
      setLastRefresh(Date.now());
      console.log('✅ Progress refresh completed');
    };

    if (delay > 0) {
      refreshTimeoutRef.current = setTimeout(performRefresh, delay);
    } else {
      await performRefresh();
    }
  }, [refetch]);

  // Enhanced event listeners with better timing
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lessonCompleted') {
        console.log('📚 Lesson completion detected via storage, refreshing with delay...');
        // Add delay to allow server-side processing to complete
        refreshProgress(2000); // 2 second delay
      }
    };

    const handleFocus = () => {
      console.log('👁️ Page focused, checking for updates...');
      refreshProgress(500); // Short delay for focus events
    };

    const handleLessonComplete = (e: CustomEvent) => {
      console.log('🎉 Direct lesson completion event detected:', e.detail);
      // Longer delay for direct events as they happen immediately
      refreshProgress(3000); // 3 second delay
    };

    const handleProgressRefresh = () => {
      console.log('🔄 Manual progress refresh requested');
      refreshProgress(0); // Immediate for manual refresh
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('lessonCompleted', handleLessonComplete as EventListener);
    window.addEventListener('progressRefresh', handleProgressRefresh);

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('lessonCompleted', handleLessonComplete as EventListener);
      window.removeEventListener('progressRefresh', handleProgressRefresh);
    };
  }, [refreshProgress]);

  // FIXED: Function to find the actual next lesson that should be taken
  const findNextLesson = (module: any, moduleProgress: any) => {
    if (!module.allLessons || module.allLessons.length === 0) {
      return {
        nextLessonId: null,
        nextLessonTitle: null
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
        nextLessonId: null,
        nextLessonTitle: null
      };
    }
  };

  // Fetch module recommendations with enhanced caching and debugging
  const fetchRecommendations = useCallback(async () => {
    if (!overallProgress) {
      console.log('⏳ No progress data available yet, skipping recommendation fetch');
      return;
    }

    try {
      setLoadingModules(true);
      
      // Enhanced cache busting with multiple parameters
      const cacheBuster = `t=${Date.now()}&r=${Math.random()}&refresh=${lastRefresh}`;
      console.log(`📡 Fetching modules with cache buster: ${cacheBuster}`);
      
      const response = await fetch(`/api/users/modules?${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      const result = await response.json();

      if (result.success) {
        const progressData = overallProgress;
        
        console.log('🔍 Processing recommendations with data:', {
          totalModules: result.data.length,
          progressModules: Object.keys(progressData.moduleProgress).length,
          dataTimestamp: result.timestamp,
          progressAge: Date.now() - lastRefresh
        });
        
        // Enhanced module processing with FIXED next lesson logic
        const moduleRecommendations: ModuleRecommendation[] = result.data
          .map((module: any) => {
            const moduleProgress = progressData.moduleProgress[module.id];
            const completionPercentage = moduleProgress?.percentage || 0;
            
            // FIXED: Find the actual next lesson instead of always using first lesson
            const { nextLessonId, nextLessonTitle } = findNextLesson(module, moduleProgress);
            
            // Create recommendation object
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
              nextLessonTitle: recommendation.nextLessonTitle,
              nextLessonId: recommendation.nextLessonId
            });
            
            return recommendation;
          })
          .filter((module: ModuleRecommendation) => {
            const hasLessons = module.totalLessons > 0;
            const notComplete = module.completionPercentage < 100;
            const hasValidNext = module.nextLessonId && module.nextLessonTitle;
            
            // FIXED: Only show modules that have a valid next lesson to take
            const shouldShow = hasLessons && notComplete && hasValidNext;
            
            console.log(`🔎 Filter decision for ${module.title}:`, {
              hasLessons,
              notComplete,
              hasValidNext,
              completionPercentage: module.completionPercentage,
              nextLessonId: module.nextLessonId,
              shouldShow
            });
            
            return shouldShow;
          })
          .sort((a: ModuleRecommendation, b: ModuleRecommendation) => {
            // Prioritize modules with some progress but not complete
            if (a.completionPercentage > 0 && a.completionPercentage < 100 && 
                b.completionPercentage === 0) return -1;
            if (a.completionPercentage === 0 && 
                b.completionPercentage > 0 && b.completionPercentage < 100) return 1;
            
            // Among incomplete modules, sort by progress descending
            return b.completionPercentage - a.completionPercentage;
          });

        console.log('✅ Final recommendations generated:', {
          count: moduleRecommendations.length,
          recommendations: moduleRecommendations.map(r => ({
            title: r.title,
            completion: r.completionPercentage,
            nextLesson: r.nextLessonTitle,
            nextLessonId: r.nextLessonId
          }))
        });
        
        setRecommendations(moduleRecommendations);
      } else {
        console.error('❌ Failed to fetch modules:', result.error);
      }
    } catch (err) {
      console.error('❌ Error fetching module recommendations:', err);
    } finally {
      setLoadingModules(false);
    }
  }, [overallProgress, lastRefresh]);

  // Refetch recommendations when progress data changes
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleModuleClick = async (moduleId: string, lessonId?: string) => {
    if (lessonId) {
      console.log(`🚀 Starting lesson ${lessonId} in module ${moduleId}`);
      
      // Dispatch event for other components
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

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - ITEMS_PER_VIEW));
  };

  const goToNext = () => {
    setCurrentIndex(prev => 
      Math.min(recommendations.length - ITEMS_PER_VIEW, prev + ITEMS_PER_VIEW)
    );
  };

  // Force refresh button
  const handleForceRefresh = async () => {
    console.log('🔄 Force refresh triggered by user');
    setLastRefresh(Date.now());
    await refreshProgress(0);
  };

  // Calculate what to show
  const displayedRecommendations = recommendations.slice(currentIndex, currentIndex + ITEMS_PER_VIEW);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex + ITEMS_PER_VIEW < recommendations.length;
  const totalPages = Math.ceil(recommendations.length / ITEMS_PER_VIEW);
  const currentPage = Math.floor(currentIndex / ITEMS_PER_VIEW) + 1;

  if (loading || loadingModules) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">
          Recommended Next
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-600">Unable to load recommendations</p>
          <p className="text-sm text-red-500 mt-2">{error}</p>
          <button
            onClick={handleForceRefresh}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
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
          <button
            onClick={handleForceRefresh}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-blue-600">
            Recommended Next
          </h3>
          <button
            onClick={handleForceRefresh}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Refresh recommendations"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
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
            
            {/* Module Info with simplified progress indicator */}
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