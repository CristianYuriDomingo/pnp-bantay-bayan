// app/api/users/weekly-quest/claim-reward/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentWeekProgress } from '@/lib/services/weeklyResetService';
import { isWeekend } from '@/lib/utils/timezone';

export async function POST(request: NextRequest) {
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
        totalXP: true,
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

    // 3. Check if it's weekend
    if (!isWeekend(timezone)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Reward chest can only be claimed on weekends (Saturday or Sunday)',
          message: 'Come back on the weekend to claim your reward!'
        },
        { status: 400 }
      );
    }

    // 4. Get current week progress
    const weekProgress = await getCurrentWeekProgress(user.id);

    if (!weekProgress) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No weekly progress found',
          message: 'Complete some quests first!'
        },
        { status: 404 }
      );
    }

    // 5. Check if already claimed
    if (weekProgress.rewardClaimed) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Reward already claimed',
          message: 'You already claimed this week\'s reward. Come back next week!',
          data: {
            claimedAt: weekProgress.claimedAt,
            rewardXP: weekProgress.rewardXP,
          }
        },
        { status: 400 }
      );
    }

    // 6. Check if all quests completed
    if (weekProgress.totalQuestsCompleted < 5) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Not all quests completed',
          message: `Complete all 5 quests to unlock the reward chest! (${weekProgress.totalQuestsCompleted}/5 completed)`,
          data: {
            completed: weekProgress.totalQuestsCompleted,
            required: 5,
            remaining: 5 - weekProgress.totalQuestsCompleted,
          }
        },
        { status: 400 }
      );
    }

    // 7. Calculate reward XP based on completed quests
    let rewardXP = 0;
    const totalCompleted = weekProgress.totalQuestsCompleted;
    
    if (totalCompleted === 1) rewardXP = 50;
    else if (totalCompleted === 2) rewardXP = 100;
    else if (totalCompleted === 3) rewardXP = 150;
    else if (totalCompleted === 4) rewardXP = 200;
    else if (totalCompleted === 5) rewardXP = 300; // Perfect week bonus!

    // 8. Update weekly progress and award XP
    const now = new Date();
    
    await prisma.$transaction([
      // Update weekly progress
      prisma.weeklyQuestProgress.update({
        where: {
          userId_weekStartDate: {
            userId: user.id,
            weekStartDate: user.weeklyQuestStartDate!,
          },
        },
        data: {
          rewardClaimed: true,
          rewardXP,
          claimedAt: now,
        },
      }),
      
      // Award XP to user
      prisma.user.update({
        where: { id: user.id },
        data: {
          totalXP: { increment: rewardXP },
        },
      }),
    ]);

    // 9. Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        totalXP: true,
        level: true,
      },
    });

    // 10. Return success response
    return NextResponse.json({
      success: true,
      message: totalCompleted === 5 
        ? '🎉 Perfect week! You earned the maximum reward!' 
        : '🎁 Weekly reward claimed!',
      data: {
        rewardXP,
        totalXP: updatedUser?.totalXP || 0,
        level: updatedUser?.level || 1,
        completedQuests: totalCompleted,
        perfectWeek: totalCompleted === 5,
        claimedAt: now,
      },
    });

  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json(
      { 
        error: 'Failed to claim reward',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}