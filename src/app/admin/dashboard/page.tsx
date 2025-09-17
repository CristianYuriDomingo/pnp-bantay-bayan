// app/admin/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Stats, RecentActivity } from '../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      if (!statsResponse.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch activity
      try {
        const activityResponse = await fetch('/api/admin/activity');
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData);
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
        // Fallback mock data
        setRecentActivity([
          {
            id: '1',
            type: 'user_registered',
            description: 'New user registered',
            timestamp: new Date().toISOString(),
            user: 'john.doe@email.com'
          },
          {
            id: '2',
            type: 'lesson_completed',
            description: 'Lesson "Crime Prevention" completed',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: 'jane.smith@email.com'
          },
          {
            id: '3',
            type: 'module_created',
            description: 'New module "Safety Protocols" created',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: '4',
            type: 'badge_earned',
            description: 'Badge "Crime Prevention Expert" earned',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            user: 'alice.brown@email.com'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Safe value getter
  const getStatValue = (value?: number) => {
    return value?.toString() ?? '0';
  };

  const statItems = [
    { 
      title: 'Total Users', 
      value: getStatValue(stats?.totalUsers), 
      color: 'blue',
      icon: '👥',
      change: stats?.newUsersThisWeek ? `+${stats.newUsersThisWeek} this week` : undefined,
      href: '/admin/users'
    },
    { 
      title: 'Total Modules', 
      value: getStatValue(stats?.totalModules), 
      color: 'green',
      icon: '📚',
      href: '/admin/content'
    },
    { 
      title: 'Total Lessons', 
      value: getStatValue(stats?.totalLessons), 
      color: 'purple',
      icon: '📖',
      href: '/admin/content'
    },
    { 
      title: 'Total Badges', 
      value: getStatValue(stats?.totalBadges), 
      color: 'yellow',
      icon: '🏆',
      href: '/admin/badges'
    }
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered': return '👤';
      case 'lesson_completed': return '✅';
      case 'module_created': return '📚';
      case 'quiz_submitted': return '📝';
      case 'badge_earned': return '🏆';
      case 'badge_created': return '⭐';
      default: return '📋';
    }
  };

  const quickActions = [
    {
      title: 'Create New Module',
      description: 'Add a new learning module',
      icon: '➕',
      href: '/admin/content',
      color: 'blue'
    },
    {
      title: 'Manage Badges',
      description: 'Create and manage achievement badges',
      icon: '🏆',
      href: '/admin/badges',
      color: 'yellow'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: '👥',
      href: '/admin/users',
      color: 'green'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome Back, Admin! 👋</h1>
        <p className="text-blue-100">
          {loading ? 'Loading dashboard data...' : "Here's what's happening with your learning platform today."}
        </p>
      </div>

      {/* Stats Grid - Now includes badges */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((stat) => (
            <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Link href={stat.href} className="block">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold text-${stat.color}-600`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                {stat.change && (
                  <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Now includes badge management */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`block p-4 rounded-lg border-2 border-${action.color}-100 hover:border-${action.color}-200 hover:bg-${action.color}-50 transition-colors`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-${action.color}-100`}>
                      <span className="text-lg">{action.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity - Now includes badge activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      {activity.user && (
                        <p className="text-xs text-gray-600">by {activity.user}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Badge System Overview - New section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          Badge System Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-2">⭐</div>
            <h4 className="font-medium text-gray-900">Module Badges</h4>
            <p className="text-sm text-gray-600 mt-1">Completion rewards for entire modules</p>
            <Link href="/admin/badges" className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
              Manage Module Badges →
            </Link>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-medium text-gray-900">Lesson Badges</h4>
            <p className="text-sm text-gray-600 mt-1">Individual lesson achievements</p>
            <Link href="/admin/content" className="text-green-600 hover:text-green-800 text-sm font-medium">
              Manage from Content →
            </Link>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">🏅</div>
            <h4 className="font-medium text-gray-900">Special Badges</h4>
            <p className="text-sm text-gray-600 mt-1">Custom and manual awards</p>
            <Link href="/admin/badges" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              Create Special Badges →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}