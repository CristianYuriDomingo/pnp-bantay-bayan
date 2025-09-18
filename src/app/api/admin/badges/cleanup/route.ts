// app/api/admin/badges/cleanup/route.ts - Fixed with proper types
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Define the OrphanedBadge interface
interface OrphanedBadge {
  id: string;
  name: string;
  triggerValue: string;
  type: string;
  reason: string;
}

// POST - Clean up orphaned badges (badges that reference deleted modules/lessons)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let deletedBadgesCount = 0;

    await prisma.$transaction(async (prisma) => {
      // Find all module completion badges
      const moduleCompletionBadges = await prisma.badge.findMany({
        where: {
          triggerType: 'module_complete'
        },
        select: {
          id: true,
          triggerValue: true,
          name: true
        }
      });

      // Check which modules still exist
      const validModuleIds = new Set<string>();
      if (moduleCompletionBadges.length > 0) {
        const modules = await prisma.module.findMany({
          select: { id: true }
        });
        modules.forEach(module => validModuleIds.add(module.id));
      }

      // Delete orphaned module completion badges
      const orphanedModuleBadges = moduleCompletionBadges.filter(
        badge => !validModuleIds.has(badge.triggerValue)
      );

      if (orphanedModuleBadges.length > 0) {
        await prisma.badge.deleteMany({
          where: {
            id: {
              in: orphanedModuleBadges.map(badge => badge.id)
            }
          }
        });
        deletedBadgesCount += orphanedModuleBadges.length;
      }

      // Find all lesson completion badges
      const lessonCompletionBadges = await prisma.badge.findMany({
        where: {
          triggerType: 'lesson_complete'
        },
        select: {
          id: true,
          triggerValue: true,
          name: true
        }
      });

      // Check which lessons still exist
      const validLessonIds = new Set<string>();
      if (lessonCompletionBadges.length > 0) {
        const lessons = await prisma.lesson.findMany({
          select: { id: true }
        });
        lessons.forEach(lesson => validLessonIds.add(lesson.id));
      }

      // Delete orphaned lesson completion badges
      const orphanedLessonBadges = lessonCompletionBadges.filter(
        badge => !validLessonIds.has(badge.triggerValue)
      );

      if (orphanedLessonBadges.length > 0) {
        await prisma.badge.deleteMany({
          where: {
            id: {
              in: orphanedLessonBadges.map(badge => badge.id)
            }
          }
        });
        deletedBadgesCount += orphanedLessonBadges.length;
      }
    });

    return NextResponse.json({ 
      message: `Cleanup completed. ${deletedBadgesCount} orphaned badges removed.`,
      deletedCount: deletedBadgesCount
    });
  } catch (error) {
    console.error('Error cleaning up badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Check for orphaned badges without deleting them
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orphanedBadges: OrphanedBadge[] = [];

    // Check module completion badges
    const moduleCompletionBadges = await prisma.badge.findMany({
      where: {
        triggerType: 'module_complete'
      },
      select: {
        id: true,
        name: true,
        triggerValue: true
      }
    });

    if (moduleCompletionBadges.length > 0) {
      const validModuleIds = new Set<string>();
      const modules = await prisma.module.findMany({
        select: { id: true }
      });
      modules.forEach(module => validModuleIds.add(module.id));

      moduleCompletionBadges.forEach(badge => {
        if (!validModuleIds.has(badge.triggerValue)) {
          orphanedBadges.push({
            id: badge.id,
            name: badge.name,
            triggerValue: badge.triggerValue,
            type: 'module_complete',
            reason: 'Module no longer exists'
          });
        }
      });
    }

    // Check lesson completion badges
    const lessonCompletionBadges = await prisma.badge.findMany({
      where: {
        triggerType: 'lesson_complete'
      },
      select: {
        id: true,
        name: true,
        triggerValue: true
      }
    });

    if (lessonCompletionBadges.length > 0) {
      const validLessonIds = new Set<string>();
      const lessons = await prisma.lesson.findMany({
        select: { id: true }
      });
      lessons.forEach(lesson => validLessonIds.add(lesson.id));

      lessonCompletionBadges.forEach(badge => {
        if (!validLessonIds.has(badge.triggerValue)) {
          orphanedBadges.push({
            id: badge.id,
            name: badge.name,
            triggerValue: badge.triggerValue,
            type: 'lesson_complete',
            reason: 'Lesson no longer exists'
          });
        }
      });
    }

    return NextResponse.json({
      orphanedBadges,
      count: orphanedBadges.length
    });
  } catch (error) {
    console.error('Error checking for orphaned badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}