// app/users/profile/page.tsx
'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import AchievementsUI from '../components/Achievement';
import ProfileSettings from '../components/ProfileSettings';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  // ✅ Using your existing user context system
  const { user, isLoading, isAuthenticated } = useCurrentUser();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // This should rarely happen due to layout protection, but just in case
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <Link 
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Profile Settings Section */}
      <div className="mb-6">
        <ProfileSettings />
      </div>

      {/* Achievements Section */}
      <div className="bg-gray-50">
        <AchievementsUI />
      </div>
    </>
  );
}