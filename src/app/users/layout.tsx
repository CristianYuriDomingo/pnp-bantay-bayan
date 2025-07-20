// app/users/layout.tsx
'use client';

import { ReactNode, useState, createContext, useContext } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface UsersLayoutProps {
  children: ReactNode;
}

// Context for right column content
const RightColumnContext = createContext<{
  rightColumnContent: ReactNode | null;
  setRightColumnContent: (content: ReactNode | null) => void;
}>({
  rightColumnContent: null,
  setRightColumnContent: () => {},
});

export const useRightColumn = () => useContext(RightColumnContext);

export default function UsersLayout({ children }: UsersLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isDropdownVisible, setDropdownVisible] = useState(true);
  const [rightColumnContent, setRightColumnContent] = useState<ReactNode | null>(null);

  // Check if current page should render without sidebar
  const isLessonPage = pathname.includes('/lessons/');
  const isQuizStartPage = pathname.includes('/quizStart/');
  // Add quiz start pages to full page layout
  const isFullPageLayout = isLessonPage || isQuizStartPage;

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/auth/signin',
      redirect: true,
    });
  };

  const navigation = [
    { 
      name: 'Learning Modules', 
      href: '/users/dashboard', 
      icon: '/DashboardImage/learn.png',
      alt: 'Dashboard'
    },
    { 
      name: 'Quiz', 
      href: '/users/quiz', 
      icon: '/DashboardImage/quiz.png',
      alt: 'Quiz'
    },
    { 
      name: 'Profile', 
      href: '/users/profile', 
      icon: '/DashboardImage/profile.png',
      alt: 'Profile'
    },
    { 
      name: 'Settings', 
      href: '/users/settings', 
      icon: '/DashboardImage/setting.png',
      alt: 'Settings'
    },
  ];

  // If it's a lesson page or quiz start page, render without sidebar
  if (isFullPageLayout) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  // Default dashboard layout with responsive sidebar (includes regular quiz page)
  return (
    <RightColumnContext.Provider value={{ rightColumnContent, setRightColumnContent }}>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        {/* Decorative fixed blobs */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-30 transform translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full opacity-20 transform -translate-x-1/3 translate-y-1/4"></div>
          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-[#7bc8ff] rounded-full opacity-20"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-green-100 rounded-full opacity-20"></div>
        </div>

        <div className="flex h-screen relative z-10">
          {/* Sidebar - Responsive width */}
          <aside
            className="fixed top-0 left-0 z-40 h-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 transition-all duration-300 ease-in-out
                       w-16 md:w-72 border-r border-gray-200 dark:border-gray-700"
            aria-label="Sidebar"
          >
            <div className="h-full px-2 md:px-3 py-4 overflow-y-auto flex flex-col">
              {/* Logo - Enhanced size */}
              <div className="flex justify-center items-center mb-4">
                {/* Small screen logo - only visible on small screens */}
                <Image
                  src="/MainImage/Pibi.png"
                  className="h-10 w-auto md:hidden"
                  alt="Bantay Bayan Logo"
                  width={40}
                  height={40}
                />
                {/* Large screen logo - enhanced size for medium+ screens */}
                <Image
                  src="/DashboardImage/logo.png"
                  className="hidden md:block h-20 w-auto"
                  alt="Bantay Bayan Logo"
                  width={180}
                  height={130}
                />
              </div>

              {/* Navigation Menu */}
              <nav className="flex-1">
                <ul className="space-y-2 md:space-y-4 font-medium">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center p-3 md:p-4 rounded-lg transition-all duration-200 group relative
                            ${isActive
                              ? 'text-gray-900 dark:text-white bg-blue-100 dark:bg-gray-700 border border-blue-300 dark:border-gray-600'
                              : 'text-gray-900 dark:text-white hover:bg-blue-100 dark:hover:bg-gray-700'
                            }`}
                          title={item.name} // Tooltip for small screens
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
                          {/* Text only visible on medium screens and up */}
                          <span className="hidden md:block ml-3 text-lg uppercase">
                            {item.name}
                          </span>
                          
                          {/* Tooltip for small screens */}
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 md:hidden">
                            {item.name}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                  
                  {/* Divider */}
                  <hr className="border-t-2 border-gray-200 dark:border-gray-700 my-4" />
                  
                  {/* Remember Alert - Positioned above Sign Out like in the image */}
                  {isDropdownVisible && (
                    <li className="hidden md:block mb-4">
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
                  
                  {/* Sign Out */}
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center p-3 md:p-4 rounded-lg text-gray-900 dark:text-white hover:bg-red-100 dark:hover:bg-red-700 transition-all duration-200 group relative"
                      title="Sign Out"
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
                      <span className="hidden md:block ml-3 text-lg uppercase">
                        Sign Out
                      </span>
                      
                      {/* Tooltip for small screens */}
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 md:hidden">
                        Sign Out
                      </div>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main content - Responsive margin */}
          <div className="flex-1 ml-16 md:ml-72 transition-all duration-300 ease-in-out">
            <div className="p-4">
              {/* Two-column layout */}
              <div className="flex flex-col lg:flex-row w-full gap-4">
                {/* Left column - 70% with aligned top spacing */}
                <div className="w-full lg:w-[70%]">
                  <div className="h-full overflow-hidden">
                    {children}
                  </div>
                </div>
                
                {/* Right column - 30% */}
                <div className="w-full lg:w-[30%] lg:sticky lg:top-4 h-fit max-h-screen bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-lg shadow flex flex-col gap-4 overflow-y-auto">
                  {/* Dynamic content from pages or default placeholder */}
                  {rightColumnContent || (
                    <div className="p-4 bg-gray-50/80 dark:bg-gray-700/80 rounded-lg backdrop-blur-sm">
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                        Right Column Content
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        This is the right column placeholder. You can add any content here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* This was the missing closing div! */}
    </RightColumnContext.Provider>
  );
}