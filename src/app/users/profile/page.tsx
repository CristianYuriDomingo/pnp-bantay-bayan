// app/users/profile/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import AchievementsUI from '../components/Achievement';
import ProfileSettings from '../components/ProfileSettings';
import BadgeCollection from '../components/BadgeCollection';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRightColumn } from '../layout';
import Image from 'next/image';

// ProfileCard component styled like QuizCard from Quiz page
const ProfileCard = () => {
  return (
    <div className="p-6">
      {/* Inner card with rounded corners and border */}
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        {/* Header */}
        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-4 text-center tracking-wide">
          YOUR ACHIEVEMENTS
        </h2>

        {/* Main content */}
        <div className="flex items-center">
          {/* Character image */}
          <div className="w-20 h-20 relative mr-4 flex-shrink-0">
            <Image
              src="/ProfileImage/ProfileMascot.png"
              alt="Profile mascot"
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
              Your Learning Journey. <br />
              Unlock Achievements.
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Track your progress and celebrate your milestones. Complete lessons and quizzes to earn badges and showcase your learning achievements!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useCurrentUser();
  const { setRightColumnContent } = useRightColumn();

  // Set right column content when component mounts
  useEffect(() => {
    const rightColumnContent = (
      <AchievementsUI />
    );
    
    setRightColumnContent(rightColumnContent);
    
    // Clean up when component unmounts
    return () => {
      setRightColumnContent(null);
    };
  }, [setRightColumnContent]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-20 py-6">
          <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="w-full flex justify-center mb-2">
              <Image
                src="/ProfileImage/ProfileHeader.png"
                alt="Profile Header"
                width={400}
                height={140}
                className="w-full max-w-[400px] h-auto"
              />
            </div>
            <div className="flex justify-center items-center py-10">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <div className="text-lg text-gray-600">Loading your profile...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-20 py-6">
          <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="w-full flex justify-center mb-2">
              <Image
                src="/ProfileImage/ProfileHeader.png"
                alt="Profile Header"
                width={400}
                height={140}
                className="w-full max-w-[400px] h-auto"
              />
            </div>
            <div className="flex flex-col items-center py-10">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
              <p className="text-gray-600 mb-6 text-center">Please sign in to view your profile.</p>
              <Link 
                href="/auth/signin"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-20 py-6">
        <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4">
          {/* Profile Settings Section - Main Content */}
          <div className="space-y-6">
            <ProfileSettings />
            
            {/* Badge Collection Section */}
            <div className="mt-6">
              <BadgeCollection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}