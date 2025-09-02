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
}

export default function RecommendedNext() {
  const { overallProgress, loading, error } = useOverallProgress();
  const [recommendations, setRecommendations] = useState<ModuleRecommendation[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const router = useRouter();

  // Fetch module recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!overallProgress) return;

      try {
        setLoadingModules(true);
        const response = await fetch('/api/users/modules');
        const result = await response.json();

        if (result.success) {
          // Filter and sort modules for recommendations
          const moduleRecommendations: ModuleRecommendation[] = result.data
            .map((module: any) => {
              const moduleProgress = overallProgress.moduleProgress[module.id];
              const completionPercentage = moduleProgress?.percentage || 0;
              
              return {
                id: module.id,
                title: module.title,
                category: 'Learning Module', // You can enhance this with actual categories
                image: module.image,
                completionPercentage,
                totalLessons: module.lessons?.length || 0,
                completedLessons: moduleProgress?.completedLessons || 0
              };
            })
            .filter((module: ModuleRecommendation) => module.completionPercentage < 100) // Only incomplete modules
            .sort((a: ModuleRecommendation, b: ModuleRecommendation) => {
              // Prioritize: 1. Partially started modules, 2. New modules
              if (a.completionPercentage > 0 && b.completionPercentage === 0) return -1;
              if (a.completionPercentage === 0 && b.completionPercentage > 0) return 1;
              return b.completionPercentage - a.completionPercentage;
            })
            .slice(0, 3); // Show top 3 recommendations

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

  const handleModuleClick = (moduleId: string) => {
    // Navigate to the first lesson of the module
    // You might want to enhance this to navigate to the next incomplete lesson
    router.push(`/users/modules/${moduleId}`);
  };

  if (loading || loadingModules) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
          Recommended Next
        </h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
          Recommended Next
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-gray-600 dark:text-gray-400">
            {error ? 'Unable to load recommendations' : 'Great job! You\'ve completed all available modules.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
        Recommended Next
      </h3>
      
      <div className="space-y-3">
        {recommendations.map((module) => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.id)}
            className="w-full flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-100 dark:border-blue-800"
          >
            {/* Module Icon */}
            <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center mr-3 flex-shrink-0">
              {module.image ? (
                <img 
                  src={module.image} 
                  alt={module.title}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            
            {/* Module Info */}
            <div className="flex-1 text-left">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {module.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {module.category}
                {module.completionPercentage > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                    {module.completionPercentage}% complete
                  </span>
                )}
              </p>
            </div>

            {/* Arrow */}
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}