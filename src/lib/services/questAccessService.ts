//lib/services/questAccessService.ts
import { prisma } from '@/lib/prisma';
import { 
  getCurrentDayOfWeek, 
  isQuestDayAvailable,
  getAvailableQuestDays 
} from '@/lib/utils/timezone';
import { checkAndResetWeek } from './weeklyResetService';

interface QuestAccessResult {
  canAccess: boolean;
  reason: string;
  isMissed: boolean;
  needsDutyPass: boolean;
  isCompleted: boolean; // NEW: Track if quest is already completed
}

/**
 * Check if user can access a specific quest
 * UPDATED: Completed quests are now REPLAYABLE
 */
export async function canAccessQuest(
  userId: string, 
  questDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
): Promise<QuestAccessResult> {
  
  // First, check if week needs reset
  await checkAndResetWeek(userId);

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      timezone: true,
      weeklyQuestStartDate: true,
      dutyPassUsedDates: true,
    },
  });

  if (!user) {
    return {
      canAccess: false,
      reason: 'User not found',
      isMissed: false,
      needsDutyPass: false,
      isCompleted: false,
    };
  }

  const timezone = user.timezone || 'Asia/Manila';
  const currentDay = getCurrentDayOfWeek(timezone);

  // Check if quest is already completed this week
  const isCompleted = await isQuestCompletedThisWeek(userId, questDay);

  // Get quest day indices
  const questDayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(questDay);
  const currentDayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(currentDay);

  // Weekend handling
  if (currentDay === 'saturday' || currentDay === 'sunday') {
    // On weekends, all incomplete quests are "missed" and need duty pass
    const hasDutyPassForQuest = await checkDutyPassUsedForQuest(
      userId, 
      questDay, 
      user.weeklyQuestStartDate,
      user.dutyPassUsedDates
    );

    if (hasDutyPassForQuest || isCompleted) {
      // Either unlocked with duty pass OR already completed (replayable)
      return {
        canAccess: true,
        reason: isCompleted ? 'Quest completed - replay available!' : 'Unlocked with Duty Pass',
        isMissed: true,
        needsDutyPass: false,
        isCompleted: isCompleted,
      };
    }

    return {
      canAccess: false,
      reason: `Weekend: Use a Duty Pass to unlock ${questDay}'s quest!`,
      isMissed: true,
      needsDutyPass: true,
      isCompleted: false,
    };
  }

  // Quest is from future - locked
  if (questDayIndex > currentDayIndex) {
    return {
      canAccess: false,
      reason: `This quest unlocks on ${questDay}. Come back then!`,
      isMissed: false,
      needsDutyPass: false,
      isCompleted: false,
    };
  }

  // Quest is from a past day and not completed = MISSED
  if (questDayIndex < currentDayIndex) {
    // Check if user has used a duty pass for this quest this week
    const hasDutyPassForQuest = await checkDutyPassUsedForQuest(
      userId, 
      questDay, 
      user.weeklyQuestStartDate,
      user.dutyPassUsedDates
    );

    if (hasDutyPassForQuest || isCompleted) {
      // Either duty pass was used OR quest is completed (replayable)
      return {
        canAccess: true,
        reason: isCompleted ? 'Quest completed - replay available!' : 'Unlocked with Duty Pass',
        isMissed: true,
        needsDutyPass: false,
        isCompleted: isCompleted,
      };
    }

    // No duty pass used and not completed - quest is missed
    return {
      canAccess: false,
      reason: `You missed ${questDay}'s quest. Use a Duty Pass to unlock it!`,
      isMissed: true,
      needsDutyPass: true,
      isCompleted: false,
    };
  }

  // Quest is current day - can access! (whether completed or not)
  return {
    canAccess: true,
    reason: isCompleted ? 'Quest completed - replay available!' : 'Quest available today!',
    isMissed: false,
    needsDutyPass: false,
    isCompleted: isCompleted,
  };
}

/**
 * Check if user has used duty pass for a specific quest this week
 */
async function checkDutyPassUsedForQuest(
  userId: string,
  questDay: string,
  weekStartDate: Date | null,
  dutyPassUsedDates: any
): Promise<boolean> {
  if (!weekStartDate) return false;

  // Get duty pass unlock records for this user and quest
  const unlockRecord = await prisma.dutyPassUnlock.findFirst({
    where: {
      userId,
      questDay,
      unlockedAt: {
        gte: weekStartDate, // Only check unlocks from this week onwards
      },
    },
  });

  return !!unlockRecord;
}

/**
 * Check if specific quest is completed this week
 */
async function isQuestCompletedThisWeek(
  userId: string, 
  questDay: string
): Promise<boolean> {
  
  switch (questDay) {
    case 'monday':
      const mondayProgress = await prisma.questMondayProgress.findFirst({
        where: { 
          userId,
          isCompleted: true,
        },
      });
      return !!mondayProgress;

    case 'tuesday':
      const tuesdayProgress = await prisma.questTuesdayProgress.findFirst({
        where: { 
          userId,
          isCompleted: true,
        },
      });
      return !!tuesdayProgress;

    case 'wednesday':
      const wednesdayProgress = await prisma.questWednesdayProgress.findFirst({
        where: { 
          userId,
          isCompleted: true,
        },
      });
      return !!wednesdayProgress;

    case 'thursday':
      const thursdayProgress = await prisma.questThursdayProgress.findFirst({
        where: { 
          userId,
          isCompleted: true,
        },
      });
      return !!thursdayProgress;

    case 'friday':
      const fridayProgress = await prisma.questFridayProgress.findFirst({
        where: { 
          userId,
          isCompleted: true,
        },
      });
      return !!fridayProgress;

    default:
      return false;
  }
}

/**
 * Get all quest statuses for the week
 */
export async function getWeeklyQuestStatuses(userId: string) {
  const questDays: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'> = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
  ];

  const statuses = await Promise.all(
    questDays.map(async (day) => {
      const access = await canAccessQuest(userId, day);
      return {
        day,
        ...access,
      };
    })
  );

  return statuses;
}