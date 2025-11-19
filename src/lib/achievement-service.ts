// src/lib/achievement-service.ts
// Dynamic achievement unlocking - no hardcoded counts!

import { prisma } from '@/lib/prisma';

export class AchievementService {
  /**
   * 🔥 FIXED: Check and unlock badge milestone achievements
   * Only counts ACTUAL lesson/module/quiz badges, not all badges
   */
  static async checkAndUnlockBadgeMilestoneAchievements(userId: string): Promise<void> {
    console.log(`🎖️ Checking badge milestone achievements for user ${userId}`);

    try {
      // Get all user's badges with their details
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

      console.log(`📊 Total user badges: ${userBadges.length}`);

      // 🔥 FIXED: Only count learning badges (lesson_complete or module_complete)
      const learningBadges = userBadges.filter(ub => 
        ub.badge.triggerType === 'lesson_complete' || 
        ub.badge.triggerType === 'module_complete'
      );

      // 🔥 FIXED: Only count quiz badges (quiz_mastery or parent_quiz_mastery)
      const quizBadges = userBadges.filter(ub => 
        ub.badge.triggerType === 'quiz_mastery' || 
        ub.badge.triggerType === 'parent_quiz_mastery'
      );

      const learningBadgeCount = learningBadges.length;
      const quizBadgeCount = quizBadges.length;

      console.log(`📊 Badge breakdown:`);
      console.log(`   - Learning badges (lesson/module): ${learningBadgeCount}`);
      console.log(`   - Quiz badges (quiz mastery): ${quizBadgeCount}`);

      // Log some examples for debugging
      if (learningBadges.length > 0) {
        console.log(`   📚 Sample learning badges:`);
        learningBadges.slice(0, 3).forEach(ub => {
          console.log(`      - ${ub.badge.name} (${ub.badge.triggerType})`);
        });
      }

      if (quizBadges.length > 0) {
        console.log(`   📝 Sample quiz badges:`);
        quizBadges.slice(0, 3).forEach(ub => {
          console.log(`      - ${ub.badge.name} (${ub.badge.triggerType})`);
        });
      }

      // Get all badge milestone achievements that aren't unlocked yet
      const badgeMilestoneAchievements = await prisma.achievement.findMany({
        where: {
          type: 'badge_milestone',
          isActive: true,
          userAchievements: {
            none: {
              userId: userId
            }
          }
        }
      });

      console.log(`🔍 Found ${badgeMilestoneAchievements.length} locked badge milestone achievements`);

      // Check each achievement to see if it should be unlocked
      for (const achievement of badgeMilestoneAchievements) {
        const criteriaData = achievement.criteriaData as any;
        
        if (!criteriaData || !criteriaData.badgeType) {
          console.warn(`⚠️ Achievement ${achievement.code} missing criteriaData or badgeType`);
          continue;
        }

        const { badgeType } = criteriaData;
        const userCount = badgeType === 'learning' ? learningBadgeCount : quizBadgeCount;

        // 🔥 FIXED: Dynamic target calculation
        const shouldUnlock = await this.checkDynamicUnlockCriteria(
          achievement,
          learningBadgeCount,
          quizBadgeCount
        );

        if (shouldUnlock) {
          console.log(`✅ UNLOCKING ACHIEVEMENT: ${achievement.name}`);
          
          try {
            await prisma.userAchievement.create({
              data: {
                userId: userId,
                achievementId: achievement.id,
                xpAwarded: achievement.xpReward
              }
            });

            console.log(`🎉 Achievement "${achievement.name}" unlocked for user ${userId}!`);
          } catch (err) {
            // Ignore duplicate errors (achievement already unlocked)
            if (err instanceof Error && err.message.includes('Unique constraint')) {
              console.log(`ℹ️ Achievement "${achievement.name}" already unlocked`);
            } else {
              throw err;
            }
          }
        } else {
          console.log(`❌ Not ready for "${achievement.name}"`);
        }
      }
    } catch (error) {
      console.error('Error checking badge milestone achievements:', error);
    }
  }

