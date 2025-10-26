// lib/achievement-checker.ts - COMPLETE FIXED VERSION

import { prisma } from '@/lib/prisma';
import { Achievement, UserAchievement, User } from '@prisma/client';

// Types for better code clarity
interface AchievementCheckResult {
  newAchievements: (UserAchievement & { achievement: Achievement })[];
  xpAwarded: number;
}

interface AchievementCheckContext {
  updatedFields?: string[];
}

// ============================================
// MAIN FUNCTION: Check and Award Achievements
// ============================================
export async function checkAndAwardAchievements(
  userId: string,
  actionType: 'profile_update' | 'badge_earned' | 'rank_promotion',
  context?: AchievementCheckContext
): Promise<AchievementCheckResult> {
  console.log('🔍 [ACHIEVEMENT CHECK] Starting for userId:', userId, 'actionType:', actionType);
  
  if (context?.updatedFields) {
    console.log('📝 [ACHIEVEMENT CHECK] Updated fields:', context.updatedFields);
  }
  
  try {
    const newAchievements: (UserAchievement & { achievement: Achievement })[] = [];
    let totalXpAwarded = 0;

    // Get user data with relations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badgeEarned: {
          include: {
            badge: true,
          },
        },
        achievementsEarned: true,
      },
    });

    if (!user) {
      console.error('❌ [ACHIEVEMENT CHECK] User not found:', userId);
      throw new Error('User not found');
    }

    console.log('👤 [ACHIEVEMENT CHECK] User data:', {
      name: user.name,
      image: user.image ? 'Yes' : 'No',
      currentRank: user.currentRank,
      badgeCount: user.badgeEarned.length,
      achievementsEarned: user.achievementsEarned.length
    });

    // Get all active achievements
    const allAchievements = await prisma.achievement.findMany({
      where: { isActive: true },
    });

    console.log('🏆 [ACHIEVEMENT CHECK] Total active achievements:', allAchievements.length);

    // Filter achievements based on action type
    let relevantAchievements = allAchievements.filter((achievement) => {
      if (actionType === 'profile_update' && achievement.type === 'profile') return true;
      if (actionType === 'rank_promotion' && achievement.type === 'rank') return true;
      if (actionType === 'badge_earned' && achievement.type === 'badge_milestone') return true;
      return false;
    });

    // Filter profile achievements based on updated fields
    if (actionType === 'profile_update' && context?.updatedFields) {
      relevantAchievements = relevantAchievements.filter((achievement) => {
        if (achievement.criteriaType === 'profile_field') {
          const shouldCheck = context.updatedFields!.includes(achievement.criteriaValue);
          if (!shouldCheck) {
            console.log(`⏭️  Skipping ${achievement.name} - field '${achievement.criteriaValue}' was not updated`);
          }
          return shouldCheck;
        }
        return true;
      });
    }

    console.log('🎯 [ACHIEVEMENT CHECK] Relevant achievements for', actionType, ':', relevantAchievements.length);
    console.log('📋 [ACHIEVEMENT CHECK] Checking:', relevantAchievements.map(a => a.name));

    // Check each relevant achievement
    for (const achievement of relevantAchievements) {
      console.log('\n🔎 [ACHIEVEMENT CHECK] Checking:', achievement.name);
      console.log('   - Code:', achievement.code);
      console.log('   - Criteria Type:', achievement.criteriaType);
      console.log('   - Criteria Value:', achievement.criteriaValue);
      console.log('   - Criteria Data:', achievement.criteriaData);
      
      // Skip if user already has this achievement
      const alreadyEarned = user.achievementsEarned.some(
        (ua) => ua.achievementId === achievement.id
      );
      
      if (alreadyEarned) {
        console.log('   ⏭️  Already earned - skipping');
        continue;
      }

      // Check if user meets criteria
      const meetsRequirement = await checkAchievementCriteria(user, achievement);
      console.log('   - Meets requirement:', meetsRequirement);

      if (meetsRequirement) {
        console.log('   ✅ AWARDING ACHIEVEMENT:', achievement.name);
        
        // Award the achievement
        const userAchievement = await prisma.userAchievement.create({
          data: {
            userId: user.id,
            achievementId: achievement.id,
            xpAwarded: achievement.xpReward,
            earnedAt: new Date(),
            notificationSeen: false,
          },
          include: {
            achievement: true,
          },
        });

        // Award XP to user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            totalXP: {
              increment: achievement.xpReward,
            },
          },
        });

        console.log('   🎉 Achievement awarded! XP:', achievement.xpReward);
        newAchievements.push(userAchievement);
        totalXpAwarded += achievement.xpReward;
      } else {
        console.log('   ❌ Does not meet requirement');
      }
    }

    console.log('\n📊 [ACHIEVEMENT CHECK] Summary:');
    console.log('   - New achievements:', newAchievements.length);
    console.log('   - Total XP awarded:', totalXpAwarded);

    return {
      newAchievements,
      xpAwarded: totalXpAwarded,
    };
  } catch (error) {
    console.error('💥 [ACHIEVEMENT CHECK] Error:', error);
    return {
      newAchievements: [],
      xpAwarded: 0,
    };
  }
}

