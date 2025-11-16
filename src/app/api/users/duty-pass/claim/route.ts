// app/api/users/duty-pass/claim/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isSunday } from '@/lib/utils/timezone';

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

    // 3. Check if it's Sunday
    if (!isSunday(timezone)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Duty Pass can only be claimed on Sundays',
          message: 'Come back on Sunday to claim your weekly Duty Pass! 🎫'
        },
        { status: 400 }
      );
    }

    // 4. Check if already claimed this week
    const weekStart = user.weeklyQuestStartDate;
    const lastClaim = user.lastDutyPassClaim;

    if (weekStart && lastClaim) {
      // FIXED: Compare timestamps properly
      const weekStartTime = new Date(weekStart).getTime();
      const lastClaimTime = new Date(lastClaim).getTime();
      
      // If last claim was after this week started, they already claimed
      if (lastClaimTime >= weekStartTime) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Duty Pass already claimed this week',
            message: 'You already claimed your Duty Pass this week. Come back next Sunday!',
            data: {
              lastClaimed: lastClaim,
              currentDutyPasses: user.dutyPasses,
            }
          },
          { status: 400 }
        );
      }
    }

    // 5. Award duty pass
    const now = new Date();
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        dutyPasses: { increment: 1 },
        lastDutyPassClaim: now,
      },
      select: {
        dutyPasses: true,
      },
    });

    // 6. Return success response
    return NextResponse.json({
      success: true,
      message: '🎫 You earned 1 Duty Pass! Use it wisely to protect your streak!',
      data: {
        dutyPassesTotal: updatedUser.dutyPasses,
        claimedAt: now,
        nextClaimAvailable: 'Next Sunday',
      },
    });

  } catch (error) {
    console.error('Error claiming duty pass:', error);
    return NextResponse.json(
      { 
        error: 'Failed to claim duty pass',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Check if user can claim (for UI status)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        dutyPasses: true,
        lastDutyPassClaim: true,
        weeklyQuestStartDate: true,
        currentStreak: true,
        longestStreak: true,
        timezone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const timezone = user.timezone || 'Asia/Manila';
    const isCurrentlySunday = isSunday(timezone);
    
    // Check if can claim
    let canClaim = false;
    if (isCurrentlySunday) {
      const weekStart = user.weeklyQuestStartDate;
      const lastClaim = user.lastDutyPassClaim;
      
      if (!lastClaim) {
        canClaim = true; // Never claimed before
      } else if (weekStart) {
        // Can claim if last claim was before this week started
        canClaim = new Date(lastClaim).getTime() < new Date(weekStart).getTime();
      }
    }

    return NextResponse.json({
      dutyPasses: user.dutyPasses,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      canClaim,
      isSunday: isCurrentlySunday,
      lastClaimDate: user.lastDutyPassClaim,
    });
  } catch (error) {
    console.error('Error fetching duty pass status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch duty pass status' },
      { status: 500 }
    );
  }
}