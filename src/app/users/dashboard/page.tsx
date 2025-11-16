// app/users/dashboard/page.tsx 
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  // Set right column content when component mounts
  useEffect(() => {
    const rightColumnContent = (
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-6 justify-items-center">
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
  );
}