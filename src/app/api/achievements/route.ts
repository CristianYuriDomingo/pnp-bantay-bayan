// app/api/achievements/route.ts - FINAL CORRECTED VERSION

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;

    // Get all achievements
    const [allAchievements, userAchievements, user] = await Promise.all([
      prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: [
          { category: 'asc' },
          { sortOrder: 'asc' },
        ],
      }),
      prisma.userAchievement.findMany({
        where: { userId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          badgeEarned: {
            include: {
              badge: true,
            },
          },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate badge counts by type
    const learningBadges = user.badgeEarned.filter(
      (ub) => ub.badge.triggerType === 'lesson_complete' || ub.badge.triggerType === 'module_complete'
    );
    const quizBadges = user.badgeEarned.filter(
      (ub) => ub.badge.triggerType === 'quiz_mastery' || ub.badge.triggerType === 'parent_quiz_mastery'
    );

    // Get total available badges by type (removed isActive filter)
    const [totalLearningBadges, totalQuizBadges] = await Promise.all([
      prisma.badge.count({
        where: {
          triggerType: { in: ['lesson_complete', 'module_complete'] }
        }
      }),
      prisma.badge.count({
        where: {
          triggerType: { in: ['quiz_mastery', 'parent_quiz_mastery'] }
        }
      }),
    ]);

    console.log('📊 Badge statistics:', {
      learningBadges: learningBadges.length,
      totalLearningBadges,
      quizBadges: quizBadges.length,
      totalQuizBadges,
    });

    // Map achievements with unlock status and progress
    const achievementsWithProgress = allAchievements.map((achievement) => {
      const userAchievement = userAchievements.find(
        (ua) => ua.achievementId === achievement.id
      );

      // Calculate progress for badge milestone achievements
      let progress = undefined;
      if (achievement.type === 'badge_milestone' && achievement.criteriaData) {
        const criteriaData = achievement.criteriaData as any;
        const badgeType = criteriaData.badgeType;
        const targetCount = achievement.criteriaValue;

        let currentCount = 0;
        let totalCount = 0;

        if (badgeType === 'learning') {
          currentCount = learningBadges.length;
          if (targetCount === 'all') {
            totalCount = totalLearningBadges;
          } else {
            totalCount = parseInt(targetCount, 10);
          }
        } else if (badgeType === 'quiz') {
          currentCount = quizBadges.length;
          if (targetCount === 'all') {
            totalCount = totalQuizBadges;
          } else {
            totalCount = parseInt(targetCount, 10);
          }
        }

        progress = {
          current: currentCount,
          target: totalCount,
          percentage: totalCount > 0 ? Math.round((currentCount / totalCount) * 100) : 0,
        };

        console.log(`Progress for ${achievement.name}:`, progress);
      }

      return {
        ...achievement,
        isUnlocked: !!userAchievement,
        earnedAt: userAchievement?.earnedAt || null,
        xpAwarded: userAchievement?.xpAwarded || 0,
        progress,
      };
    });

    return NextResponse.json({
      success: true,
      achievements: achievementsWithProgress,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}