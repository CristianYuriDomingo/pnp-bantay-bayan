// app/users/profile/page.tsx
'use client';

import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h1>
          
          <div className="space-y-4 text-gray-700">
            <p className="text-lg">Welcome to your profile page, {session?.user?.name || 'User'}!</p>
            <p className="text-lg">This is your personal dashboard where you can manage your account.</p>
            <p className="text-lg">You can view your learning progress and achievements here.</p>
            <p className="text-lg">Update your preferences and settings as needed.</p>
            <p className="text-lg">Thank you for being part of the Bantay Bayan community!</p>
          </div>
        </div>
      </div>
    </div>
  );
}