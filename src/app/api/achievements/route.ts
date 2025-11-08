// app/api/achievements/route.ts - ENHANCED VERSION

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
    console.log(`📋 Fetching achievements for user: ${userId}`);

    // Get all data in parallel for better performance
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
        select: {
          achievementId: true,
          earnedAt: true,
          xpAwarded: true
        }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalXP: true,
          currentRank: true,
          badgeEarned: {
            include: {
              badge: {
                select: {
                  id: true,
                  triggerType: true,
                  category: true,
                  masteryLevel: true
                }
              },
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

    console.log(`✅ Found ${allAchievements.length} achievements, user has ${userAchievements.length} unlocked`);

    // Calculate badge counts by type with flexible matching
    const learningBadges = user.badgeEarned.filter(
      (ub) => {
        const trigger = ub.badge.triggerType;
        const category = ub.badge.category;
        return trigger === 'lesson_complete' || 
               trigger === 'module_complete' || 
               category === 'Learning';
      }
    );

    const quizBadges = user.badgeEarned.filter(
      (ub) => {
        const trigger = ub.badge.triggerType;
        const category = ub.badge.category;
        const hasMastery = ub.badge.masteryLevel !== null;
        return trigger === 'quiz_mastery' || 
               trigger === 'parent_quiz_mastery' || 
               category === 'Quiz Mastery' || 
               hasMastery;
      }
    );

    console.log(`📊 Badge counts: Learning=${learningBadges.length}, Quiz=${quizBadges.length}`);

    // Get total available badges by type (for progress calculation)
    const [totalLearningBadges, totalQuizBadges] = await Promise.all([
      prisma.badge.count({
        where: {
          OR: [
            { triggerType: { in: ['lesson_complete', 'module_complete'] } },
            { category: 'Learning' }
          ]
        }
      }),
      prisma.badge.count({
        where: {
          OR: [
            { triggerType: { in: ['quiz_mastery', 'parent_quiz_mastery'] } },
            { category: 'Quiz Mastery' },
            { masteryLevel: { not: null } }
          ]
        }
      }),
    ]);

    console.log(`📊 Total badges: Learning=${totalLearningBadges}, Quiz=${totalQuizBadges}`);

    // Create a map for fast lookup
    const userAchievementMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua])
    );

    // Map achievements with unlock status and progress
    const achievementsWithProgress = allAchievements.map((achievement) => {
      const userAchievement = userAchievementMap.get(achievement.id);

      // Calculate progress for badge milestone achievements
      let progress = undefined;
      if (achievement.type === 'badge_milestone' && achievement.criteriaData) {
        const criteriaData = achievement.criteriaData as any;
        const badgeType = criteriaData.badgeType;

        let currentCount = 0;
        let totalCount = 0;

        if (badgeType === 'learning') {
          currentCount = learningBadges.length;
          
          // Determine target based on achievement code/name
          const code = achievement.code.toLowerCase();
          const name = achievement.name.toLowerCase();
          
          if (code.includes('starter') || name.includes('starter')) {
            totalCount = 1;
          } else if (code.includes('master') || name.includes('master')) {
            totalCount = Math.ceil(totalLearningBadges / 2);
          } else if (code.includes('legend') || name.includes('legend')) {
            totalCount = totalLearningBadges;
          } else {
            // Fallback to criteriaValue if it's a number
            const criteriaValue = achievement.criteriaValue;
            if (criteriaValue && !isNaN(parseInt(criteriaValue))) {
              totalCount = parseInt(criteriaValue);
            } else {
              totalCount = totalLearningBadges;
            }
          }
        } else if (badgeType === 'quiz') {
          currentCount = quizBadges.length;
          
          const code = achievement.code.toLowerCase();
          const name = achievement.name.toLowerCase();
          
          if (code.includes('starter') || name.includes('starter')) {
            totalCount = 1;
          } else if (code.includes('master') || name.includes('master')) {
            totalCount = Math.ceil(totalQuizBadges / 2);
          } else if (code.includes('legend') || name.includes('legend')) {
            totalCount = totalQuizBadges;
          } else {
            const criteriaValue = achievement.criteriaValue;
            if (criteriaValue && !isNaN(parseInt(criteriaValue))) {
              totalCount = parseInt(criteriaValue);
            } else {
              totalCount = totalQuizBadges;
            }
          }
        }

        progress = {
          current: currentCount,
          target: totalCount,
          percentage: totalCount > 0 ? Math.round((currentCount / totalCount) * 100) : 0,
        };

        console.log(`📊 ${achievement.name}: ${currentCount}/${totalCount} (${progress.percentage}%)`);
      }

      return {
        ...achievement,
        criteriaData: achievement.criteriaData as any, // Include criteriaData in response
        isUnlocked: !!userAchievement,
        earnedAt: userAchievement?.earnedAt || null,
        xpAwarded: userAchievement?.xpAwarded || 0,
        progress,
      };
    });

    // Group by category for summary
    const categoryStats = achievementsWithProgress.reduce((acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) {
        acc[category] = { total: 0, unlocked: 0 };
      }
      acc[category].total++;
      if (achievement.isUnlocked) {
        acc[category].unlocked++;
      }
      return acc;
    }, {} as Record<string, { total: number; unlocked: number }>);

    console.log('📊 Category stats:', categoryStats);

    return NextResponse.json({
      success: true,
      achievements: achievementsWithProgress,
      summary: {
        totalAchievements: allAchievements.length,
        unlockedAchievements: userAchievements.length,
        completionPercentage: Math.round(
          (userAchievements.length / allAchievements.length) * 100
        ),
        categoryStats,
        badgeCounts: {
          learning: {
            current: learningBadges.length,
            total: totalLearningBadges
          },
          quiz: {
            current: quizBadges.length,
            total: totalQuizBadges
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching achievements:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}