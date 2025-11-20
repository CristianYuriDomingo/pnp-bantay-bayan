// app/users/components/DutyPass.tsx - INSTANT REAL-TIME ⚡
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Ticket, CheckCircle, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUserId, useCurrentUser } from '@/hooks/use-current-user';

interface DutyPassStatus {
  dutyPasses: number;
  currentStreak: number;
  longestStreak: number;
  canClaim: boolean;
  isSunday: boolean;
  lastClaimDate: string | null;
  userId?: string;
}

// ============================================================================
// FETCH FUNCTION
// ============================================================================

async function fetchDutyPassStatus(userId: string, userEmail?: string | null): Promise<DutyPassStatus> {
  console.log(`📡 Fetching duty pass status for user ${userEmail}`);
  
  const response = await fetch('/api/users/duty-pass/claim');
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch duty pass status');
  }
  
  const data = await response.json();
  
  // Security check if API returns userId
  if (data.userId && data.userId !== userId) {
    console.error('Security violation: Received duty pass data for different user');
    throw new Error('Data integrity error - user mismatch');
  }
  
  console.log(`✅ Duty pass loaded for ${userEmail}:`, {
    passes: data.dutyPasses,
    canClaim: data.canClaim,
    isSunday: data.isSunday
  });
  
  return data;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DutyPass() {
  const userId = useCurrentUserId();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ⚡ INSTANT CACHING - Fetch duty pass status
  const { 
    data: status, 
    isLoading: loading, 
    error: queryError,
    isFetching
  } = useQuery({
    queryKey: ['dutyPass', userId],
    queryFn: () => fetchDutyPassStatus(userId!, user?.email),
    enabled: !!userId,
    
    // ⚡ INSTANT MODE
    staleTime: 0, // Always fresh - instant updates
    gcTime: 2 * 60 * 1000, // Cache for 2 minutes
    
    // SMART REFETCHING
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    
    // Check for Sunday transitions every 60 seconds
    refetchInterval: 60 * 1000,
  });

  // Listen for events and invalidate cache
  useEffect(() => {
    if (!userId) return;

    const handleDutyPassClaim = () => {
      console.log('🎫 Duty pass claimed - refreshing...');
      queryClient.invalidateQueries({ 
        queryKey: ['dutyPass', userId],
        refetchType: 'active'
      });
    };

    const handleProgressRefresh = () => {
      console.log('🔄 Progress refresh - updating duty pass...');
      queryClient.invalidateQueries({ 
        queryKey: ['dutyPass', userId],
        refetchType: 'active'
      });
    };

    window.addEventListener('dutyPassClaimed', handleDutyPassClaim);
    window.addEventListener('progressRefresh', handleProgressRefresh);
    
    return () => {
      window.removeEventListener('dutyPassClaimed', handleDutyPassClaim);
      window.removeEventListener('progressRefresh', handleProgressRefresh);
    };
  }, [queryClient, userId]);

  // ⚡ OPTIMISTIC UPDATE - Claim duty pass mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      console.log(`🎫 Claiming duty pass for ${user?.email}`);
      
      const response = await fetch('/api/users/duty-pass/claim', {
        method: 'POST',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim duty pass');
      }

      // Security check
      if (data.data?.userId && data.data.userId !== userId) {
        throw new Error('Security violation in claim response');
      }

      console.log(`✅ Duty pass claimed successfully for ${user?.email}`);
      return data;
    },
    // ⚡ OPTIMISTIC UPDATE - UI feels instant!
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['dutyPass', userId] });
      
      // Snapshot previous value
      const previousStatus = queryClient.getQueryData(['dutyPass', userId]);
      
      // Optimistically update UI immediately
      queryClient.setQueryData<DutyPassStatus>(['dutyPass', userId], (old) => 
        old ? {
          ...old,
          dutyPasses: old.dutyPasses + 1,
          canClaim: false,
          lastClaimDate: new Date().toISOString(),
        } : old
      );
      
      return { previousStatus };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      console.error('Error claiming duty pass, rolling back:', err);
      if (context?.previousStatus) {
        queryClient.setQueryData(['dutyPass', userId], context.previousStatus);
      }
    },
    onSuccess: (data) => {
      // Update with real server data
      queryClient.setQueryData<DutyPassStatus>(['dutyPass', userId], (old) => 
        old ? {
          ...old,
          dutyPasses: data.data.dutyPassesTotal,
          canClaim: false,
          lastClaimDate: data.data.claimedAt,
        } : old
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['dutyPass', userId] });
      queryClient.invalidateQueries({ queryKey: ['overallProgress', userId] });
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('dutyPassClaimed', {
        detail: {
          userId: userId,
          dutyPasses: data.data.dutyPassesTotal,
          claimedAt: data.data.claimedAt
        }
      }));

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleClaim = () => {
    if (!status?.canClaim || claimMutation.isPending) return;
    claimMutation.mutate();
  };

  const error = queryError?.message || claimMutation.error?.message || null;
  const claiming = claimMutation.isPending;

  const getButtonText = () => {
    if (claiming) return 'CLAIMING...';
    if (showSuccess) return 'CLAIMED!';
    if (!status?.isSunday) return 'AVAILABLE ON SUNDAY';
    if (!status?.canClaim) return 'ALREADY CLAIMED';
    return 'CLAIM NOW';
  };

  const getButtonClass = () => {
    const baseClass = "w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2";
    
    if (showSuccess) {
      return `${baseClass} bg-green-500 text-white shadow-md`;
    }
    
    if (!status?.canClaim || claiming) {
      return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }
    
    return `${baseClass} bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg active:scale-95`;
  };

  // Don't show loading skeleton - load in background
  if (loading && !status) {
    return null; // Or return a minimal placeholder
  }

  if (error && !status) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5">
          <div className="text-center py-4">
            <p className="text-red-600 font-semibold mb-2">Error</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        <div className="flex items-center gap-4">
          {/* Duty Pass Image */}
          <div 
            className="flex-shrink-0 transition-all duration-200 relative"
            style={{
              transform: isHovered && status.canClaim ? 'scale(1.05)' : 'scale(1)',
              opacity: status.canClaim ? 1 : 0.6
            }}
          >
            <div className="relative w-20 h-20">
              {!imageError ? (
                <Image
                  src="/Quest/DutyPass.png"
                  alt="Duty Pass"
                  fill
                  sizes="80px"
                  className="object-contain"
                  priority
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <Ticket className="w-10 h-10 text-blue-500" />
                </div>
              )}
            </div>
            
            {/* Pass count badge */}
            {status.dutyPasses > 0 && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-md border-2 border-white dark:border-gray-700">
                {status.dutyPasses}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Duty Pass
              </h3>
              {status.isSunday && (
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Calendar size={12} />
                  Sunday
                </span>
              )}
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
              Protects your streak for one full day. Use on missed quests to maintain progress!
            </p>

            {/* Success message */}
            {showSuccess && (
              <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-2 animate-fade-in">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                  Duty pass claimed successfully! +1
                </span>
              </div>
            )}

            {/* Claim Button */}
            <button
              onClick={handleClaim}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={!status.canClaim || claiming}
              className={getButtonClass()}
              aria-label={getButtonText()}
            >
              {showSuccess && <CheckCircle size={16} />}
              {!showSuccess && status.canClaim && <Ticket size={16} />}
              {getButtonText()}
            </button>

            {/* Next availability info */}
            {!status.canClaim && !status.isSunday && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Next duty pass available this Sunday
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add fade-in animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}