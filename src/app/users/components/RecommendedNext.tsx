// app/users/components/RecommendedNext.tsx
'use client';

import { useOverallProgress } from '@/hooks/use-progress';
import { useState, useEffect } from 'react';
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
  const { overallProgress, loading, error } = useOverallProgress();
  const [recommendations, setRecommendations] = useState<ModuleRecommendation[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Number of items to show at once
  const ITEMS_PER_VIEW = 2;

  // Fetch module recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!overallProgress) return;

      try {
        setLoadingModules(true);
        const response = await fetch('/api/users/modules');
        const result = await response.json();

        if (result.success) {
          console.log('API Response:', result.data); // Debug: Check what API returns
          
          // Filter and sort modules for recommendations
          const moduleRecommendations: ModuleRecommendation[] = result.data
            .map((module: any) => {
              const moduleProgress = overallProgress.moduleProgress[module.id];
              const completionPercentage = moduleProgress?.percentage || 0;
              
              console.log('Processing module:', {
                id: module.id,
                moduleTitle: module.title,
                firstLessonTitle: module.firstLessonTitle,
                firstLessonId: module.firstLessonId,
                totalLessons: module.totalLessons,
                completionPercentage
              });
              
              return {
                id: module.id,
                title: module.title, // Module title
                category: 'Learning Module',
                image: module.imageSrc,
                completionPercentage,
                totalLessons: module.totalLessons || 0,
                completedLessons: moduleProgress?.completedLessons || 0,
                nextLessonId: module.firstLessonId, // Lesson ID
                nextLessonTitle: module.firstLessonTitle // Lesson title
              };
            })
            .filter((module: ModuleRecommendation) => {
              const hasLessons = module.totalLessons > 0;
              const notComplete = module.completionPercentage < 100;
              const hasLessonTitle = module.nextLessonTitle;
              
              console.log('Filter check:', {
                moduleId: module.id,
                hasLessons,
                notComplete,
                hasLessonTitle,
                willShow: hasLessons && notComplete
              });
              
              return hasLessons && notComplete;
            })
            .sort((a: ModuleRecommendation, b: ModuleRecommendation) => {
              if (a.completionPercentage > 0 && b.completionPercentage === 0) return -1;
              if (a.completionPercentage === 0 && b.completionPercentage > 0) return 1;
              return b.completionPercentage - a.completionPercentage;
            });

          console.log('Final recommendations:', moduleRecommendations);
          setRecommendations(moduleRecommendations);
        }
      } catch (err) {
        console.error('Error fetching module recommendations:', err);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchRecommendations();
  }, [overallProgress]);

  const handleModuleClick = async (moduleId: string, lessonId?: string) => {
    if (lessonId) {
      router.push(`/users/lessons/${lessonId}`);
    } else {
      try {
        const response = await fetch(`/api/users/lessons?moduleId=${moduleId}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          const firstLesson = result.data[0];
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
            {/* Page indicator */}
            <span className="text-sm text-gray-500">
              {currentPage} of {totalPages}
            </span>
            
            {/* Navigation buttons */}
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
            
            {/* Module Info - Simplified */}
            <div className="flex-1 text-left">
              <h4 className="font-medium text-gray-900">
                {module.nextLessonTitle || 'Next Lesson Available'}
              </h4>
              <p className="text-sm text-gray-600">
                {module.title}
              </p>
            </div>
          </button>
        ))}
      </div>
      
      {/* Dot indicators for mobile/visual reference */}
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