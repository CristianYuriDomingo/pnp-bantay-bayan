// app/api/achievements/unlock-badge-milestones/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AchievementService } from '@/lib/achievement-service';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    console.log(`🔓 Manually unlocking badge achievements for user: ${userId}`);

    // Get badge counts for display
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: {
          select: {
            id: true,
            name: true,
            category: true,
            masteryLevel: true,
            triggerType: true
          }
        }
      }
    });

    const learningBadges = userBadges.filter(ub => 
      ub.badge.triggerType === 'lesson_complete' || 
      ub.badge.triggerType === 'module_complete' ||
      ub.badge.category === 'Learning'
    );

    const quizBadges = userBadges.filter(ub => 
      ub.badge.triggerType === 'quiz_mastery' || 
      ub.badge.triggerType === 'parent_quiz_mastery' ||
      ub.badge.category === 'Quiz Mastery' ||
      ub.badge.masteryLevel !== null
    );

    console.log(`📊 Badge counts: Learning=${learningBadges.length}, Quiz=${quizBadges.length}`);

    // Get achievements before unlock
    const achievementsBefore = await prisma.userAchievement.count({
      where: { userId }
    });

    // 🔥 USE THE NEW DYNAMIC SERVICE
    await AchievementService.checkAndUnlockBadgeMilestoneAchievements(userId);

    // Get achievements after unlock
    const achievementsAfter = await prisma.userAchievement.count({
      where: { userId }
    });

    const unlockedCount = achievementsAfter - achievementsBefore;

    // Get detailed results
    const allAchievements = await prisma.achievement.findMany({
      where: {
        type: 'badge_milestone',
        isActive: true
      },
      include: {
        userAchievements: {
          where: { userId },
          select: { earnedAt: true }
        }
      }
    });

    const results = await Promise.all(
      allAchievements.map(async (achievement) => {
        const progress = await AchievementService.getBadgeMilestoneProgress(userId, achievement.id);
        
        return {
          achievement: achievement.name,
          status: achievement.userAchievements.length > 0 ? 'unlocked' : 'locked',
          current: progress?.current || 0,
          target: progress?.target || 0,
          badgeType: progress?.badgeType || 'unknown',
          percentage: progress?.percentage || 0
        };
      })
    );

    console.log(`✅ Complete! Unlocked ${unlockedCount} achievements`);

    return NextResponse.json({
      success: true,
      unlockedCount,
      badgeCounts: {
        learning: learningBadges.length,
        quiz: quizBadges.length,
        total: userBadges.length
      },
      sampleBadges: userBadges.slice(0, 5).map(ub => ({
        name: ub.badge.name,
        triggerType: ub.badge.triggerType,
        category: ub.badge.category
      })),
      results
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to unlock achievements', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}