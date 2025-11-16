// app/users/layout.tsx
'use client';

import { ReactNode, useState, createContext, useContext, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Loader2 } from 'lucide-react';
import { checkAndNotifyNewAchievements } from '@/lib/achievement-notifier';
import { useAchievementNotification } from '@/contexts/achievement-notification-context';

interface UsersLayoutProps {
  children: ReactNode;
}

const RightColumnContext = createContext<{
  rightColumnContent: ReactNode | null;
  setRightColumnContent: (content: ReactNode | null) => void;
}>({
  rightColumnContent: null,
  setRightColumnContent: () => {},
});

export const useRightColumn = () => useContext(RightColumnContext);

export default function UsersLayout({ children }: UsersLayoutProps) {
  const { user, isLoading } = useCurrentUser();
  const pathname = usePathname();
  const [isDropdownVisible, setDropdownVisible] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightColumnContent, setRightColumnContent] = useState<ReactNode | null>(null);
  const { isReady } = useAchievementNotification();
  const hasCheckedInitial = useRef(false);
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (!user || !isReady) return;

    if (!hasCheckedInitial.current) {
      console.log('🚀 Initial achievement check');
      hasCheckedInitial.current = true;
      setTimeout(() => {
        checkAndNotifyNewAchievements();
      }, 300);
    }
  }, [user, isReady]);

  useEffect(() => {
    if (!user || !isReady) return;
    
    if (hasCheckedInitial.current && lastPathname.current !== pathname) {
      console.log('🔄 Route changed, checking achievements');
      lastPathname.current = pathname;
      checkAndNotifyNewAchievements();
    }
  }, [pathname, user, isReady]);

  useEffect(() => {
    if (!user || !isReady) return;

    const interval = setInterval(() => {
      console.log('⏰ Periodic achievement check');
      checkAndNotifyNewAchievements();
    }, 15000);

    return () => clearInterval(interval);
  }, [user, isReady]);

  const isLessonPage = pathname.includes('/lessons/');
  const isQuizStartPage = pathname.includes('/quizStart/');
  const isFullPageLayout = isLessonPage || isQuizStartPage;
  const shouldHideRightColumn = rightColumnContent === null;

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/auth/signin',
      redirect: true,
    });
  };

  const navigation = [
    { 
      name: 'Learn', 
      href: '/users/dashboard', 
      icon: '/DashboardImage/learn.png',
      alt: 'Dashboard'
    },
    { 
      name: 'Quest', 
      href: '/users/quest', 
      icon: '/DashboardImage/quest.png',
      alt: 'Quest'
    },
    { 
      name: 'Quiz', 
      href: '/users/quiz', 
      icon: '/DashboardImage/quiz.png',
      alt: 'Quiz'
    },
    { 
      name: 'Leaderboard',
      href: '/users/leaderboard', 
      icon: '/DashboardImage/leaderboard.png', 
      alt: 'Leaderboard',
    },
    { 
      name: 'Profile', 
      href: '/users/profile', 
      icon: '/DashboardImage/profile.png',
      alt: 'Profile'
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access this area.</p>
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

  if (isFullPageLayout) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <RightColumnContext.Provider value={{ rightColumnContent, setRightColumnContent }}>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        {/* Background decorations */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-30 transform translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full opacity-20 transform -translate-x-1/3 translate-y-1/4"></div>
          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-[#7bc8ff] rounded-full opacity-20"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-green-100 rounded-full opacity-20"></div>
        </div>

        <div className="flex flex-col lg:flex-row h-screen relative z-10">
          {/* DESKTOP SIDEBAR - Hidden on mobile, visible on large screens */}
          <aside
            className="hidden lg:block fixed top-0 left-0 z-40 h-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 transition-all duration-300 ease-in-out w-64 border-r border-gray-200 dark:border-gray-700"
            aria-label="Sidebar"
          >
            <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
              <div className="flex justify-center items-center mb-4">
                <Image
                  src="/DashboardImage/logo.png"
                  className="h-20 w-auto"
                  alt="Bantay Bayan Logo"
                  width={180}
                  height={130}
                />
              </div>

              <nav className="flex-1">
                <ul className="space-y-4 font-medium">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center p-4 rounded-lg transition-all duration-200 group
                            ${isActive
                              ? 'text-gray-900 dark:text-white bg-blue-100 dark:bg-gray-700 border border-blue-300 dark:border-gray-600'
                              : 'text-gray-900 dark:text-white hover:bg-blue-100 dark:hover:bg-gray-700'
                            }`}
                        >
                          <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                            <Image
                              src={item.icon}
                              className="w-6 h-6"
                              alt={item.alt}
                              width={24}
                              height={24}
                            />
                          </div>
                          <span className="ml-3 text-lg uppercase">
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                  
                  <hr className="border-t-2 border-gray-200 dark:border-gray-700 my-4" />
                  
                  {isDropdownVisible && (
                    <li className="mb-4">
                      <div
                        className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800"
                        role="alert"
                      >
                        <div className="flex items-center mb-3">
                          <span className="bg-orange-100 text-orange-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded-sm dark:bg-orange-200 dark:text-orange-900">
                            Remember!
                          </span>
                          <button
                            type="button"
                            className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 inline-flex justify-center items-center w-6 h-6 text-blue-900 rounded-lg focus:ring-2 focus:ring-blue-400 p-1 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800"
                            aria-label="Close"
                            onClick={() => setDropdownVisible(false)}
                          >
                            <span className="sr-only">Close</span>
                            <svg
                              className="w-2.5 h-2.5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 14 14"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                              />
                            </svg>
                          </button>
                        </div>
                        <p className="mb-3 text-sm text-blue-800 dark:text-blue-400">
                          Do not ignore any suspicious activity—report it immediately to authorities.
                        </p>
                        <a
                          className="text-sm text-blue-800 underline font-medium hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          href="#"
                        >
                          Contact the Police
                        </a>
                      </div>
                    </li>
                  )}
                  
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center p-4 rounded-lg text-gray-900 dark:text-white hover:bg-red-100 dark:hover:bg-red-700 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                        <Image
                          src="/DashboardImage/sign-out.png"
                          className="w-6 h-6"
                          alt="Logout"
                          width={24}
                          height={24}
                        />
                      </div>
                      <span className="ml-3 text-lg uppercase">
                        Sign Out
                      </span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* TABLET SIDEBAR - Icon only with tooltips, visible on medium screens */}
          <aside
            className="hidden md:block lg:hidden fixed top-0 left-0 z-40 h-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 transition-all duration-300 ease-in-out w-20 border-r border-gray-200 dark:border-gray-700"
            aria-label="Sidebar"
          >
            <div className="h-full px-2 py-4 overflow-y-auto flex flex-col">
              <div className="flex justify-center items-center mb-6">
                <Image
                  src="/MainImage/Pibi.png"
                  className="h-10 w-auto"
                  alt="Bantay Bayan Logo"
                  width={40}
                  height={40}
                />
              </div>

              <nav className="flex-1">
                <ul className="space-y-3 font-medium">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative
                            ${isActive
                              ? 'text-gray-900 dark:text-white bg-blue-100 dark:bg-gray-700 border border-blue-300 dark:border-gray-600'
                              : 'text-gray-900 dark:text-white hover:bg-blue-100 dark:hover:bg-gray-700'
                            }`}
                          title={item.name}
                        >
                          <div className="flex items-center justify-center w-7 h-7">
                            <Image
                              src={item.icon}
                              className="w-7 h-7"
                              alt={item.alt}
                              width={28}
                              height={28}
                            />
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                            {item.name}
                            <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                  
                  <hr className="border-t-2 border-gray-200 dark:border-gray-700 my-3" />
                  
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center p-3 rounded-lg text-gray-900 dark:text-white hover:bg-red-100 dark:hover:bg-red-700 transition-all duration-200 group relative"
                      title="Sign Out"
                    >
                      <div className="flex items-center justify-center w-7 h-7">
                        <Image
                          src="/DashboardImage/sign-out.png"
                          className="w-7 h-7"
                          alt="Logout"
                          width={28}
                          height={28}
                        />
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                        Sign Out
                        <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 md:ml-20 lg:ml-64 transition-all duration-300 ease-in-out pb-20 md:pb-0">
            <div className="p-4">
              {shouldHideRightColumn ? (
                <div className="w-full">
                  <div className="h-full overflow-hidden">
                    {children}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col xl:flex-row w-full gap-4">
                  <div className="w-full xl:w-[70%]">
                    <div className="h-full overflow-hidden">
                      {children}
                    </div>
                  </div>
                  
                  <div className="w-full xl:w-[30%] xl:sticky xl:top-4 h-fit flex flex-col gap-4">
                    {rightColumnContent}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE BOTTOM NAVIGATION - Visible only on mobile */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800/95">
            <ul className="flex justify-around items-center h-16 px-2">
              {navigation.slice(0, 4).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name} className="flex-1">
                    <Link
                      href={item.href}
                      className={`flex flex-col items-center justify-center h-full transition-all duration-200 rounded-lg mx-1
                        ${isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      <div className={`flex items-center justify-center w-7 h-7 mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                        <Image
                          src={item.icon}
                          className="w-7 h-7"
                          alt={item.alt}
                          width={28}
                          height={28}
                          style={{ filter: isActive ? 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(192deg) brightness(97%) contrast(89%)' : 'none' }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
              
              {/* More menu with dropdown */}
              <li className="flex-1 relative">
                <button
                  onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                  className={`flex flex-col items-center justify-center h-full w-full transition-all duration-200 rounded-lg mx-1
                    ${pathname === '/users/profile'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 mb-1 transition-transform duration-200 ${pathname === '/users/profile' ? 'scale-110' : ''}`}>
                    <Image
                      src="/DashboardImage/more.png"
                      className="w-7 h-7"
                      alt="More"
                      width={28}
                      height={28}
                      style={{ filter: pathname === '/users/profile' ? 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(192deg) brightness(97%) contrast(89%)' : 'none' }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${pathname === '/users/profile' ? 'font-bold' : ''}`}>
                    More
                  </span>
                </button>
                
                {/* Dropdown menu */}
                {isMobileMenuOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      <Link
                        href="/users/profile"
                        className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Image
                          src="/DashboardImage/profile.png"
                          className="w-5 h-5 mr-3"
                          alt="Profile"
                          width={20}
                          height={20}
                        />
                        <span className="text-sm font-medium">Profile</span>
                      </Link>
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Image
                          src="/DashboardImage/sign-out.png"
                          className="w-5 h-5 mr-3"
                          alt="Logout"
                          width={20}
                          height={20}
                        />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </RightColumnContext.Provider>
  );
}