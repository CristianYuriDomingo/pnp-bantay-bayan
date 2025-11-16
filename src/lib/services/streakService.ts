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

    console.log('💔 Streak broken for user:', userId, '- 2+ days missed');

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
 * Updates streak based on completed quest days, not just time elapsed
 * FIXED: Now properly handles multiple duty pass completions in the same session
 */
export async function onQuestComplete(userId: string, questDay: string): Promise<StreakCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastQuestCompletedAt: true,
      lastCompletedQuestDay: true, // NEW: Track which day was last completed
      weeklyQuestStartDate: true,
      timezone: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();

  // Check if this quest was unlocked via duty pass
  const dutyPassUnlock = await prisma.dutyPassUnlock.findFirst({
    where: {
      userId,
      questDay,
      unlockedAt: {
        gte: user.weeklyQuestStartDate || new Date(),
      },
    },
  });

  const isCompletedViaDutyPass = !!dutyPassUnlock;

  // If this is the first quest ever
  if (!user.lastQuestCompletedAt) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: 1,
        longestStreak: Math.max(1, user.longestStreak),
        lastQuestCompletedAt: now,
        lastCompletedQuestDay: questDay,
      },
    });

    console.log('🎉 First quest completed! Streak started:', {
      userId,
      questDay,
      newStreak: 1,
      newLongest: updatedUser.longestStreak,
      viaDutyPass: isCompletedViaDutyPass
    });

    return {
      currentStreak: 1,
      longestStreak: updatedUser.longestStreak,
      streakBroken: false,
      dutyPassUsed: isCompletedViaDutyPass,
      message: 'First quest completed! Streak started!',
    };
  }

  // Check if this is a DIFFERENT quest day than the last one completed
  const isDifferentQuestDay = user.lastCompletedQuestDay !== questDay;
  
  const hoursSinceLastQuest = getHoursBetween(user.lastQuestCompletedAt, now);

  // If completing the SAME quest day again (e.g., replaying Monday after already completing it)
  if (!isDifferentQuestDay) {
    // Just update timestamp, don't change streak
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastQuestCompletedAt: now,
      },
    });

    console.log('✅ Same quest day completed again:', {
      userId,
      questDay,
      currentStreak: user.currentStreak,
    });

    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakBroken: false,
      dutyPassUsed: isCompletedViaDutyPass,
      message: 'Quest completed - same day',
    };
  }

  // DIFFERENT quest day completed:
  // 1. If within same session (< 24 hours) AND different day → INCREMENT (duty pass scenario)
  // 2. If 24-48 hours AND different day → INCREMENT (normal next-day scenario)
  // 3. If via duty pass → ALWAYS INCREMENT (streak protection)
  
  const shouldIncrementStreak = (
    (hoursSinceLastQuest < 24 && isDifferentQuestDay) || // Same session, different quest day (duty pass)
    (hoursSinceLastQuest >= 24 && hoursSinceLastQuest < 48) || // Normal next day
    isCompletedViaDutyPass // Duty pass always protects streak
  );

  if (shouldIncrementStreak) {
    const newStreak = user.currentStreak + 1;
    const newLongest = Math.max(newStreak, user.longestStreak);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastQuestCompletedAt: now,
        lastCompletedQuestDay: questDay,
      },
    });

    console.log('🔥 Streak updated successfully:', {
      userId,
      questDay,
      oldStreak: user.currentStreak,
      newStreak,
      newLongest,
      hoursSinceLastQuest,
      isDifferentQuestDay,
      viaDutyPass: isCompletedViaDutyPass,
      lastQuestCompletedAt: now
    });

    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      streakBroken: false,
      dutyPassUsed: isCompletedViaDutyPass,
      message: isCompletedViaDutyPass 
        ? `Duty pass quest completed! Streak protected: ${newStreak} days! 🔥🎫`
        : `Streak continued! ${newStreak} days! 🔥`,
    };
  }

  // More than 48 hours without duty pass: Reset streak and start new one
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: 1,
      lastQuestCompletedAt: now,
      lastCompletedQuestDay: questDay,
    },
  });

  console.log('⚠️ Streak was broken, starting new streak:', {
    userId,
    questDay,
    oldStreak: user.currentStreak,
    hoursSinceLastQuest
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
 * UPDATED: Creates DutyPassUnlock record for tracking
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
      weeklyQuestStartDate: true,
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

  // Check if duty pass already used for this quest this week
  const existingUnlock = await prisma.dutyPassUnlock.findFirst({
    where: {
      userId,
      questDay,
      unlockedAt: {
        gte: user.weeklyQuestStartDate || new Date(),
      },
    },
  });

  if (existingUnlock) {
    return {
      success: false,
      message: 'Duty pass already used for this quest this week',
      dutyPassesRemaining: user.dutyPasses,
    };
  }

  // Use the duty pass
  const now = new Date();

  // Decrement duty pass and create unlock record in a transaction
  const [updatedUser, unlockRecord] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        dutyPasses: { decrement: 1 },
      },
    }),
    prisma.dutyPassUnlock.create({
      data: {
        userId,
        questDay,
        unlockedAt: now,
      },
    }),
  ]);

  console.log('🎫 Duty pass used:', {
    userId,
    questDay,
    passesRemaining: updatedUser.dutyPasses,
    unlockedAt: now
  });

  return {
    success: true,
    message: `Duty pass used! ${questDay.charAt(0).toUpperCase() + questDay.slice(1)} quest unlocked!`,
    dutyPassesRemaining: updatedUser.dutyPasses,
  };
}