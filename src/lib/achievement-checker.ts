// lib/achievement-checker.ts - COMPLETE FIXED VERSION
import { prisma } from '@/lib/prisma';
import { Achievement, UserAchievement, User } from '@prisma/client';
import { PNPRank } from '@/types/rank';

// Types for better code clarity
interface AchievementCheckResult {
  newAchievements: (UserAchievement & { achievement: Achievement })[];
  xpAwarded: number;
}

interface AchievementCheckContext {
  updatedFields?: string[];
  rank?: PNPRank;
  code?: string;
}

// ============================================
// MAIN FUNCTION: Check and Award Achievements
// ============================================
export async function checkAndAwardAchievements(
  userId: string,
  actionType: 'profile_update' | 'badge_earned' | 'rank_promotion' | 'star_rank_achieved' | 'special_achievement',
  context?: AchievementCheckContext
): Promise<AchievementCheckResult> {
  console.log('🔍 [ACHIEVEMENT CHECK] Starting for userId:', userId, 'actionType:', actionType);
  
  if (context) {
    console.log('📝 [ACHIEVEMENT CHECK] Context:', context);
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

    // Filter achievements based on action type and context
    let relevantAchievements = filterRelevantAchievements(
      allAchievements,
      actionType,
      context
    );

    console.log('🎯 [ACHIEVEMENT CHECK] Relevant achievements:', relevantAchievements.length);
    console.log('📋 [ACHIEVEMENT CHECK] Checking:', relevantAchievements.map(a => a.name));

    // Check each relevant achievement
    for (const achievement of relevantAchievements) {
      console.log('\n🔎 [ACHIEVEMENT CHECK] Checking:', achievement.name);
      console.log('   - Code:', achievement.code);
      console.log('   - Criteria Type:', achievement.criteriaType);
      console.log('   - Criteria Value:', achievement.criteriaValue);
      
      // Skip if user already has this achievement
      const alreadyEarned = user.achievementsEarned.some(
        (ua) => ua.achievementId === achievement.id
      );
      
      if (alreadyEarned) {
        console.log('   ⏭️  Already earned - skipping');
        continue;
      }

      // Check if user meets criteria
      const meetsRequirement = await checkAchievementCriteria(user, achievement, context);
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

        // Award XP to user (if achievement has XP reward)
        if (achievement.xpReward > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              totalXP: {
                increment: achievement.xpReward,
              },
            },
          });
          console.log('   🎉 Achievement awarded! XP:', achievement.xpReward);
        } else {
          console.log('   🎉 Achievement awarded! (No XP)');
        }

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
// HELPER: Filter relevant achievements
// ============================================
function filterRelevantAchievements(
  allAchievements: Achievement[],
  actionType: string,
  context?: AchievementCheckContext
): Achievement[] {
  let filtered = allAchievements;

  // Filter by action type
  if (actionType === 'profile_update') {
    filtered = filtered.filter(a => a.type === 'profile');
    
    // Further filter by updated fields
    if (context?.updatedFields) {
      filtered = filtered.filter((achievement) => {
        if (achievement.criteriaType === 'profile_field') {
          return context.updatedFields!.includes(achievement.criteriaValue);
        }
        return true;
      });
    }
  } else if (actionType === 'rank_promotion') {
    filtered = filtered.filter(a => a.type === 'rank' && a.criteriaType === 'xp_threshold');
    
    // Filter to specific rank if provided
    if (context?.rank) {
      filtered = filtered.filter(a => a.criteriaValue === context.rank);
    }
  } else if (actionType === 'star_rank_achieved') {
    filtered = filtered.filter(a => a.type === 'star_rank');
    
    // Filter to specific rank if provided
    if (context?.rank) {
      filtered = filtered.filter(a => a.criteriaValue === context.rank);
    }
  } else if (actionType === 'special_achievement') {
    filtered = filtered.filter(a => a.type === 'special_achievement');
    
    // Filter to specific code if provided
    if (context?.code) {
      filtered = filtered.filter(a => a.code === context.code);
    }
  } else if (actionType === 'badge_earned') {
    filtered = filtered.filter(a => a.type === 'badge_milestone');
  }

  return filtered;
}