// ============================================
// HELPER: Check if user meets achievement criteria
// ============================================
async function checkAchievementCriteria(
  user: User & { badgeEarned: any[] },
  achievement: Achievement
): Promise<boolean> {
  console.log('      🔍 Checking criteria type:', achievement.criteriaType);
  
  switch (achievement.criteriaType) {
    case 'profile_field':
      return checkProfileField(user, achievement.criteriaValue);
    case 'rank_achieved':
      return checkRankAchieved(user, achievement.criteriaValue);
    case 'badge_count':
      return await checkBadgeCount(user, achievement);
    default:
      console.log('      ⚠️ Unknown criteria type:', achievement.criteriaType);
      return false;
  }
}

// ============================================
// CRITERIA CHECKERS
// ============================================

// Check if profile field is filled
function checkProfileField(user: User, fieldName: string): boolean {
  console.log('      📝 Checking profile field:', fieldName);
  
  if (fieldName === 'name') {
    const hasName = !!user.name && user.name.trim().length > 0;
    console.log('         - User name:', user.name);
    console.log('         - Has valid name:', hasName);
    return hasName;
  }
  if (fieldName === 'image') {
    const hasImage = !!user.image && user.image.trim().length > 0;
    console.log('         - User image:', user.image ? 'Set' : 'Not set');
    console.log('         - Has valid image:', hasImage);
    return hasImage;
  }
  
  console.log('         ⚠️ Unknown field name:', fieldName);
  return false;
}

// Check if user has achieved a rank
function checkRankAchieved(user: User, targetRank: string): boolean {
  console.log('      🎖️ Checking rank:', targetRank);
  
  // Define rank order (update this based on your actual rank system)
  const rankOrder: Record<string, number> = {
    'Pat': 1,
    'PCpl': 2,
    'PSSg': 3,
    'PMSg': 4,
    'PSMS': 5,
    'PCMS': 6,
    'PEMS': 7,
    'PLT': 8,
    'PCPT': 9,
    'PMAJ': 10,
    'PLTCOL': 11,
    'PCOL': 12,
    'PBGEN': 13,
    'PMGEN': 14,
    'PLTGEN': 15,
    'PGEN': 16,
  };

  const currentRankOrder = rankOrder[user.currentRank] || 0;
  const targetRankOrder = rankOrder[targetRank] || 0;

  console.log('         - Current rank:', user.currentRank, '(order:', currentRankOrder, ')');
  console.log('         - Target rank:', targetRank, '(order:', targetRankOrder, ')');
  console.log('         - Qualifies:', currentRankOrder >= targetRankOrder);

  return currentRankOrder >= targetRankOrder;
}

