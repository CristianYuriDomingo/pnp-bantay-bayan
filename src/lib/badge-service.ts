// src/lib/badge-service.ts
import { prisma } from '@/lib/prisma';

export interface BadgeAwardResult {
  success: boolean;
  newBadges: any[];
  errors: string[];
}

export interface BadgeEligibilityCheck {
  badgeId: string;
  eligible: boolean;
  reason?: string;
  prerequisites?: string[];
}

export class BadgeService {
  /**
   * Check and award badges for a user after lesson completion
   */
  static async awardBadgesForLessonCompletion(
    userId: string, 
    lessonId: string,
    moduleId: string
  ): Promise<BadgeAwardResult> {
    console.log(`🏆 Checking badges for user ${userId} completing lesson ${lessonId}`);
    
    const result: BadgeAwardResult = {
      success: true,
      newBadges: [],
      errors: []
    };

    try {
      // 1. Award lesson-specific badges
      const lessonBadges = await this.awardLessonBadges(userId, lessonId);
      result.newBadges.push(...lessonBadges);

      // 2. Check if module is now complete and award module badges
      const isModuleComplete = await this.checkModuleCompletion(userId, moduleId);
      if (isModuleComplete) {
        console.log(`🎉 User ${userId} completed entire module ${moduleId}!`);
        const moduleBadges = await this.awardModuleBadges(userId, moduleId);
        result.newBadges.push(...moduleBadges);
      }

      // 3. Check for any cascading badge awards (prerequisites satisfied)
      const cascadingBadges = await this.checkCascadingBadges(userId);
      result.newBadges.push(...cascadingBadges);

      console.log(`✅ Badge check complete for user ${userId}: ${result.newBadges.length} new badges awarded`);
      return result;

    } catch (error) {
      console.error('Error in badge awarding process:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  /**
   * Award badges specifically for lesson completion
   */
  private static async awardLessonBadges(userId: string, lessonId: string): Promise<any[]> {
    const badges = await prisma.badge.findMany({
      where: {
        triggerType: 'lesson_complete',
        triggerValue: lessonId
      }
    });

    const newBadges: any[] = [];

    for (const badge of badges) {
      const eligibility = await this.checkBadgeEligibility(userId, badge.id);
      
      if (eligibility.eligible) {
        const userBadge = await this.awardBadgeToUser(userId, badge.id);
        if (userBadge) {
          newBadges.push({
            ...badge,
            earnedAt: userBadge.earnedAt
          });
          console.log(`🏆 Awarded lesson badge "${badge.name}" to user ${userId}`);
        }
      } else {
        console.log(`❌ User ${userId} not eligible for badge "${badge.name}": ${eligibility.reason}`);
      }
    }

    return newBadges;
  }

  /**
   * Award badges for module completion
   */
  private static async awardModuleBadges(userId: string, moduleId: string): Promise<any[]> {
    const badges = await prisma.badge.findMany({
      where: {
        triggerType: 'module_complete',
        triggerValue: moduleId
      }
    });

    const newBadges: any[] = [];

    for (const badge of badges) {
      const eligibility = await this.checkBadgeEligibility(userId, badge.id);
      
      if (eligibility.eligible) {
        const userBadge = await this.awardBadgeToUser(userId, badge.id);
        if (userBadge) {
          newBadges.push({
            ...badge,
            earnedAt: userBadge.earnedAt
          });
          console.log(`🎖️ Awarded module badge "${badge.name}" to user ${userId}`);
        }
      }
    }

    return newBadges;
  }

  /**
   * Check if a user has completed all lessons in a module
   */
  private static async checkModuleCompletion(userId: string, moduleId: string): Promise<boolean> {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          select: { id: true }
        }
      }
    });

    if (!module) return false;

    const completedLessons = await prisma.userProgress.count({
      where: {
        userId: userId,
        moduleId: moduleId,
        lessonId: {
          in: module.lessons.map(l => l.id)
        },
        completed: true
      }
    });

