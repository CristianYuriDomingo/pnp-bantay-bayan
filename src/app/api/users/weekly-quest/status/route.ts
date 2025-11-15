// app/api/users/weekly-quest/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAndResetWeek, getCurrentWeekProgress } from '@/lib/services/weeklyResetService';
import { checkAndUpdateStreak } from '@/lib/services/streakService';
import { getWeeklyQuestStatuses } from '@/lib/services/questAccessService';
import { getCurrentDayOfWeek, isWeekend, isSunday } from '@/lib/utils/timezone';

export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        timezone: true,
        currentStreak: true,
        longestStreak: true,
        dutyPasses: true,
        lastDutyPassClaim: true,
        weeklyQuestStartDate: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const timezone = user.timezone || 'Asia/Manila';

    // 3. Check and reset week if needed
    const resetResult = await checkAndResetWeek(user.id);

    // 4. Check and update streak
    const streakResult = await checkAndUpdateStreak(user.id);

    // 5. Get current week progress
    const weekProgress = await getCurrentWeekProgress(user.id);

    // 6. Get all quest statuses (available, locked, missed, completed)
    const questStatuses = await getWeeklyQuestStatuses(user.id);

    // 7. Get current day info
    const currentDay = getCurrentDayOfWeek(timezone);
    const isCurrentlyWeekend = isWeekend(timezone);
    const isCurrentlySunday = isSunday(timezone);

    // 8. Calculate reward chest status
    const totalCompleted = weekProgress?.totalQuestsCompleted || 0;
    const allQuestsCompleted = totalCompleted === 5;
    const canClaimReward = allQuestsCompleted && isCurrentlyWeekend && !weekProgress?.rewardClaimed;

    // 9. Check if user can claim duty pass (Sunday + not claimed this week)
    const canClaimDutyPass = isCurrentlySunday && (
      !user.lastDutyPassClaim || 
      new Date(user.lastDutyPassClaim).getTime() < (user.weeklyQuestStartDate?.getTime() || 0)
    );

    // 10. Calculate reward XP based on completed quests
    let potentialRewardXP = 0;
    if (totalCompleted === 1) potentialRewardXP = 50;
    else if (totalCompleted === 2) potentialRewardXP = 100;
    else if (totalCompleted === 3) potentialRewardXP = 150;
    else if (totalCompleted === 4) potentialRewardXP = 200;
    else if (totalCompleted === 5) potentialRewardXP = 300; // +50 bonus for perfect week

    // 11. Return comprehensive status
    return NextResponse.json({
      success: true,
      data: {
        // Week info
        weekReset: resetResult.weekReset,
        weekStartDate: user.weeklyQuestStartDate,
        currentDay,
        isWeekend: isCurrentlyWeekend,
        
        // Streak info
        currentStreak: streakResult.currentStreak,
        longestStreak: streakResult.longestStreak,
        streakBroken: streakResult.streakBroken,
        streakMessage: streakResult.message,
        
        // Duty Pass info
        dutyPasses: user.dutyPasses,
        canClaimDutyPass,
        lastDutyPassClaim: user.lastDutyPassClaim,
        
        // Weekly Progress
        weeklyProgress: {
          completedDays: weekProgress?.completedDays || [],
          totalQuestsCompleted: totalCompleted,
          rewardClaimed: weekProgress?.rewardClaimed || false,
          rewardXP: weekProgress?.rewardXP || 0,
          claimedAt: weekProgress?.claimedAt,
        },
        
        // Quest Statuses (Monday - Friday)
        quests: questStatuses,
        
        // Reward Chest Status
        rewardChest: {
          isLocked: !allQuestsCompleted,
          isReady: canClaimReward,
          isClaimed: weekProgress?.rewardClaimed || false,
          potentialXP: potentialRewardXP,
          canClaim: canClaimReward,
          requiresCompletion: 5 - totalCompleted,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching weekly quest status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch weekly quest status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}