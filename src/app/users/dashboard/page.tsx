// app/users/dashboard/page.tsx - UPDATED with symmetrical margins
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LearnCard from '../components/LearnCard';
import SearchBar from '../components/SearchBar';
import DashboardStats from '../components/DashboardStats';
import RecommendedNext from '../components/RecommendedNext';
import RecentActivity from '../components/RecentActivity';
import { fetchUserModules, handleModuleClick, UserModule } from '../lib/api';
import { useRightColumn } from '../layout'; // Import the hook
import Image from 'next/image';

// LearnCard2 component (inline since you don't want new files)
const LearnCard2 = () => {
  return (
    <div className="p-6">
      {/* Inner card with rounded corners and border */}
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        {/* Header */}
        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-4 text-center tracking-wide">
          WHAT ARE LEARNING MODULES?
        </h2>

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setRightColumnContent } = useRightColumn(); // Use the hook
  
  // State for modules data
  const [modules, setModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set right column content when component mounts
  useEffect(() => {
    const rightColumnContent = (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Learning Modules Explanation Card */}
        <div className="border-b border-gray-100 dark:border-gray-700">
          <LearnCard2 />
        </div>
        
        {/* Dashboard Stats Section */}
        <div className="border-b border-gray-100 dark:border-gray-700">
          <DashboardStats />
        </div>
        
        {/* Recommended Next Section */}
        <div className="border-b border-gray-100 dark:border-gray-700">
          <RecommendedNext />
        </div>
        
        {/* Recent Activity Section */}
        <div>
          <RecentActivity />
        </div>
      </div>
    );
    
    setRightColumnContent(rightColumnContent);
    
    // Clean up when component unmounts
    return () => {
      setRightColumnContent(null);
    };
  }, [setRightColumnContent]);

  // Authentication and role checking
  useEffect(() => {
    // Redirect unauthenticated users to sign-in
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    // Redirect admin users to admin dashboard
    else if (status === 'authenticated' && session?.user?.role === 'admin') {
      router.push('/admin');
    }
  }, [status, session, router]);

  // Fetch modules data when component mounts
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

  // Handle module card clicks
  const onModuleClick = (moduleId: string, title: string) => {
    handleModuleClick(moduleId, title);
  };

  // Loading state
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

  // Show loading while redirecting admin users
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

  // Show loading while redirecting unauthenticated users
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

  // Main dashboard content
  return (
    <div className="h-full overflow-y-auto">
      <div className="px-20 py-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Welcome back, {session?.user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Continue your learning journey
          </p>
        </div>

        {/* Search Bar Section - Updated margin for symmetry */}
        <SearchBar />

        {/* Learning Modules Section */}
        <div className="mb-6">
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
              console.log('Module data:', module); // Debug log
              return (
                <LearnCard
                  key={module.id}
                  moduleId={module.id} // Added moduleId prop
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
  );
}