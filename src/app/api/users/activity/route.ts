// app/api/users/activity/route.ts
import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

interface ActivityItem {
  id: string;
  type: 'lesson_completed' | 'module_started' | 'module_completed';
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
}

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }

    console.log(`📊 Fetching recent activity for user ${user.email}`);

    // Get recent progress updates - ONLY for this user
    const recentProgress = await prisma.userProgress.findMany({
      where: {
        userId: user.id, // 🔒 CRITICAL: Only this user's progress
        completed: true, // Only completed items
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        module: {
          select: {
            id: true,
            title: true,
            lessons: {
              select: {
                id: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10 // Limit to recent 10 activities
    });

    const activities: ActivityItem[] = [];
    const processedModules = new Set<string>();

    for (const progress of recentProgress) {
      if (progress.lessonId) {
        // Lesson completion activity
        activities.push({
          id: `lesson-${progress.id}`,
          type: 'lesson_completed',
          title: `Completed: ${progress.lesson?.title || 'Unknown Lesson'}`,
          description: `in ${progress.lesson?.module?.title || 'Unknown Module'}`,
          timestamp: progress.updatedAt.toISOString(),
          relativeTime: getRelativeTime(progress.updatedAt)
        });

        // Check if this completed the entire module
        if (progress.lesson?.module && !processedModules.has(progress.lesson.module.id)) {
          processedModules.add(progress.lesson.module.id);
          
          // Count completed lessons in this module for this user
          const completedLessonsCount = await prisma.userProgress.count({
            where: {
              userId: user.id,
              moduleId: progress.lesson.module.id,
              completed: true,
              lessonId: { not: null }
            }
          });

          const totalLessonsInModule = await prisma.lesson.count({
            where: {
              moduleId: progress.lesson.module.id
            }
          });

          // If module is complete, add module completion activity
          if (completedLessonsCount === totalLessonsInModule && totalLessonsInModule > 0) {
            activities.push({
              id: `module-${progress.moduleId}`,
              type: 'module_completed',
              title: `Module Completed: ${progress.lesson.module.title}`,
              description: `Finished all ${totalLessonsInModule} lessons`,
              timestamp: progress.updatedAt.toISOString(),
              relativeTime: getRelativeTime(progress.updatedAt)
            });
          }
        }
      }
    }

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Take only the most recent 5 activities to avoid clutter
    const recentActivities = activities.slice(0, 5);

    console.log(`📈 Found ${recentActivities.length} recent activities for user ${user.email}`);

    return createSuccessResponse(recentActivities, `Recent activity retrieved for ${user.email}`);

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return createAuthErrorResponse('Failed to fetch recent activity', 500);
  }
}