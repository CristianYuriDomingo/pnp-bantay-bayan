// app/users/quest/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRightColumn } from '../layout';
import QuestPath from '../components/QuestPath';
import QuestCard from '../components/QuestCard';

export default function QuestPage() {
  const { user, isLoading, isAuthenticated } = useCurrentUser();
  const { setRightColumnContent } = useRightColumn();

  // Set right column content when component mounts
  useEffect(() => {
    const rightColumnContent = (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm w-full">
        <QuestCard />
      </div>
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
        <div className="px-20 pb-6">
          <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex justify-center items-center py-10">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <div className="text-lg text-gray-600">Loading...</div>
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
        <div className="px-20 pb-6">
          <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex flex-col items-center py-10">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
              <p className="text-gray-600 mb-6 text-center">Please sign in to continue.</p>
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
      <div className="px-20 pb-6">
        <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4">
          {/* Main Content - Quest Path */}
          <div className="space-y-6">
            <QuestPath 
              initialLevel={0} 
              initialCompleted={[]} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}