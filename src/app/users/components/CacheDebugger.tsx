// app/users/components/CacheDebugger.tsx - Development component for cache debugging
'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { CacheHelper } from '@/utils/cache-helper';

export default function CacheDebugger() {
  const { user } = useCurrentUser();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-red-500 text-white p-2 rounded text-xs z-50">
      <div>User: {user?.email}</div>
      <div>ID: {user?.id}</div>
      <button
        onClick={() => CacheHelper.clearProgressCache()}
        className="mt-1 bg-red-600 px-2 py-1 rounded text-xs"
      >
        Clear Cache
      </button>
    </div>
  );
}