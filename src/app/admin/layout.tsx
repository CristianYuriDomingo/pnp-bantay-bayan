// app/admin/layout.tsx
'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MoreHorizontal
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/users');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
    return null;
  }

  const sidebarItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      href: '/admin',
      description: 'Overview & Statistics',
      icon: '/AdminImage/dashboard.png',
      alt: 'Dashboard'
    },
    { 
      id: 'users', 
      label: 'User Management', 
      href: '/admin/users',
      description: 'Manage Users & Roles',
      icon: '/AdminImage/users.png',
      alt: 'Users'
    },
    { 
      id: 'content', 
      label: 'Content Management', 
      href: '/admin/content',
      description: 'Modules & Lessons',
      icon: '/AdminImage/content.png',
      alt: 'Content'
    },
    { 
      id: 'quest', 
      label: 'Quest Management', 
      href: '/admin/quest',
      description: 'Quest',
      icon: '/AdminImage/quest.png',
      alt: 'Quest'
    },
    { 
      id: 'quiz', 
      label: 'Quiz Management', 
      href: '/admin/quiz',
      description: 'Questions & Assessments',
      icon: '/AdminImage/quiz.png',
      alt: 'Quiz'
    },
    { 
      id: 'badges', 
      label: 'Badge Management', 
      href: '/admin/badges',
      description: 'Achievement Badges',
      icon: '/AdminImage/badges.png',
      alt: 'Badges'
    },
    { 
      id: 'manual', 
      label: 'User Manual', 
      href: '/admin/manual',
      description: 'Documentation & Guide',
      icon: '/AdminImage/manual.png',
      alt: 'User Manual'
    },
  ];
  
  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href) && pathname !== '/admin';
  };

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/auth/signin',
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background decorations */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-30 transform translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full opacity-20 transform -translate-x-1/3 translate-y-1/4"></div>
      </div>

      {/* DESKTOP SIDEBAR - Hidden on mobile, visible on large screens */}
      <aside
        className="hidden lg:block fixed top-0 left-0 z-40 h-full bg-white/80 backdrop-blur-sm transition-all duration-300 ease-in-out w-72 border-r border-gray-200 shadow-lg"
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-blue-100 text-sm mt-1">Welcome, {session?.user?.name}</p>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {sidebarItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center p-4 rounded-lg transition-all duration-200 group
                      ${active
                        ? 'text-gray-900 bg-blue-100 border border-blue-300'
                        : 'text-gray-900 hover:bg-blue-100'
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
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Actions - Always visible at bottom */}
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{session?.user?.name}</div>
                <div className="text-xs text-gray-500">{session?.user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <Image
                src="/AdminImage/sign-out.png"
                className="w-4 h-4 brightness-0 invert"
                alt="Sign Out"
                width={16}
                height={16}
              />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* TABLET SIDEBAR - Icon only with tooltips, visible on medium screens */}
      <aside
        className="hidden md:block lg:hidden fixed top-0 left-0 z-40 h-full bg-white/80 backdrop-blur-sm transition-all duration-300 ease-in-out w-20 border-r border-gray-200 shadow-lg"
        aria-label="Sidebar"
      >
        <div className="h-full px-2 py-4 overflow-y-auto flex flex-col">
          <div className="flex justify-center items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
          </div>

          <nav className="flex-1">
            <ul className="space-y-3 font-medium">
              {sidebarItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative
                        ${active
                          ? 'text-gray-900 bg-blue-100 border border-blue-300'
                          : 'text-gray-900 hover:bg-blue-100'
                        }`}
                      title={item.label}
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
                        {item.label}
                        <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </Link>
                  </li>
                );
              })}
              
              <hr className="border-t-2 border-gray-200 my-3" />
              
              <li>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center p-3 rounded-lg text-gray-900 hover:bg-red-100 transition-all duration-200 group relative"
                  title="Sign Out"
                >
                  <div className="flex items-center justify-center w-7 h-7">
                    <Image
                      src="/AdminImage/sign-out.png"
                      className="w-7 h-7"
                      alt="Sign Out"
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
      <div className="md:ml-20 lg:ml-72 transition-all duration-300 ease-in-out pb-20 md:pb-0">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b px-4 md:px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                {sidebarItems.find(item => isActive(item.href))?.label || 'Admin Panel'}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {sidebarItems.find(item => isActive(item.href))?.description || 'Manage your application'}
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content - Scrollable */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION - Visible only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
        <ul className="flex justify-around items-center h-16 px-2">
          {sidebarItems.slice(0, 4).map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.id} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center h-full transition-all duration-200 rounded-lg mx-1
                    ${active
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 mb-1 transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                    <Image
                      src={item.icon}
                      className="w-7 h-7"
                      alt={item.alt}
                      width={28}
                      height={28}
                      style={{ filter: active ? 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(192deg) brightness(97%) contrast(89%)' : 'none' }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${active ? 'font-bold' : ''}`}>
                    {item.label.split(' ')[0]}
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
                ${(isActive('/admin/quiz') || isActive('/admin/badges') || isActive('/admin/manual'))
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <MoreHorizontal className={`w-6 h-6 mb-1 transition-transform duration-200 ${(isActive('/admin/quiz') || isActive('/admin/badges') || isActive('/admin/manual')) ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium ${(isActive('/admin/quiz') || isActive('/admin/badges') || isActive('/admin/manual')) ? 'font-bold' : ''}`}>
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
                <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  {sidebarItems.slice(4).map((item) => {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Image
                          src={item.icon}
                          className="w-5 h-5 mr-3"
                          alt={item.alt}
                          width={20}
                          height={20}
                        />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                  <div className="border-t border-gray-200"></div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <Image
                      src="/AdminImage/sign-out.png"
                      className="w-5 h-5 mr-3"
                      alt="Sign Out"
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
  );
}