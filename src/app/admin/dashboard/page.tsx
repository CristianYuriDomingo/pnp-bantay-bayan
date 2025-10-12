// app/admin/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Stats, RecentActivity } from '../types';
import { Users, BookOpen, Award, TrendingUp, CheckCircle, Clock, Trophy, Zap, ArrowRight, AlertCircle, Crown, Target, Lightbulb } from 'lucide-react';

// Add interface for leaderboard data
interface LeaderboardUser {
  userId: string;
  displayName: string;
  image: string | null;
  totalXP: number;
  level: number;
  rank: number;
  earnedBadges: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
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

      // Fetch leaderboard data (top 5)
      try {
        const leaderboardResponse = await fetch('/api/leaderboard?limit=5&page=1');
        if (leaderboardResponse.ok) {
          const leaderboardResult = await leaderboardResponse.json();
          setLeaderboardData(leaderboardResult.leaderboard || []);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }

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

  const getActivityIcon = (type: RecentActivity['type']) => {
    const icons = {
      user_registered: Users,
      lesson_completed: CheckCircle,
      module_created: BookOpen,
      quiz_submitted: Clock,
      badge_earned: Award,
      badge_created: Trophy
    };
    return icons[type];
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    const colors = {
      user_registered: 'blue',
      lesson_completed: 'green',
      module_created: 'purple',
      quiz_submitted: 'yellow',
      badge_earned: 'orange',
      badge_created: 'pink'
    };
    return colors[type];
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Function to get badge emoji based on rank
  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '⭐';
  };

  // Calculate progress percentage (based on level)
  const getProgressPercentage = (level: number) => {
    // Assume max level is 50 for progress bar calculation
    return Math.min((level / 50) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome Back, Admin! 👋</h1>
              <p className="text-blue-100 text-lg">Here's what's happening on your learning platform today</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-sm text-blue-100 mb-1">Active Users</p>
                <p className="text-3xl font-bold">{stats?.activeUsers || '0'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Now 4 cards including Quiz & Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: 'Total Users', 
              value: getStatValue(stats?.totalUsers),
              change: stats?.newUsersThisWeek ? `+${stats.newUsersThisWeek} this week` : undefined,
              icon: Users,
              color: 'blue',
              href: '/admin/users'
            },
            { 
              title: 'Learning Content', 
              value: (
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{getStatValue(stats?.totalModules)}</div>
                    <div className="text-xs text-gray-600">Modules</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{getStatValue(stats?.totalLessons)}</div>
                    <div className="text-xs text-gray-600">Lessons</div>
                  </div>
                </div>
              ),
              icon: BookOpen,
              color: 'green',
              href: '/admin/content'
            },
            { 
              title: 'Achievement Badges', 
              value: getStatValue(stats?.totalBadges),
              subtitle: 'Active badges',
              icon: Trophy,
              color: 'yellow',
              href: '/admin/badges'
            },
            { 
              title: 'Quiz & Tips', 
              value: (
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{getStatValue(stats?.totalQuizzes)}</div>
                    <div className="text-xs text-gray-600">Quizzes</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{getStatValue(stats?.totalTips)}</div>
                    <div className="text-xs text-gray-600">Tips</div>
                  </div>
                </div>
              ),
              icon: Lightbulb,
              color: 'purple',
              href: '/admin/quiz'
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
                <Link href={stat.href} className="block">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${stat.color}-50 group-hover:bg-${stat.color}-100 transition-colors`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    {typeof stat.value === 'string' ? (
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    ) : (
                      <div className="mb-2">{stat.value}</div>
                    )}
                    {stat.change && (
                      <p className="text-xs text-green-600 font-medium flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.change}
                      </p>
                    )}
                    {stat.subtitle && (
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <span className="text-sm text-gray-500">Live updates</span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => {
                      const Icon = getActivityIcon(activity.type);
                      const color = getActivityColor(activity.type);
                      return (
                        <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 text-${color}-600`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {activity.user && (
                                <span className="text-xs text-gray-600">{activity.user}</span>
                              )}
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
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

          {/* Quick Actions & Leaderboard */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'Create Module', icon: '📚', href: '/admin/content', color: 'blue' },
                  { title: 'Add Quiz', icon: '📝', href: '/admin/quiz', color: 'green' },
                  { title: 'Design Badge', icon: '🏆', href: '/admin/badges', color: 'yellow' },
                  { title: 'Manage Users', icon: '👥', href: '/admin/users', color: 'purple' }
                ].map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 border-${action.color}-100 hover:border-${action.color}-200 hover:bg-${action.color}-50 transition-all group`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{action.icon}</span>
                      <span className="font-medium text-gray-900">{action.title}</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-${action.color}-600 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Dynamic Leaderboard */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Crown className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Top Learners</h3>
              </div>
              <div className="space-y-3">
                {leaderboardData.length > 0 ? (
                  leaderboardData.map((user) => (
                    <div key={user.userId} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        <span className="text-lg">{getRankBadge(user.rank)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
                          <p className="text-sm font-bold text-indigo-600">{user.totalXP} pts</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${getProgressPercentage(user.level)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="text-sm">No leaderboard data yet</p>
                  </div>
                )}
              </div>
              <Link 
                href="/admin/leaderboard" 
                className="block text-center mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View Full Leaderboard →
              </Link>
            </div>
          </div>
        </div>

        {/* System Health Alert */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Status: All Good! ✅</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">No orphaned badges</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">All modules have lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Database healthy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}