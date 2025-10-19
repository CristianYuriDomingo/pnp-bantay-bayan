// app/users/components/LearnCard2.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useUserRank } from '@/hooks/use-rank';

interface UserProfile {
  name: string;
  email: string;
}

const LearnCard2: React.FC = () => {
  const { data: session } = useSession();
  const { rankInfo } = useUserRank();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile to get the name
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/users/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.data);
        } else {
          console.error('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user]);

  // Use profile name if available, fallback to email prefix
  const displayName = profile?.name || session?.user?.email?.split('@')[0] || 'User';
  const rankTitle = rankInfo?.name || '';

  return (
    <div className="p-6">
      {/* Inner card with rounded corners and border */}
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        {/* Header with Welcome Message */}
        <div className="mb-4 text-center">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Welcome back, {rankTitle} {displayName}!
          </h2>
        </div>

        {/* Main content */}
        <div className="flex items-center">
          {/* Character image */}
          <div className="w-20 h-20 relative mr-4 flex-shrink-0">
            <Image
              src="/MainImage/PibiTeach.png"
              alt="Learning mascot"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>

          {/* Text Content */}
          <div className="flex-1">
            {/* Bold statement */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              Read lesson. Finish. <br />
              Earn Badge.
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Earn Badge through lessons, different lessons will give you different badges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnCard2;