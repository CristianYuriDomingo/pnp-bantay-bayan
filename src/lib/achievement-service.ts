// src/lib/achievement-service.ts
// Dynamic achievement unlocking - no hardcoded counts!

import { prisma } from '@/lib/prisma';

export class AchievementService {
  /**
   * 🔥 DYNAMIC: Check and unlock badge milestone achievements
   * Automatically calculates total badges available in the system
   */
  static async checkAndUnlockBadgeMilestoneAchievements(userId: string): Promise<void> {
    console.log(`🎖️ Checking badge milestone achievements for user ${userId}`);

    try {
      // Get all user's badges
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

      // Count user's learning badges
      const userLearningBadges = userBadges.filter(ub => 
        ub.badge.triggerType === 'lesson_complete' || 
        ub.badge.triggerType === 'module_complete' ||
        ub.badge.category === 'Learning'
      );

      // Count user's quiz badges
      const userQuizBadges = userBadges.filter(ub => 
        ub.badge.triggerType === 'quiz_mastery' || 
        ub.badge.triggerType === 'parent_quiz_mastery' ||
        ub.badge.category === 'Quiz Mastery' ||
        ub.badge.masteryLevel !== null
      );

      // 🔥 DYNAMIC: Get total available badges in the system
      const totalLearningBadges = await prisma.badge.count({
        where: {
          OR: [
            { triggerType: 'lesson_complete' },
            { triggerType: 'module_complete' },
            { category: 'Learning' }
          ]
        }
      });

      const totalQuizBadges = await prisma.badge.count({
        where: {
          OR: [
            { triggerType: 'quiz_mastery' },
            { triggerType: 'parent_quiz_mastery' },
            { category: 'Quiz Mastery' },
            { masteryLevel: { not: null } }
          ]
        }
      });

      console.log(`📊 Learning: ${userLearningBadges.length}/${totalLearningBadges}`);
      console.log(`📊 Quiz: ${userQuizBadges.length}/${totalQuizBadges}`);

      // Get all badge milestone achievements
      const achievements = await prisma.achievement.findMany({
        where: {
          type: 'badge_milestone',
          isActive: true
        }
      });

      // Check each achievement
      for (const achievement of achievements) {
        // Check if already unlocked
        const alreadyUnlocked = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId: userId,
              achievementId: achievement.id
            }
          }
        });

        if (alreadyUnlocked) {
          continue; // Skip already unlocked
        }

        // 🔥 DYNAMIC UNLOCK LOGIC
        const shouldUnlock = this.checkDynamicUnlockCriteria(
          achievement,
          userLearningBadges.length,
          userQuizBadges.length,
          totalLearningBadges,
          totalQuizBadges
        );

        if (shouldUnlock) {
          console.log(`✅ UNLOCKING: ${achievement.name}`);
          
          try {
            await prisma.userAchievement.create({
              data: {
                userId: userId,
                achievementId: achievement.id,
                xpAwarded: achievement.xpReward
              }
            });

            console.log(`🎉 Achievement "${achievement.name}" unlocked!`);
          } catch (err) {
            if (err instanceof Error && err.message.includes('Unique constraint')) {
              console.log(`ℹ️ Achievement "${achievement.name}" already unlocked`);
            } else {
              throw err;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking badge milestone achievements:', error);
    }
  }

  /**
   * 🔥 DYNAMIC: Check if achievement should unlock based on flexible criteria
   */
  private static checkDynamicUnlockCriteria(
    achievement: any,
    userLearningCount: number,
    userQuizCount: number,
    totalLearningCount: number,
    totalQuizCount: number
  ): boolean {
    const criteriaData = achievement.criteriaData as any;

    // If criteriaData exists with specific count (backwards compatible)
    if (criteriaData && criteriaData.badgeType && criteriaData.count) {
      const userCount = criteriaData.badgeType === 'learning' ? userLearningCount : userQuizCount;
      return userCount >= criteriaData.count;
    }

    // 🔥 NEW: Dynamic unlocking based on achievement name/code pattern
    const code = achievement.code.toLowerCase();
    const name = achievement.name.toLowerCase();

    // Learning achievements
    if (code.includes('learning') || name.includes('learning')) {
      if (code.includes('starter') || name.includes('starter')) {
        return userLearningCount >= 1; // First badge
      }
      if (code.includes('master') || name.includes('master')) {
        return userLearningCount >= Math.ceil(totalLearningCount / 2); // Half of all badges
      }
      if (code.includes('legend') || name.includes('legend')) {
        return userLearningCount >= totalLearningCount; // All badges
      }
    }

    // Quiz achievements
    if (code.includes('quiz') || name.includes('quiz')) {
      if (code.includes('starter') || name.includes('starter')) {
        return userQuizCount >= 1; // First badge
      }
      if (code.includes('master') || name.includes('master')) {
        return userQuizCount >= Math.ceil(totalQuizCount / 2); // Half of all badges
      }
      if (code.includes('legend') || name.includes('legend')) {
        return userQuizCount >= totalQuizCount; // All badges
      }
    }

    return false;
  }

  /**
   * Get dynamic progress for badge milestone achievements
   */
  static async getBadgeMilestoneProgress(userId: string, achievementId: string) {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId }
    });

    if (!achievement || achievement.type !== 'badge_milestone') {
      return null;
    }

    // Get user's badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: {
          select: {
            triggerType: true,
            category: true,
            masteryLevel: true
          }
        }
      }
    });

    // Count learning and quiz badges
    const userLearningCount = userBadges.filter(ub => 
      ub.badge.triggerType === 'lesson_complete' || 
      ub.badge.triggerType === 'module_complete' ||
      ub.badge.category === 'Learning'
    ).length;

    const userQuizCount = userBadges.filter(ub => 
      ub.badge.triggerType === 'quiz_mastery' || 
      ub.badge.triggerType === 'parent_quiz_mastery' ||
      ub.badge.category === 'Quiz Mastery' ||
      ub.badge.masteryLevel !== null
    ).length;

    // Get totals
    const totalLearningCount = await prisma.badge.count({
      where: {
        OR: [
          { triggerType: 'lesson_complete' },
          { triggerType: 'module_complete' },
          { category: 'Learning' }
        ]
      }
    });

    const totalQuizCount = await prisma.badge.count({
      where: {
        OR: [
          { triggerType: 'quiz_mastery' },
          { triggerType: 'parent_quiz_mastery' },
          { category: 'Quiz Mastery' },
          { masteryLevel: { not: null } }
        ]
      }
    });

    // Determine which type this achievement is for
    const code = achievement.code.toLowerCase();
    const name = achievement.name.toLowerCase();
    
    let current = 0;
    let target = 0;
    let badgeType = '';

    if (code.includes('learning') || name.includes('learning')) {
      current = userLearningCount;
      badgeType = 'learning';
      
      if (code.includes('starter') || name.includes('starter')) {
        target = 1;
      } else if (code.includes('master') || name.includes('master')) {
        target = Math.ceil(totalLearningCount / 2);
      } else if (code.includes('legend') || name.includes('legend')) {
        target = totalLearningCount;
      }
    } else if (code.includes('quiz') || name.includes('quiz')) {
      current = userQuizCount;
      badgeType = 'quiz';
      
      if (code.includes('starter') || name.includes('starter')) {
        target = 1;
      } else if (code.includes('master') || name.includes('master')) {
        target = Math.ceil(totalQuizCount / 2);
      } else if (code.includes('legend') || name.includes('legend')) {
        target = totalQuizCount;
      }
    }

    return {
      current,
      target,
      percentage: target > 0 ? Math.round((current / target) * 100) : 0,
      badgeType
    };
  }
}