    return completedLessons === module.lessons.length;
  }

  /**
   * Check if user is eligible for a specific badge
   */
  private static async checkBadgeEligibility(userId: string, badgeId: string): Promise<BadgeEligibilityCheck> {
    // Check if user already has this badge
    const existingUserBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId: userId,
          badgeId: badgeId
        }
      }
    });

    if (existingUserBadge) {
      return {
        badgeId,
        eligible: false,
        reason: 'Badge already earned'
      };
    }

    // Get badge details
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });

    if (!badge) {
      return {
        badgeId,
        eligible: false,
        reason: 'Badge not found'
      };
    }

    // Check prerequisites
    if (badge.prerequisites && badge.prerequisites.length > 0) {
      const userBadges = await prisma.userBadge.findMany({
        where: {
          userId: userId,
          badgeId: {
            in: badge.prerequisites
          }
        }
      });

      const earnedPrerequisiteIds = userBadges.map(ub => ub.badgeId);
      const missingPrerequisites = badge.prerequisites.filter(
        prereqId => !earnedPrerequisiteIds.includes(prereqId)
      );

      if (missingPrerequisites.length > 0) {
        return {
          badgeId,
          eligible: false,
          reason: 'Missing prerequisite badges',
          prerequisites: missingPrerequisites
        };
      }
    }

    return {
      badgeId,
      eligible: true
    };
  }

  /**
   * Actually award a badge to a user (create UserBadge record)
   */
  private static async awardBadgeToUser(userId: string, badgeId: string): Promise<any | null> {
    try {
      const userBadge = await prisma.userBadge.create({
        data: {
          userId: userId,
          badgeId: badgeId
        }
      });

      return userBadge;
    } catch (error) {
      console.error(`Failed to award badge ${badgeId} to user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Check for cascading badge awards (when earning one badge unlocks others)
   */
  private static async checkCascadingBadges(userId: string): Promise<any[]> {
    // FIXED: Get all badges that have prerequisites (non-empty array)
    const badgesWithPrereqs = await prisma.badge.findMany({
      where: {
        prerequisites: {
          isEmpty: false
        }
      }
    });

    const newBadges: any[] = [];

    for (const badge of badgesWithPrereqs) {
      const eligibility = await this.checkBadgeEligibility(userId, badge.id);
      
      if (eligibility.eligible) {
        // Additional check: ensure trigger condition is also met
        const triggerMet = await this.checkTriggerCondition(userId, badge);
        
        if (triggerMet) {
          const userBadge = await this.awardBadgeToUser(userId, badge.id);
          if (userBadge) {
            newBadges.push({
              ...badge,
              earnedAt: userBadge.earnedAt
            });
            console.log(`🌟 Cascading badge "${badge.name}" awarded to user ${userId}`);
          }
        }
      }
    }

    return newBadges;
  }

  /**
   * Check if trigger condition is met for a badge
   */
  private static async checkTriggerCondition(userId: string, badge: any): Promise<boolean> {
    switch (badge.triggerType) {
      case 'lesson_complete':
        const lessonProgress = await prisma.userProgress.findFirst({
          where: {
            userId: userId,
            lessonId: badge.triggerValue,
            completed: true
          }
        });
        return !!lessonProgress;

      case 'module_complete':
        return await this.checkModuleCompletion(userId, badge.triggerValue);

      case 'quiz_mastery':
        // Check if user has achieved 90%+ on this quiz
        const quizMastery = await prisma.quizMastery.findFirst({
          where: {
            userId: userId,
            quizId: badge.triggerValue,
            bestMasteryScore: { gte: 90 }
          }
        });
        return !!quizMastery;

      case 'parent_quiz_mastery':
        // Check if user has mastered all sub-quizzes
        const parentQuiz = await prisma.quiz.findUnique({
          where: { id: badge.triggerValue },
          include: { children: { select: { id: true } } }
        });

        if (!parentQuiz || !parentQuiz.children.length) return false;

        const subQuizIds = parentQuiz.children.map(c => c.id);
        const masteries = await prisma.quizMastery.findMany({
          where: {
            userId: userId,
            quizId: { in: subQuizIds },
            bestMasteryScore: { gte: 90 }
          }
        });

        return masteries.length === subQuizIds.length;

      case 'manual':
        return false; // Manual badges are not automatically awarded

      default:
        return false;
    }
  }

  /**
   * Get all badges earned by a user
   */
  static async getUserBadges(userId: string) {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: userId },
      include: {
        badge: true
      },
      orderBy: {
        earnedAt: 'desc'
      }
    });

    return userBadges.map(ub => ({
      ...ub.badge,
      earnedAt: ub.earnedAt
    }));
  }

  /**
   * Get user's badge statistics
   */
  static async getUserBadgeStats(userId: string) {
    const userBadges = await this.getUserBadges(userId);
    const totalBadges = await prisma.badge.count();

    const rarityCount = {
      Common: userBadges.filter(b => b.rarity === 'Common').length,
      Rare: userBadges.filter(b => b.rarity === 'Rare').length,
      Epic: userBadges.filter(b => b.rarity === 'Epic').length,
      Legendary: userBadges.filter(b => b.rarity === 'Legendary').length,
    };

    return {
      totalEarned: userBadges.length,
      totalAvailable: totalBadges,
      completionPercentage: totalBadges > 0 ? Math.round((userBadges.length / totalBadges) * 100) : 0,
      rarityBreakdown: rarityCount,
      latestBadge: userBadges[0] || null
    };
  }

  /**
   * Check and award badges for quiz completion
   */
  static async awardBadgesForQuizCompletion(
    userId: string,
    quizId: string,
    masteryScore: number,
    percentage: number
  ): Promise<BadgeAwardResult> {
    console.log(`🏆 Checking quiz badges for user ${userId}, quiz ${quizId}, mastery: ${masteryScore}%`);
    
    const result: BadgeAwardResult = {
      success: true,
      newBadges: [],
      errors: []
    };

    try {
      // Get quiz to check question count
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: true, parent: { include: { children: { select: { id: true } } } } }
      });

      if (!quiz) {
        result.errors.push('Quiz not found');
        return result;
      }

      // Determine threshold based on question count
      let threshold = 90;
      if (quiz.questions.length <= 2) {
        // For 1-2 question quizzes, require 100% accuracy
        threshold = 100;
      } else if (quiz.questions.length <= 5) {
        threshold = 80; // Lower threshold for short quizzes
      }

      console.log(`Quiz has ${quiz.questions.length} questions, using threshold: ${threshold}%`);

      // Award if user achieved threshold
      if (percentage >= threshold || masteryScore >= threshold) {
        // 1. Award sub-quiz mastery badge
        const subQuizBadges = await this.awardQuizMasteryBadges(userId, quizId);
        result.newBadges.push(...subQuizBadges);

        // 2. Check if this quiz completion unlocks parent quiz master badge
        if (quiz?.parentId && quiz.parent) {
          const parentBadges = await this.checkParentQuizMasterBadge(
            userId,
            quiz.parent.id,
            quiz.parent.children.map(c => c.id)
          );
          result.newBadges.push(...parentBadges);
        }
      }

      console.log(`✅ Quiz badge check complete: ${result.newBadges.length} new badges`);
      return result;
    } catch (error) {
      console.error('Error in quiz badge awarding:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  /**
   * Award quiz mastery badges (Epic - 90%+)
   */
  private static async awardQuizMasteryBadges(userId: string, quizId: string): Promise<any[]> {
    const badges = await prisma.badge.findMany({
      where: {
        triggerType: 'quiz_mastery',
        triggerValue: quizId
      }
    });

    const newBadges: any[] = [];

    for (const badge of badges) {
      const eligibility = await this.checkBadgeEligibility(userId, badge.id);
      
      if (eligibility.eligible) {
        const userBadge = await this.awardBadgeToUser(userId, badge.id);
        if (userBadge) {
          newBadges.push({
            ...badge,
            earnedAt: userBadge.earnedAt
          });
          console.log(`🏅 Awarded quiz mastery badge "${badge.name}" to user ${userId}`);
        }
      }
    }

    return newBadges;
  }

  /**
   * Check and award parent quiz master badges (when all sub-quizzes are mastered)
   */
  private static async checkParentQuizMasterBadge(userId: string, parentQuizId: string, subQuizIds: string[]): Promise<any[]> {
    // Check if user already has the parent quiz master badge
    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        userId: userId,
        badge: {
          triggerType: 'parent_quiz_mastery',
          triggerValue: parentQuizId
        }
      }
    });

    if (existingBadge) {
      return []; // Already awarded
    }

    // Check if all sub-quizzes are mastered by the user
    const masteries = await prisma.quizMastery.findMany({
      where: {
        userId: userId,
        quizId: { in: subQuizIds },
        bestMasteryScore: { gte: 90 }
      }
    });

    if (masteries.length === subQuizIds.length) {
      // All sub-quizzes mastered, award the parent quiz master badge
      const badge = await prisma.badge.findFirst({
        where: {
          triggerType: 'parent_quiz_mastery',
          triggerValue: parentQuizId
        }
      });

      if (badge) {
        const userBadge = await this.awardBadgeToUser(userId, badge.id);
        if (userBadge) {
          console.log(`🏆 Awarded parent quiz master badge "${badge.name}" to user ${userId}`);
          return [{
            ...badge,
            earnedAt: userBadge.earnedAt
          }];
        }
      }
    }

    return [];
  }
}