// app/users/dashboard/page.tsx 
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import LearnCard from '../components/LearnCard';
import SearchBar from '../components/SearchBar';
import DashboardStats from '../components/DashboardStats';
import RecommendedNext from '../components/RecommendedNext';
import RecentActivity from '../components/RecentActivity';
import LearnCard2 from '../components/LearnCard2';
import { fetchUserModules, handleModuleClick, UserModule } from '../lib/api';
import { useRightColumn } from '../layout';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setRightColumnContent } = useRightColumn();
  
  // State for modules data
  const [modules, setModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize right column content to prevent unnecessary re-renders
  const rightColumnContent = useMemo(() => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm w-full">
      {/* Learning Modules Explanation Card with Rank Info */}
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
      <div className="border-b border-gray-100 dark:border-gray-700">
        <RecentActivity />
      </div>

      {/* Footer Links */}
      <div className="pt-4 pb-2 px-4">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
          <Link href="/users/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Privacy
          </Link>
          <Link href="/users/about" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            About
          </Link>
          <Link href="/users/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </div>
  ), []); // Empty dependency array since content is static

  // Set right column content when component mounts
  useEffect(() => {
    setRightColumnContent(rightColumnContent);
    
    // Clean up when component unmounts
    return () => {
      setRightColumnContent(null);
    };
  }, [setRightColumnContent, rightColumnContent]);

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

  // Memoized load modules function
  const loadModules = useCallback(async () => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const response = await fetchUserModules();
        
        if (response.success) {
          setModules(response.data);
        } else {
          setError(response.error || 'Failed to load modules');
        }
      } catch (err) {
        setError('Failed to load modules. Please try again.');
        console.error('Error loading modules:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [status, session]);

  // Fetch modules data when component mounts
  useEffect(() => {
    loadModules();
  }, [loadModules]);

  // Memoized module click handler
  const onModuleClick = useCallback((moduleId: string, title: string) => {
    handleModuleClick(moduleId, title);
  }, []);

  // Loading component (reusable)
  const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );

  // Loading state
  if (status === 'loading') {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Show loading while redirecting admin users
  if (status === 'authenticated' && session?.user?.role === 'admin') {
    return <LoadingSpinner message="Redirecting to admin dashboard..." />;
  }

  // Show loading while redirecting unauthenticated users
  if (status === 'unauthenticated') {
    return <LoadingSpinner message="Redirecting to sign in..." />;
  }

  // Main dashboard content
  return (
    <div className="h-full overflow-y-auto">
      {/* Responsive padding: consistent symmetrical margins on all screen sizes */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-3 sm:py-4 md:py-6 max-w-[1600px] mx-auto">
        {/* Search Bar Section */}
        <div className="mb-4 sm:mb-6">
          <SearchBar />
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h3 className="text-red-600 dark:text-red-400 font-semibold">Error Loading Modules</h3>
            </div>
            <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
            <button 
              onClick={loadModules} 
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Retry
            </button>
          </div>
        ) : modules.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              No modules available yet
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Check back later for new learning content!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-6 justify-items-center">
            {modules.map((module) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}