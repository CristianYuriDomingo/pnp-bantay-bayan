// app/admin/layout.tsx
'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
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
      icon: '📊', 
      href: '/admin/dashboard',
      description: 'Overview & Statistics'
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: '👥', 
      href: '/admin/users',
      description: 'Manage Users & Roles'
    },
    { 
      id: 'content', 
      label: 'Content Management', 
      icon: '📚', 
      href: '/admin/content',
      description: 'Modules & Lessons'
    },
    { 
      id: 'quiz', 
      label: 'Quiz Management', 
      icon: '📝', 
      href: '/admin/quiz',
      description: 'Questions & Assessments'
    },
    { 
      id: 'badges', 
      label: 'Badge Management', 
      icon: '🏆', 
      href: '/admin/badges',
      description: 'Achievement Badges'
    },
    { 
      id: 'interface', 
      label: 'Interface Control', 
      icon: '⚙️', 
      href: '/admin/interface',
      description: 'App Settings & UI'
    },
  ];
  
  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-lg flex flex-col z-50">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-blue-100 text-sm mt-1">Welcome, {session?.user?.name}</p>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`block w-full text-left p-4 rounded-lg transition-all duration-200 group ${
                  isActive(item.href)
                    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                  {isActive(item.href) && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </Link>
            ))}
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
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content - With left margin to account for fixed sidebar */}
      <div className="ml-72 flex flex-col min-h-screen">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {sidebarItems.find(item => isActive(item.href))?.label || 'Admin Panel'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {sidebarItems.find(item => isActive(item.href))?.description || 'Manage your application'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
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
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}