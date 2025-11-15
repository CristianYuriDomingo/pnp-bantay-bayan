//lib/services/weeklyResetService.ts
import { prisma } from '@/lib/prisma';
import { getWeekStart, isSameWeek } from '@/lib/utils/timezone';

interface WeeklyResetResult {
  weekReset: boolean;
  newWeekStart: Date | null;
  message: string;
}

/**
 * Check if it's a new week and reset progress if needed
 * Call this:
 * 1. When user logs in
 * 2. Before loading weekly quest status
 * 3. Before allowing quest access
 */
export async function checkAndResetWeek(userId: string): Promise<WeeklyResetResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      weeklyQuestStartDate: true,
      timezone: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const timezone = user.timezone || 'Asia/Manila';
  const currentWeekStart = getWeekStart(timezone);

  // If no week start date set, this is first time - initialize
  if (!user.weeklyQuestStartDate) {
    await initializeWeeklyProgress(userId, currentWeekStart);
    
    return {
      weekReset: false,
      newWeekStart: currentWeekStart,
      message: 'Weekly progress initialized',
    };
  }

  // Check if we're still in the same week
  if (isSameWeek(user.weeklyQuestStartDate, currentWeekStart, timezone)) {
    return {
      weekReset: false,
      newWeekStart: null,
      message: 'Same week, no reset needed',
    };
  }

  // New week detected! Reset everything
  await resetWeeklyProgress(userId, currentWeekStart);

  return {
    weekReset: true,
    newWeekStart: currentWeekStart,
    message: 'New week started! Progress reset.',
  };
}

/**
 * Initialize weekly progress for first-time users
 */
async function initializeWeeklyProgress(userId: string, weekStart: Date): Promise<void> {
  // Update user's week start date
  await prisma.user.update({
    where: { id: userId },
    data: {
      weeklyQuestStartDate: weekStart,
    },
  });

  // Create WeeklyQuestProgress record
  await prisma.weeklyQuestProgress.create({
    data: {
      userId,
      weekStartDate: weekStart,
      completedDays: [],
      totalQuestsCompleted: 0,
      rewardClaimed: false,
      rewardXP: 0,
    },
  });
}

/**
 * Reset all weekly progress for new week
 */
async function resetWeeklyProgress(userId: string, newWeekStart: Date): Promise<void> {
  // Update user's week start date
  await prisma.user.update({
    where: { id: userId },
    data: {
      weeklyQuestStartDate: newWeekStart,
    },
  });

  // Create new WeeklyQuestProgress record for new week
  await prisma.weeklyQuestProgress.create({
    data: {
      userId,
      weekStartDate: newWeekStart,
      completedDays: [],
      totalQuestsCompleted: 0,
      rewardClaimed: false,
      rewardXP: 0,
    },
  });

  // Reset all quest progress (Monday-Friday)
  // Note: We're resetting isCompleted but keeping the records for history
  
  // Reset Monday Progress
  await prisma.questMondayProgress.updateMany({
    where: { userId },
    data: {
      isCompleted: false,
      completedAt: null,
      currentLevel: 1,
      attempts: 0,
      lastPlayedAt: new Date(),
    },
  });

  // Reset Tuesday Progress
  await prisma.questTuesdayProgress.updateMany({
    where: { userId },
    data: {
      isCompleted: false,
      isFailed: false,
      completedAt: null,
      currentQuestion: 1,
      livesRemaining: 3,
      score: 0,
      answeredQuestions: [],
      completedQuestions: [],
      lastPlayedAt: new Date(),
    },
  });

  // Reset Wednesday Progress
  await prisma.questWednesdayProgress.updateMany({
    where: { userId },
    data: {
      isCompleted: false,
      isCorrect: false,
      completedAt: null,
      userAnswer: null,
      attempts: 0,
      lastPlayedAt: new Date(),
    },
  });

  // Reset Thursday Progress
  await prisma.questThursdayProgress.updateMany({
    where: { userId },
    data: {
      isCompleted: false,
      isFailed: false,
      completedAt: null,
      currentItem: 1,
      livesRemaining: 3,
      score: 0,
      answeredItems: [],
      completedItems: [],
      lastPlayedAt: new Date(),
    },
  });

  // Reset Friday Progress
  await prisma.questFridayProgress.updateMany({
    where: { userId },
    data: {
      isCompleted: false,
      isCorrect: false,
      completedAt: null,
      selectedRank: null,
      attempts: 0,
      lastPlayedAt: new Date(),
    },
  });
}

/**
 * Get current week's progress
 */
export async function getCurrentWeekProgress(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      weeklyQuestStartDate: true,
      timezone: true,
    },
  });

  if (!user || !user.weeklyQuestStartDate) {
    return null;
  }

  const progress = await prisma.weeklyQuestProgress.findUnique({
    where: {
      userId_weekStartDate: {
        userId,
        weekStartDate: user.weeklyQuestStartDate,
      },
    },
  });

  return progress;
}