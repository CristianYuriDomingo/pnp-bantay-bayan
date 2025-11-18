// lib/quest-access-validator.ts
import { prisma } from '@/lib/prisma';

export type QuestDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

interface QuestAccessResult {
  canAccess: boolean;
  reason: string;
  shouldRedirect: boolean;
  redirectTo?: string;
}

/**
 * Validates if a user can access a specific quest day
 * Checks:
 * 1. Authentication
 * 2. Current day of week
 * 3. Weekly quest progress
 * 4. Duty pass usage
 * 5. Quest completion status
 */
export async function validateQuestAccess(
  userId: string,
  requestedDay: QuestDay
): Promise<QuestAccessResult> {
  try {
    // Get current server time and day
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Map day names to numbers (1 = Monday, 5 = Friday)
    const dayMap: Record<QuestDay, number> = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
    };

    const requestedDayNumber = dayMap[requestedDay];

    // Check if it's weekend (no quests on weekends)
    if (currentDayOfWeek === 0 || currentDayOfWeek === 6) {
      return {
        canAccess: false,
        reason: 'Quests are not available on weekends',
        shouldRedirect: true,
        redirectTo: '/users/quest',
      };
    }

    // Get the start of the current week (Monday 00:00)
    const weekStart = getWeekStart(now);

    // Get user's weekly quest status for current week
    const weeklyStatus = await prisma.weeklyQuestProgress.findUnique({
      where: {
        userId_weekStartDate: {
          userId: userId,
          weekStartDate: weekStart,
        },
      },
    });

    // Check if user has used a duty pass to unlock this specific quest day
    const dutyPassUnlock = await prisma.dutyPassUnlock.findFirst({
      where: {
        userId: userId,
        questDay: requestedDay,
        unlockedAt: {
          gte: weekStart, // Only check unlocks from current week
        },
      },
      orderBy: {
        unlockedAt: 'desc',
      },
    });

    // If no weekly progress yet, only allow current day
    if (!weeklyStatus) {
      if (currentDayOfWeek === requestedDayNumber) {
        return {
          canAccess: true,
          reason: 'Access granted for current day',
          shouldRedirect: false,
        };
      }

      return {
        canAccess: false,
        reason: 'This quest is not available yet',
        shouldRedirect: true,
        redirectTo: '/users/quest',
      };
    }

    // Check if quest was already completed
    const completedDays = weeklyStatus.completedDays as string[];
    if (completedDays.includes(requestedDay)) {
      // Allow access to completed quests (for replay)
      return {
        canAccess: true,
        reason: 'Quest already completed - replay allowed',
        shouldRedirect: false,
      };
    }

    // Case 1: Current day matches requested day
    if (currentDayOfWeek === requestedDayNumber) {
      return {
        canAccess: true,
        reason: 'Access granted for current day',
        shouldRedirect: false,
      };
    }

    // Case 2: Requested day is in the future
    if (requestedDayNumber > currentDayOfWeek) {
      return {
        canAccess: false,
        reason: 'This quest is not available yet',
        shouldRedirect: true,
        redirectTo: '/users/quest',
      };
    }

    // Case 3: Requested day is in the past (missed quest)
    // Check if user used a duty pass to unlock this quest
    if (dutyPassUnlock) {
      return {
        canAccess: true,
        reason: 'Access granted via Duty Pass',
        shouldRedirect: false,
      };
    }

    // Quest is missed and no duty pass used
    return {
      canAccess: false,
      reason: 'This quest was missed. Use a Duty Pass to unlock it.',
      shouldRedirect: true,
      redirectTo: '/users/quest',
    };

  } catch (error) {
    console.error('Error validating quest access:', error);
    return {
      canAccess: false,
      reason: 'Failed to validate access',
      shouldRedirect: true,
      redirectTo: '/users/dashboard',
    };
  }
}

/**
 * Helper function to get the start of the week (Monday 00:00)
 * Matches the logic used in weekly quest system
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Helper function to get quest day from route
 */
export function getQuestDayFromPath(pathname: string): QuestDay | null {
  const match = pathname.match(/quest(Monday|Tuesday|Wednesday|Thursday|Friday)/i);
  if (!match) return null;
  return match[1].toLowerCase() as QuestDay;
}