// ============================================
// HELPER: Check if user meets achievement criteria
// ============================================
async function checkAchievementCriteria(
  user: User & { badgeEarned: any[] },
  achievement: Achievement,
  context?: AchievementCheckContext
): Promise<boolean> {
  console.log('      🔍 Checking criteria type:', achievement.criteriaType);
  
  switch (achievement.criteriaType) {
    case 'profile_field':
      return checkProfileField(user, achievement.criteriaValue);
    
    case 'xp_threshold':
      return checkXPThreshold(user, achievement.criteriaValue);
    
    case 'rank_achieved':
      return checkRankAchieved(user, achievement.criteriaValue);
    
    case 'competitive_rank':
      return checkCompetitiveRank(user, achievement.criteriaValue);
    
    case 'special_badge':
      return checkSpecialBadge(user, achievement.criteriaValue, context);
    
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
    console.log('         - Has valid name:', hasName);
    return hasName;
  }
  if (fieldName === 'image') {
    const hasImage = !!user.image && user.image.trim().length > 0;
    console.log('         - Has valid image:', hasImage);
    return hasImage;
  }
  
  console.log('         ⚠️ Unknown field name:', fieldName);
  return false;
}

// Check if user has reached XP threshold (for sequential ranks)
function checkXPThreshold(user: User, thresholdValue: string): boolean {
  console.log('      💎 Checking XP threshold:', thresholdValue);
  
  const requiredXP = parseInt(thresholdValue, 10);
  const hasEnoughXP = user.totalXP >= requiredXP;
  
  console.log('         - User XP:', user.totalXP);
  console.log('         - Required XP:', requiredXP);
  console.log('         - Qualifies:', hasEnoughXP);
  
  return hasEnoughXP;
}

// Check if user has achieved a rank (legacy - for old system)
function checkRankAchieved(user: User, targetRank: string): boolean {
  console.log('      🎖️ Checking rank achieved:', targetRank);
  
  const rankOrder: Record<string, number> = {
    'Pat': 1, 'PCpl': 2, 'PSSg': 3, 'PMSg': 4, 'PSMS': 5, 'PCMS': 6,
    'PEMS': 7, 'PLT': 8, 'PCPT': 9, 'PMAJ': 10, 'PLTCOL': 11, 'PCOL': 12,
    'PBGEN': 13, 'PMGEN': 14, 'PLTGEN': 15, 'PGEN': 16,
  };

  const currentRankOrder = rankOrder[user.currentRank] || 0;
  const targetRankOrder = rankOrder[targetRank] || 0;

  console.log('         - Current rank:', user.currentRank, '(order:', currentRankOrder, ')');
  console.log('         - Target rank:', targetRank, '(order:', targetRankOrder, ')');
  
  const qualifies = currentRankOrder >= targetRankOrder;
  console.log('         - Qualifies:', qualifies);

  return qualifies;
}

// Check if user currently holds a competitive rank
function checkCompetitiveRank(user: User, targetRank: string): boolean {
  console.log('      ⭐ Checking competitive rank:', targetRank);
  
  const currentlyHolds = user.currentRank === targetRank;
  
  console.log('         - Current rank:', user.currentRank);
  console.log('         - Target rank:', targetRank);
  console.log('         - Currently holds:', currentlyHolds);
  
  return currentlyHolds;
}

// Check special badge criteria (for Former Chief/Deputy)
function checkSpecialBadge(
  user: User,
  criteriaValue: string,
  context?: AchievementCheckContext
): boolean {
  console.log('      👑 Checking special badge:', criteriaValue);
  
  if (criteriaValue === 'reached_pgen') {
    // User must currently be PGEN or have it as highest rank ever
    const qualifies = user.currentRank === 'PGEN' || user.highestRankEver === 'PGEN';
    console.log('         - Current rank:', user.currentRank);
    console.log('         - Highest ever:', user.highestRankEver);
    console.log('         - Qualifies for Former Chief:', qualifies);
    return qualifies;
  }
  
  if (criteriaValue === 'reached_pltgen') {
    // Check if user ever reached PLTGEN
    const qualifies = user.currentRank === 'PLTGEN' || user.highestRankEver === 'PLTGEN';
    console.log('         - Current rank:', user.currentRank);
    console.log('         - Highest ever:', user.highestRankEver);
    console.log('         - Qualifies for Former Deputy:', qualifies);
    return qualifies;
  }
  
  console.log('         ⚠️ Unknown special badge criteria:', criteriaValue);
  return false;
}

