// app/users/profile/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import AchievementsUI from '../components/Achievement';
import ProfileSettings from '../components/ProfileSettings';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Settings Section */}
        <div className="mb-6">
          <ProfileSettings />
        </div>

        {/* Achievements Section */}
        <div className="bg-gray-50">
          <AchievementsUI />
        </div>
      </div>
    </div>
  );
}