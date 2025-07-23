
// app/api/users/progress/module/[moduleId]/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/users/progress/module/[moduleId] - Get specific module progress
export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
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

    const { moduleId } = params;

    // Get module with lessons
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            timer: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // FIXED: Changed from user_progress to userProgress (matching Prisma client)
    // Get user progress for this module
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId: user.id,
        moduleId: moduleId
      }
    });

    // Separate module and lesson progress
    const moduleProgress = userProgress.find((p: any) => p.lessonId === null);
    const lessonProgresses = userProgress.filter((p: any) => p.lessonId !== null);

    // Create lesson progress map
    const lessonProgressMap: { [key: string]: any } = {};
    lessonProgresses.forEach((progress: any) => {
      if (progress.lessonId) {
        lessonProgressMap[progress.lessonId] = {
          completed: progress.completed,
          completedAt: progress.updatedAt,
          timeSpent: progress.timeSpent,
          progress: progress.progress
        };
      }
    });

    const completedLessons = lessonProgresses.filter((p: any) => p.completed).length;
    const totalLessons = module.lessons.length;
    const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return NextResponse.json({
      module: {
        id: module.id,
        title: module.title,
        image: module.image,
        totalLessons,
        completedLessons,
        completionPercentage,
        isCompleted: completionPercentage === 100,
        completedAt: moduleProgress?.completed ? moduleProgress.updatedAt : null
      },
      lessons: module.lessons.map(lesson => ({
        ...lesson,
        progress: lessonProgressMap[lesson.id] || {
          completed: false,
          completedAt: null,
          timeSpent: 0,
          progress: 0
        }
      })),
      overallProgress: moduleProgress || {
        completed: false,
        progress: completionPercentage,
        updatedAt: null
      }
    });

  } catch (error) {
    console.error('Error fetching module progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}