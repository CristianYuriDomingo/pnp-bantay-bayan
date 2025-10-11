// app/users/components/DashboardStats.tsx
'use client';

import { useOverallProgress } from '@/hooks/use-progress';

export default function DashboardStats() {
  const { overallProgress, loading, error } = useOverallProgress();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded-full w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">
          Completed Lessons
        </h3>
        <p className="text-red-500 text-sm">Failed to load progress data</p>
      </div>
    );
  }

  const completedLessons = overallProgress?.statistics.completedLessons || 0;
  const totalLessons = overallProgress?.statistics.totalLessons || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-blue-600 mb-4">
        Completed Lessons
      </h3>
      
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-blue-600">
            {completedLessons}
          </span>
          <span className="text-gray-600">
            of {totalLessons}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className="bg-blue-500 h-4 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <p className="text-xs text-gray-500 mt-2 font-semibold">
        {progressPercentage}% Complete
      </p>
    </div>
  );
} 