// Check badge count achievements - FIXED VERSION
async function checkBadgeCount(
  user: User & { badgeEarned: any[] },
  achievement: Achievement
): Promise<boolean> {
  console.log('      🏅 Checking badge count for:', achievement.name);
  
  const targetCount = achievement.criteriaValue;
  
  // Parse criteriaData to determine badge type
  let criteriaData: any = {};
  if (achievement.criteriaData && typeof achievement.criteriaData === 'object') {
    criteriaData = achievement.criteriaData;
  }
  const badgeType = criteriaData.badgeType || 'all';
  
  console.log('         - Badge type filter:', badgeType);
  console.log('         - Target count:', targetCount);
  console.log('         - Total user badges:', user.badgeEarned.length);

  // Get badges from user
  const allUserBadges = user.badgeEarned || [];
  
  // Get full badge details to check trigger types
  const badgeIds = allUserBadges.map((ub: any) => ub.badgeId);
  
  if (badgeIds.length === 0) {
    console.log('         - No badges earned yet');
    return false;
  }

  const badges = await prisma.badge.findMany({
    where: {
      id: { in: badgeIds },
    },
  });

  console.log('         - Fetched badge details:', badges.length);

  // Filter badges based on type
  let relevantBadges = badges;
  if (badgeType === 'learning') {
    relevantBadges = badges.filter(
      (b) => b.triggerType === 'lesson_complete' || b.triggerType === 'module_complete'
    );
    console.log('         - Filtering for learning badges (lesson_complete, module_complete)');
  } else if (badgeType === 'quiz') {
    relevantBadges = badges.filter(
      (b) => b.triggerType === 'quiz_mastery' || b.triggerType === 'parent_quiz_mastery'
    );
    console.log('         - Filtering for quiz badges (quiz_mastery, parent_quiz_mastery)');
  }

  const currentCount = relevantBadges.length;
  console.log('         - User has', currentCount, badgeType, 'badges');
  console.log('         - Badge names:', relevantBadges.map(b => b.name).join(', '));

  // 🔥 FIX: Check if "all" badges requirement
  if (targetCount === 'all') {
    // Get total possible badges of this type
    const totalBadgesQuery: any = {};
    
    if (badgeType === 'learning') {
      totalBadgesQuery.triggerType = { in: ['lesson_complete', 'module_complete'] };
    } else if (badgeType === 'quiz') {
      totalBadgesQuery.triggerType = { in: ['quiz_mastery', 'parent_quiz_mastery'] };
    }

    const totalBadges = await prisma.badge.count({ where: totalBadgesQuery });
    
    console.log('         - Total available badges:', totalBadges);
    console.log('         - Current count:', currentCount);
    console.log('         - Need ALL badges:', totalBadges);
    
    // 🎯 KEY FIX: User must have earned ALL available badges
    const qualifies = currentCount >= totalBadges && totalBadges > 0;
    
    console.log('         - Qualifies (has all):', qualifies);
    
    return qualifies;
  }

  // Numeric comparison
  const requiredCount = parseInt(targetCount, 10);
  const qualifies = currentCount >= requiredCount;
  
  console.log('         - Required:', requiredCount);
  console.log('         - Current:', currentCount);
  console.log('         - Qualifies:', qualifies);
  
  return qualifies;
}

// ============================================
// UTILITY: Get user's achievements
// ============================================
export async function getUserAchievements(userId: string) {
  try {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    return userAchievements;
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}

// ============================================
// UTILITY: Get all achievements with user progress
// ============================================
export async function getAllAchievementsWithProgress(userId: string) {
  try {
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
      return [];
    }

    // Get actual badge counts for progress tracking
    const learningBadges = user.badgeEarned.filter(
      (ub) => ub.badge.triggerType === 'lesson_complete' || ub.badge.triggerType === 'module_complete'
    );
    const quizBadges = user.badgeEarned.filter(
      (ub) => ub.badge.triggerType === 'quiz_mastery' || ub.badge.triggerType === 'parent_quiz_mastery'
    );

    // Get total available badges
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

    console.log('📊 Badge counts for user:', {
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

      // Add progress information for badge milestone achievements
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
      }

      return {
        ...achievement,
        isUnlocked: !!userAchievement,
        earnedAt: userAchievement?.earnedAt || null,
        xpAwarded: userAchievement?.xpAwarded || 0,
        progress,
      };
    });

    return achievementsWithProgress;
  } catch (error) {
    console.error('Error fetching achievements with progress:', error);
    return [];
  }
}

// ============================================
// UTILITY: Mark achievement notification as seen
// ============================================
export async function markAchievementNotificationSeen(
  userId: string,
  achievementId: string
) {
  try {
    await prisma.userAchievement.updateMany({
      where: {
        userId,
        achievementId,
      },
      data: {
        notificationSeen: true,
      },
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as seen:', error);
    return false;
  }
}