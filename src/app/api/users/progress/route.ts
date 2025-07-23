// app/api/users/progress/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/users/progress - Get user's overall progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all user progress with module and lesson details
    // FIXED: Changed from user_progress to userProgress (Prisma client uses model name)
    const userProgress = await prisma.userProgress.findMany({
      where: { userId: user.id },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            image: true,
            lessons: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        lesson: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Group progress by modules
    const moduleProgress: { [key: string]: any } = {};
    const lessonProgress: { [key: string]: any } = {};

    // Process user progress data
    userProgress.forEach((progress: any) => {
      // Module progress
      if (!moduleProgress[progress.moduleId]) {
        moduleProgress[progress.moduleId] = {
          id: progress.moduleId,
          title: progress.module.title,
          image: progress.module.image,
          completedLessons: [],
          totalLessons: progress.module.lessons.length,
          percentage: 0,
          completedAt: null
        };
      }

      // Lesson progress
      if (progress.lessonId) {
        lessonProgress[progress.lessonId] = {
          id: progress.lessonId,
          completed: progress.completed,
          completedAt: progress.updatedAt,
          timeSpent: progress.timeSpent,
          moduleId: progress.moduleId
        };

        if (progress.completed) {
          moduleProgress[progress.moduleId].completedLessons.push(progress.lessonId);
        }
      }
    });

    // Calculate module completion percentages
    Object.keys(moduleProgress).forEach(moduleId => {
      const module = moduleProgress[moduleId];
      module.percentage = module.totalLessons > 0 
        ? Math.round((module.completedLessons.length / module.totalLessons) * 100)
        : 0;
        
      // Set completion date if module is 100% complete
      if (module.percentage === 100) {
        const completedLessonProgresses = userProgress
          .filter((p: any) => p.moduleId === moduleId && p.lessonId && p.completed)
          .sort((a: any, b: any) => b.updatedAt.getTime() - a.updatedAt.getTime());
          
        if (completedLessonProgresses.length > 0) {
          module.completedAt = completedLessonProgresses[0].updatedAt;
        }
      }
    });

    return NextResponse.json({
      moduleProgress,
      lessonProgress,
      overallStats: {
        totalModules: Object.keys(moduleProgress).length,
        completedModules: Object.values(moduleProgress).filter((m: any) => m.percentage === 100).length,
        totalLessons: Object.keys(lessonProgress).length,
        completedLessons: Object.values(lessonProgress).filter((l: any) => l.completed).length
      }
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}