  /**
   * 🔥 FIXED: Dynamic unlock criteria - calculates targets based on available badges
   * NOW PREVENTS 0 >= 0 BUG!
   */
  private static async checkDynamicUnlockCriteria(
    achievement: any,
    userLearningCount: number,
    userQuizCount: number
  ): Promise<boolean> {
    const criteriaData = achievement.criteriaData as any;
    const code = achievement.code.toLowerCase();
    const name = achievement.name.toLowerCase();

    // Determine badge type
    const isLearning = code.includes('learning') || name.includes('learning');
    const isQuiz = code.includes('quiz') || name.includes('quiz');

    if (!isLearning && !isQuiz) {
      console.warn(`⚠️ Unknown badge type for achievement: ${achievement.name}`);
      return false;
    }

    // Get total available badges of this type
    let totalAvailable = 0;
    
    if (isLearning) {
      totalAvailable = await prisma.badge.count({
        where: {
          OR: [
            { triggerType: 'lesson_complete' },
            { triggerType: 'module_complete' }
          ]
        }
      });
    } else if (isQuiz) {
      totalAvailable = await prisma.badge.count({
        where: {
          OR: [
            { triggerType: 'quiz_mastery' },
            { triggerType: 'parent_quiz_mastery' }
          ]
        }
      });
    }

    const userCount = isLearning ? userLearningCount : userQuizCount;

    console.log(`   🔍 Checking ${achievement.name}:`);
    console.log(`      - Type: ${isLearning ? 'Learning' : 'Quiz'}`);
    console.log(`      - User has: ${userCount}`);
    console.log(`      - Total available: ${totalAvailable}`);

    // 🔥 FIX #1: If no badges exist in the system, return false immediately
    if (totalAvailable === 0) {
      console.log(`      - ❌ No badges available in system yet`);
      return false;
    }

    // 🔥 FIX #2: User must have earned at least one badge
    if (userCount === 0) {
      console.log(`      - ❌ User has not earned any badges yet`);
      return false;
    }

    // 🔥 FIXED: Determine milestone type and check
    if (code.includes('starter') || name.includes('starter')) {
      // STARTER: Need at least 1 badge (and 1 must exist in system)
      const qualifies = userCount >= 1 && totalAvailable >= 1;
      console.log(`      - STARTER: Need 1, qualifies: ${qualifies}`);
      return qualifies;
    }
    
    if (code.includes('master') || name.includes('master')) {
      // MASTER: Need 50% of available badges
      const required = Math.ceil(totalAvailable / 2);
      // 🔥 FIX #3: Must actually have badges, not just meet 0 >= 0
      const qualifies = userCount >= required && userCount > 0;
      console.log(`      - MASTER: Need ${required} (50% of ${totalAvailable}), qualifies: ${qualifies}`);
      return qualifies;
    }
    
    if (code.includes('legend') || name.includes('legend')) {
      // LEGEND: Need 100% of available badges
      // 🔥 FIX #4: All three conditions must be true
      const qualifies = userCount >= totalAvailable && totalAvailable > 0 && userCount > 0;
      console.log(`      - LEGEND: Need ${totalAvailable} (100%), qualifies: ${qualifies}`);
      return qualifies;
    }

    console.warn(`      ⚠️ Unknown milestone type for: ${achievement.name}`);
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
      ub.badge.triggerType === 'module_complete'
    ).length;

    const userQuizCount = userBadges.filter(ub => 
      ub.badge.triggerType === 'quiz_mastery' || 
      ub.badge.triggerType === 'parent_quiz_mastery'
    ).length;

    // Get total available badges
    const [totalLearningCount, totalQuizCount] = await Promise.all([
      prisma.badge.count({
        where: {
          OR: [
            { triggerType: 'lesson_complete' },
            { triggerType: 'module_complete' }
          ]
        }
      }),
      prisma.badge.count({
        where: {
          OR: [
            { triggerType: 'quiz_mastery' },
            { triggerType: 'parent_quiz_mastery' }
          ]
        }
      }),
    ]);

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