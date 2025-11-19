// app/users/components/DutyPass.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Ticket, Loader2, CheckCircle, Calendar } from 'lucide-react';

interface DutyPassStatus {
  dutyPasses: number;
  currentStreak: number;
  longestStreak: number;
  canClaim: boolean;
  isSunday: boolean;
  lastClaimDate: string | null;
}

export default function DutyPass() {
  const [status, setStatus] = useState<DutyPassStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/duty-pass/claim');
      
      if (!response.ok) {
        throw new Error('Failed to fetch duty pass status');
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Error fetching duty pass status:', err);
      setError('Failed to load duty pass status');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!status?.canClaim || claiming) return;

    try {
      setClaiming(true);
      setError(null);
      
      const response = await fetch('/api/users/duty-pass/claim', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim duty pass');
      }

      // Update status with new values
      setStatus(prev => prev ? {
        ...prev,
        dutyPasses: data.data.dutyPassesTotal,
        canClaim: false,
        lastClaimDate: data.data.claimedAt,
      } : null);

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (err: any) {
      console.error('Error claiming duty pass:', err);
      setError(err.message || 'Failed to claim duty pass');
    } finally {
      setClaiming(false);
    }
  };

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="animate-spin text-blue-500" size={24} />
            <span className="text-gray-600 dark:text-gray-400">Loading duty pass...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5">
          <div className="text-center py-4">
            <p className="text-red-600 font-semibold mb-2">Error</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchStatus}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        <div className="flex items-center gap-4">
          {/* Duty Pass Image */}
          <div 
            className="flex-shrink-0 transition-all duration-200 relative"
            style={{
              transform: isHovered && status?.canClaim ? 'scale(1.05)' : 'scale(1)',
              opacity: status?.canClaim ? 1 : 0.6
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
                // Fallback if image fails to load
                <div className="w-full h-full bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <Ticket className="w-10 h-10 text-blue-500" />
                </div>
              )}
            </div>
            
            {/* Pass count badge */}
            {status && status.dutyPasses > 0 && (
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
              {status?.isSunday && (
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
              <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-2">
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
              disabled={!status?.canClaim || claiming}
              className={getButtonClass()}
              aria-label={getButtonText()}
            >
              {claiming && <Loader2 size={16} className="animate-spin" />}
              {showSuccess && <CheckCircle size={16} />}
              {!claiming && !showSuccess && status?.canClaim && <Ticket size={16} />}
              {getButtonText()}
            </button>

            {/* Next availability info */}
            {status && !status.canClaim && !status.isSunday && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Next duty pass available this Sunday
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}