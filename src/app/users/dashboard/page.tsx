// app/users/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LearnCard from '../components/LearnCard';
import LearnCard2 from '../components/LearnCard2'; // Import LearnCard2
import SearchBar from '../components/SearchBar';
import { fetchUserModules, handleModuleClick, UserModule } from '../lib/api';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [modules, setModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    else if (status === 'authenticated' && session?.user?.role === 'admin') {
      router.push('/admin');
    }
  }, [status, session, router]);

  useEffect(() => {
    const loadModules = async () => {
      if (status === 'authenticated' && session?.user?.role !== 'admin') {
        try {
          setLoading(true);
          const response = await fetchUserModules();
          
          if (response.success) {
            setModules(response.data);
          } else {
            setError(response.error || 'Failed to load modules');
          }
        } catch (err) {
          setError('Failed to load modules');
          console.error('Error loading modules:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadModules();
  }, [status, session]);

  const onModuleClick = (moduleId: string, title: string) => {
    handleModuleClick(moduleId, title);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>     
      </div>
    );
  }

  if (status === 'authenticated' && session?.user?.role === 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Redirecting to admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Two-column layout - moved from layout to dashboard page */}
      <div className="flex flex-col lg:flex-row w-full gap-4">
        {/* Left column - 70% */}
        <div className="w-full lg:w-[70%]">
          <div className="p-6">
            {/* Welcome Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Welcome back, {session?.user?.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Continue your learning journey
              </p>
            </div>

            {/* Search Bar Section */}
            <div className="mb-8">
              <SearchBar />
            </div>

            {/* Learning Modules Section */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Available Modules
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a module to start learning
              </p>
            </div>

            {/* Modules Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Loading modules...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : modules.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No modules available yet. Check back later!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => {
                  console.log('Module data:', module);
                  return (
                    <LearnCard
                      key={module.id}
                      moduleId={module.id}
                      imageSrc={module.imageSrc}
                      title={module.title}
                      lessons={module.lessons}
                      buttonText={module.buttonText}
                      isAvailable={module.isAvailable}
                      onCardClick={() => onModuleClick(module.id, module.title)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - 30% - Dashboard specific content */}
        <div className="w-full lg:w-[30%] lg:sticky lg:top-4 h-fit max-h-screen bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-lg shadow flex flex-col gap-4 overflow-y-auto">
          <div className="p-4">
            <LearnCard2 />
          </div>
        </div>
      </div>
    </div>
  );
}