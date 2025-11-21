// app/users/components/LearnCard2.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useUserRank } from '@/hooks/use-rank';
import { useQuery } from '@tanstack/react-query';

interface UserProfile {
  name: string;
  email: string;
  createdAt?: string; // To determine if user is new
}

const LearnCard2: React.FC = () => {
  const { data: session } = useSession();
  const { rankInfo, loading: rankLoading } = useUserRank();
  
  // Fetch user profile with caching
  const { 
    data: profile, 
    isLoading: profileLoading 
  } = useQuery({
    queryKey: ['userProfile', session?.user?.email],
    queryFn: async (): Promise<UserProfile> => {
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes - profile data doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Determine if user is new (created within last 7 days)
  const isNewUser = profile?.createdAt 
    ? (Date.now() - new Date(profile.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
    : false;

  // Smart greeting based on user status
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (isNewUser) {
      return "Welcome";
    }
    
    // Time-based greeting for returning users
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  // Use profile name if available, fallback to email prefix or session name
  const displayName = profile?.name 
    || session?.user?.name 
    || session?.user?.email?.split('@')[0] 
    || 'User';
    
  const rankTitle = rankInfo?.name || '';

  // Loading state with skeleton
  const isLoading = profileLoading || rankLoading || !session;

  return (
    <div className="p-6">
      {/* Inner card with rounded corners and border */}
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        {/* Header with Smart Greeting */}
        <div className="mb-4 text-center">
          {isLoading ? (
            // Skeleton loader
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-48 mx-auto"></div>
          ) : (
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {getGreeting()}{rankTitle && `, ${rankTitle}`} {displayName}!
            </h2>
          )}
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
              Earn badges through lessons — different lessons will give you different badges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnCard2;