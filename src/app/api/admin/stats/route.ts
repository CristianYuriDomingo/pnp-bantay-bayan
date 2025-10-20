// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current week start (Sunday)
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalModules,
      totalLessons,
      totalQuizzes,
      totalBadges,
      newUsersThisWeek,
      completedLessons,
      badgesEarnedThisWeek
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Total modules count
      prisma.module.count(),
      
      // Total lessons count
      prisma.lesson.count(),
      
      // Total quizzes count (only sub-quizzes, not parent categories)
      prisma.quiz.count({
        where: {
          isParent: false
        }
      }),
      
      // Total badges count
      prisma.badge.count(),
      
      // New users this week
      prisma.user.count({
        where: {
          createdAt: {
            gte: weekStart
          }
        }
      }),
      
      // Completed lessons count
      prisma.userProgress.count({
        where: {
          completed: true
        }
      }),
      
      // Badges earned this week
      prisma.userBadge.count({
        where: {
          earnedAt: {
            gte: weekStart
          }
        }
      })
    ]);

    // Active users - placeholder since User model doesn't have lastLogin field yet
    const activeUsers = 0; // Will need lastLogin field in User model

    // Calculate average score (placeholder - adjust based on your scoring system)
    // You'll need to implement this based on your quiz/scoring system
    const averageScore = 0;

    const stats = {
      totalUsers,
      totalModules,
      totalLessons,
      totalQuizzes,
      totalBadges,
      activeUsers,
      completedLessons,
      averageScore,
      newUsersThisWeek,
      badgesEarnedThisWeek
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}