// app/users/components/RecentActivity.tsx - WITH REACT QUERY CACHING ⚡
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUserId, useCurrentUser } from '@/hooks/use-current-user';

interface ActivityItem {
  id: string;
  type: 'lesson_completed' | 'module_started' | 'module_completed';
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
}

interface ActivityResponse {
  activities: ActivityItem[];
  userId: string;
}

// ============================================================================
// FETCH FUNCTION
// ============================================================================

async function fetchRecentActivityData(userId: string, userEmail?: string | null): Promise<ActivityResponse> {
  console.log(`Fetching recent activity for user ${userEmail}`);
  
  const response = await fetch('/api/users/activity');
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch activity');
  }

  const data = result.data;
  
  // Optional: Verify userId if API returns it
  // if (data.userId && data.userId !== userId) {
  //   throw new Error('Data integrity error - user mismatch');
  // }
  
  console.log(`Activity loaded for ${userEmail}: ${data.length} activities`);
  
  return {
    activities: data,
    userId: userId
  };
}

// ============================================================================
// MAIN COMPONENT WITH CACHING
// ============================================================================

export default function RecentActivity() {
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // React Query with INSTANT caching
  const { 
    data, 
    isLoading: loading, 
    error: queryError,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['recentActivity', userId],
    queryFn: () => fetchRecentActivityData(userId!, user?.email),
    enabled: !!userId,
    
    // ⚡ INSTANT MODE - matches progress/badges
    staleTime: 0, // Always fresh
    gcTime: 2 * 60 * 1000, // Cache for 2 minutes
    
    // SMART REFETCHING
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  });

  const activities = data?.activities || [];
  const error = queryError?.message || null;

  // Auto-refresh when lessons/modules complete
  useEffect(() => {
    if (!userId) return;

    const handleActivityUpdate = () => {
      console.log('🔄 Activity update detected - refreshing...');
      queryClient.invalidateQueries({ 
        queryKey: ['recentActivity', userId],
        refetchType: 'active'
      });
    };

    const handleLessonComplete = () => {
      console.log('✅ Lesson completed - updating activity...');
      queryClient.invalidateQueries({ 
        queryKey: ['recentActivity', userId],
        refetchType: 'active'
      });
    };

    const handleProgressRefresh = () => {
      console.log('🔄 Progress refresh - updating activity...');
      queryClient.invalidateQueries({ 
        queryKey: ['recentActivity', userId],
        refetchType: 'active'
      });
    };

    // Listen to events
    window.addEventListener('lessonCompleted', handleLessonComplete);
    window.addEventListener('progressRefresh', handleProgressRefresh);
    window.addEventListener('activityUpdate', handleActivityUpdate);
    
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonComplete);
      window.removeEventListener('progressRefresh', handleProgressRefresh);
      window.removeEventListener('activityUpdate', handleActivityUpdate);
    };
  }, [queryClient, userId]);

  // Show only first 3 items initially
  const displayedActivities = isExpanded ? activities : activities.slice(0, 3);
  const hasMoreActivities = activities.length > 3;

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'lesson_completed':
      case 'module_completed':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'module_started':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Activity
      </h3>
      
      {error ? (
        <div className="text-center py-8">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm">
            No recent activity found.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Start learning to see your progress here!
          </p>
        </div>
      ) : (
        <div>
          {/* Activity List - Scrollable when expanded */}
          <div 
            className={`space-y-4 transition-all duration-300 ${
              isExpanded 
                ? 'max-h-64 overflow-y-auto pr-2' 
                : 'max-h-none'
            }`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E1 #F1F5F9'
            }}
          >
            {displayedActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.relativeTime}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* View More/Less Button */}
          {hasMoreActivities && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isExpanded ? (
                  <span className="flex items-center justify-center">
                    Show Less
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    View More ({activities.length - 3} more)
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Scroll indicator when expanded */}
          {isExpanded && activities.length > 6 && (
            <div className="text-center mt-2">
              <p className="text-xs text-gray-400">
                Scroll to see more activities
              </p>
            </div>
          )}
        </div>
      )}

      {/* Custom scrollbar styles for WebKit browsers */}
      <style jsx>{`
        .space-y-4::-webkit-scrollbar {
          width: 6px;
        }
        .space-y-4::-webkit-scrollbar-track {
          background: #F1F5F9;
          border-radius: 3px;
        }
        .space-y-4::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 3px;
        }
        .space-y-4::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  );
}