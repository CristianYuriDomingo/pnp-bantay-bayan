//lib/services/streakService.ts
import { prisma } from '@/lib/prisma';
import { getHoursBetween } from '@/lib/utils/timezone';

interface StreakCheckResult {
  currentStreak: number;
  longestStreak: number;
  streakBroken: boolean;
  dutyPassUsed: boolean;
  message: string;
}

/**
 * Check and update user's streak based on last activity
 * This should be called:
 * 1. When user logs in
 * 2. Before loading weekly quest status
 * 3. When user completes a quest (via onQuestComplete)
 */
export async function checkAndUpdateStreak(userId: string): Promise<StreakCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastQuestCompletedAt: true,
      dutyPasses: true,
      timezone: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // If user never completed a quest, no streak to check
  if (!user.lastQuestCompletedAt) {
    return {
      currentStreak: 0,
      longestStreak: user.longestStreak,
      streakBroken: false,
      dutyPassUsed: false,
      message: 'No quest completed yet',
    };
  }

  const now = new Date();
  const hoursSinceLastQuest = getHoursBetween(user.lastQuestCompletedAt, now);

  // Less than 24 hours: Same day, no action needed
  if (hoursSinceLastQuest < 24) {
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakBroken: false,
      dutyPassUsed: false,
      message: 'Streak active - same day',
    };
  }

  // 24-48 hours: Missed one day
  if (hoursSinceLastQuest >= 24 && hoursSinceLastQuest < 48) {
    // Grace period: User can still complete today's quest to continue streak
    // OR they need to manually use a duty pass
    // No automatic action taken here
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakBroken: false,
      dutyPassUsed: false,
      message: 'One day missed - grace period',
    };
  }

  // More than 48 hours: Streak is broken (2+ days missed)
  if (hoursSinceLastQuest >= 48) {
    // Reset streak
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: 0,
      },
    });

    return {
      currentStreak: 0,
      longestStreak: user.longestStreak,
      streakBroken: true,
      dutyPassUsed: false,
      message: 'Streak broken - 2+ days missed',
    };
  }

  // Default return (shouldn't reach here)
  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    streakBroken: false,
    dutyPassUsed: false,
    message: 'No change',
  };
}

/**
 * Called when user completes a quest
 * Updates streak if it's a new day
 */
export async function onQuestComplete(userId: string, questDay: string): Promise<StreakCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastQuestCompletedAt: true,
      timezone: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();

  // If this is the first quest ever
  if (!user.lastQuestCompletedAt) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: 1,
        longestStreak: Math.max(1, user.longestStreak),
        lastQuestCompletedAt: now,
      },
    });

    return {
      currentStreak: 1,
      longestStreak: updatedUser.longestStreak,
      streakBroken: false,
      dutyPassUsed: false,
      message: 'First quest completed! Streak started!',
    };
  }

  const hoursSinceLastQuest = getHoursBetween(user.lastQuestCompletedAt, now);

  // Same day: Update timestamp but don't change streak
  if (hoursSinceLastQuest < 24) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastQuestCompletedAt: now,
      },
    });

    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakBroken: false,
      dutyPassUsed: false,
      message: 'Quest completed - same day',
    };
  }

  // Next day (24-48 hours): Increment streak
  if (hoursSinceLastQuest >= 24 && hoursSinceLastQuest < 48) {
    const newStreak = user.currentStreak + 1;
    const newLongest = Math.max(newStreak, user.longestStreak);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastQuestCompletedAt: now,
      },
    });

    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      streakBroken: false,
      dutyPassUsed: false,
      message: `Streak continued! ${newStreak} days! 🔥`,
    };
  }

  // More than 48 hours: This shouldn't happen if checkAndUpdateStreak was called
  // But if it does, reset streak and start new one
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: 1,
      lastQuestCompletedAt: now,
    },
  });

  return {
    currentStreak: 1,
    longestStreak: user.longestStreak,
    streakBroken: true,
    dutyPassUsed: false,
    message: 'Streak was broken, starting new streak',
  };
}

/**
 * Manually use duty pass to unlock a missed quest
 * This maintains the streak
 */
export async function useDutyPassForMissedQuest(userId: string, questDay: string): Promise<{
  success: boolean;
  message: string;
  dutyPassesRemaining: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dutyPasses: true,
      dutyPassUsedDates: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user has duty passes
  if (user.dutyPasses <= 0) {
    return {
      success: false,
      message: 'No duty passes available',
      dutyPassesRemaining: 0,
    };
  }

  // Use the duty pass
  const now = new Date();
  
  // Parse existing used dates from JSON
  let usedDates: string[] = [];
  if (user.dutyPassUsedDates) {
    try {
      const parsed = user.dutyPassUsedDates;
      if (Array.isArray(parsed)) {
        usedDates = parsed.map((date: any) => {
          if (typeof date === 'string') return date;
          if (date instanceof Date) return date.toISOString();
          return new Date(date).toISOString();
        });
      }
    } catch (error) {
      console.error('Error parsing dutyPassUsedDates:', error);
      usedDates = [];
    }
  }

  // Add new date as ISO string
  const updatedDates = [...usedDates, now.toISOString()];

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      dutyPasses: { decrement: 1 },
      dutyPassUsedDates: updatedDates,
    },
  });

  return {
    success: true,
    message: `Duty pass used! ${questDay} quest unlocked!`,
    dutyPassesRemaining: updatedUser.dutyPasses,
  };
}