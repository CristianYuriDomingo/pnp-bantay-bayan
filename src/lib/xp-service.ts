// lib/xp-service.ts - ENHANCED WITH AUTOMATIC ACHIEVEMENT VERIFICATION
// Add this to your existing XP service or create new one

import { prisma } from '@/lib/prisma'
import { RankCalculator } from '@/lib/rank-calculator'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import { getBaseRankByXP } from '@/lib/rank-config'

export class XPService {
  /**
   * Award XP to a user and automatically check for achievements
   */
  static async awardXP(userId: string, xpAmount: number, source: string): Promise<{
    success: boolean;
    newTotalXP: number;
    rankChanged: boolean;
    newAchievements: number;
  }> {
    try {
      console.log(`💎 Awarding ${xpAmount} XP to user ${userId} from ${source}`);

      // Get user's current data
      const userBefore = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalXP: true,
          currentRank: true
        }
      });

      if (!userBefore) {
        throw new Error('User not found');
      }

      const oldXP = userBefore.totalXP;
      const oldRank = userBefore.currentRank;
      const oldBaseRank = getBaseRankByXP(oldXP);

      // Award XP
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          totalXP: {
            increment: xpAmount
          },
          lastActiveDate: new Date()
        },
        select: {
          totalXP: true,
          currentRank: true
        }
      });

      const newXP = updatedUser.totalXP;
      const newBaseRank = getBaseRankByXP(newXP);

      console.log(`✅ XP awarded. Total: ${newXP} (${oldBaseRank} → ${newBaseRank})`);

      // Check if base rank changed (learning progression)
      let newAchievementsCount = 0;
      if (oldBaseRank !== newBaseRank) {
        console.log(`🎖️ Base rank changed! ${oldBaseRank} → ${newBaseRank}`);
        
        // Award all rank achievements between old and new base rank
        const result = await RankCalculator.verifyAndUnlockMissingAchievements(userId);
        newAchievementsCount = result;
        
        console.log(`✅ Awarded ${newAchievementsCount} rank achievements`);
      }

      // Recalculate ranks for all users (for competitive ranks)
      // This should be done periodically or after significant XP changes
      // For production, consider using a queue/job system
      if (newXP >= 3500) {
        // User might be eligible for competitive star ranks
        console.log('⭐ User eligible for star ranks - triggering rank recalculation');
        
        // Run in background (don't await to keep response fast)
        RankCalculator.calculateAllRanks().catch(err => {
          console.error('❌ Background rank calculation failed:', err);
        });
      }

      return {
        success: true,
        newTotalXP: newXP,
        rankChanged: oldBaseRank !== newBaseRank,
        newAchievements: newAchievementsCount
      };

    } catch (error) {
      console.error('❌ Error awarding XP:', error);
      throw error;
    }
  }

  /**
   * Award XP for completing a lesson
   */
  static async awardLessonXP(userId: string, lessonId: string): Promise<void> {
    const XP_AMOUNT = 50; // Adjust as needed
    await this.awardXP(userId, XP_AMOUNT, `lesson-${lessonId}`);
  }

  /**
   * Award XP for completing a quiz
   */
  static async awardQuizXP(userId: string, quizId: string, score: number): Promise<void> {
    const baseXP = 100;
    const bonusXP = Math.floor((score / 100) * 50); // Up to 50 bonus XP for perfect score
    const totalXP = baseXP + bonusXP;
    
    await this.awardXP(userId, totalXP, `quiz-${quizId}`);
  }

  /**
   * Bulk verify achievements for a user (call this periodically or on-demand)
   */
  static async verifyAllAchievements(userId: string): Promise<number> {
    try {
      console.log(`🔍 Bulk verification for user ${userId}`);
      
      const result = await RankCalculator.verifyAndUnlockMissingAchievements(userId);
      
      // Also check badge milestones
      const { AchievementService } = await import('@/lib/achievement-service');
      await AchievementService.checkAndUnlockBadgeMilestoneAchievements(userId);
      
      console.log(`✅ Bulk verification complete. Unlocked: ${result}`);
      return result;
      
    } catch (error) {
      console.error('❌ Bulk verification failed:', error);
      return 0;
    }
  }
}

// Example usage in your existing XP award endpoints:
/*

// In your lesson completion endpoint:
import { XPService } from '@/lib/xp-service'

export async function POST(req: Request) {
  const { userId, lessonId } = await req.json()
  
  const result = await XPService.awardLessonXP(userId, lessonId)
  
  return NextResponse.json({
    success: true,
    xpGained: 50,
    newTotalXP: result.newTotalXP,
    rankChanged: result.rankChanged,
    newAchievements: result.newAchievements
  })
}

*/