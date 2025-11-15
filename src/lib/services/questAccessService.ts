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
}

/**
 * Check if user can access a specific quest
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
    },
  });

  if (!user) {
    return {
      canAccess: false,
      reason: 'User not found',
      isMissed: false,
      needsDutyPass: false,
    };
  }

  const timezone = user.timezone || 'Asia/Manila';
  const currentDay = getCurrentDayOfWeek(timezone);
  const availableDays = getAvailableQuestDays(timezone);

  // Check if this quest day is available yet
  const isAvailable = availableDays.includes(questDay);

  // Check if quest is already completed this week
  const isCompleted = await isQuestCompletedThisWeek(userId, questDay);

  // Quest is from future - locked
  if (!isAvailable) {
    return {
      canAccess: false,
      reason: `This quest unlocks on ${questDay}. Come back then!`,
      isMissed: false,
      needsDutyPass: false,
    };
  }

  // Quest is already completed
  if (isCompleted) {
    return {
      canAccess: false,
      reason: 'Quest already completed this week',
      isMissed: false,
      needsDutyPass: false,
    };
  }

  // Check if quest was missed (past day but not completed)
  const questDayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(questDay);
  const currentDayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(currentDay);

  // Quest is from a past day and not completed = MISSED
  if (questDayIndex < currentDayIndex) {
    return {
      canAccess: false,
      reason: `You missed ${questDay}'s quest. Use a Duty Pass to unlock it!`,
      isMissed: true,
      needsDutyPass: true,
    };
  }

  // Quest is available and not completed - can access!
  return {
    canAccess: true,
    reason: 'Quest available',
    isMissed: false,
    needsDutyPass: false,
  };
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