// Check badge count achievements (for milestones)
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

  // Get badges from user
  const allUserBadges = user.badgeEarned || [];
  
  if (allUserBadges.length === 0) {
    console.log('         - No badges earned yet');
    return false;
  }

  // Get full badge details to check trigger types
  const badgeIds = allUserBadges.map((ub: any) => ub.badgeId);
  const badges = await prisma.badge.findMany({
    where: { id: { in: badgeIds } },
  });

  // Filter badges based on type
  let relevantBadges = badges;
  if (badgeType === 'learning') {
    relevantBadges = badges.filter(
      (b) => b.triggerType === 'lesson_complete' || b.triggerType === 'module_complete'
    );
  } else if (badgeType === 'quiz') {
    relevantBadges = badges.filter(
      (b) => b.triggerType === 'quiz_mastery' || b.triggerType === 'parent_quiz_mastery'
    );
  }

  const currentCount = relevantBadges.length;
  console.log('         - Current count:', currentCount, badgeType, 'badges');

  // Handle dynamic targets (Starter/Master/Legend)
  if (targetCount === 'dynamic') {
    return await checkDynamicBadgeMilestone(achievement.code, badgeType, currentCount);
  }

  // Numeric comparison
  const requiredCount = parseInt(targetCount, 10);
  const qualifies = currentCount >= requiredCount;
  
  console.log('         - Required:', requiredCount);
  console.log('         - Qualifies:', qualifies);
  
  return qualifies;
}

// Check dynamic badge milestones (Starter/Master/Legend)
async function checkDynamicBadgeMilestone(
  achievementCode: string,
  badgeType: string,
  currentCount: number
): Promise<boolean> {
  console.log('         - Checking DYNAMIC milestone for:', achievementCode);
  
  // Get total available badges of this type
  const totalBadgesQuery: any = {};
  
  if (badgeType === 'learning') {
    totalBadgesQuery.triggerType = { in: ['lesson_complete', 'module_complete'] };
  } else if (badgeType === 'quiz') {
    totalBadgesQuery.triggerType = { in: ['quiz_mastery', 'parent_quiz_mastery'] };
  }

  const totalBadges = await prisma.badge.count({ where: totalBadgesQuery });
  
  console.log('         - Total available badges:', totalBadges);
  console.log('         - User has:', currentCount);

  // Determine milestone type from achievement code
  if (achievementCode.includes('-starter')) {
    // Starter: 1 badge
    const qualifies = currentCount >= 1;
    console.log('         - STARTER milestone: Need 1, qualifies:', qualifies);
    return qualifies;
  }
  
  if (achievementCode.includes('-master')) {
    // Master: 50% of total
    const required = Math.ceil(totalBadges / 2);
    const qualifies = currentCount >= required;
    console.log('         - MASTER milestone: Need', required, '(50%), qualifies:', qualifies);
    return qualifies;
  }
  
  if (achievementCode.includes('-legend')) {
    // Legend: 100% of total
    const qualifies = currentCount >= totalBadges && totalBadges > 0;
    console.log('         - LEGEND milestone: Need', totalBadges, '(100%), qualifies:', qualifies);
    return qualifies;
  }

  console.log('         ⚠️ Unknown dynamic milestone type');
  return false;
}

// ============================================
// UTILITY FUNCTIONS
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

    // Get badge counts
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

    // Map achievements with progress
    const achievementsWithProgress = allAchievements.map((achievement) => {
      const userAchievement = userAchievements.find(
        (ua) => ua.achievementId === achievement.id
      );

      // Add progress for badge milestones
      let progress = undefined;
      if (achievement.type === 'badge_milestone' && achievement.criteriaData) {
        const criteriaData = achievement.criteriaData as any;
        const badgeType = criteriaData.badgeType;

        let currentCount = 0;
        let totalCount = 0;

        if (badgeType === 'learning') {
          currentCount = learningBadges.length;
          
          // Determine target based on achievement code
          if (achievement.code.includes('-starter')) {
            totalCount = 1;
          } else if (achievement.code.includes('-master')) {
            totalCount = Math.ceil(totalLearningBadges / 2);
          } else if (achievement.code.includes('-legend')) {
            totalCount = totalLearningBadges;
          }
        } else if (badgeType === 'quiz') {
          currentCount = quizBadges.length;
          
          if (achievement.code.includes('-starter')) {
            totalCount = 1;
          } else if (achievement.code.includes('-master')) {
            totalCount = Math.ceil(totalQuizBadges / 2);
          } else if (achievement.code.includes('-legend')) {
            totalCount = totalQuizBadges;
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