// app/api/duty-pass/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to check if it's Sunday
function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

// Helper function to check if user already claimed today
function hasClaimedThisWeek(lastClaimDate: Date | null): boolean {
  if (!lastClaimDate) return false;
  
  const now = new Date();
  const lastClaim = new Date(lastClaimDate);
  
  // Check if it's the same week (Sunday to Saturday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Subtract current day to get to Sunday
    return new Date(d.setDate(diff));
  };
  
  const currentWeekStart = getWeekStart(now);
  const lastClaimWeekStart = getWeekStart(lastClaim);
  
  return currentWeekStart.getTime() === lastClaimWeekStart.getTime();
}

// GET - Check duty pass status
export async function GET(req: NextRequest) {
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
        currentStreak: true,
        longestStreak: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const canClaim = isSunday(now) && !hasClaimedThisWeek(user.lastDutyPassClaim);

    return NextResponse.json({
      dutyPasses: user.dutyPasses,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      canClaim,
      isSunday: isSunday(now),
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

// POST - Claim duty pass
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        dutyPasses: true,
        lastDutyPassClaim: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();

    // Validate it's Sunday
    if (!isSunday(now)) {
      return NextResponse.json(
        { error: 'Duty passes can only be claimed on Sundays' },
        { status: 400 }
      );
    }

    // Validate user hasn't already claimed this week
    if (hasClaimedThisWeek(user.lastDutyPassClaim)) {
      return NextResponse.json(
        { error: 'You have already claimed your duty pass this week' },
        { status: 400 }
      );
    }

    // Update user with new duty pass
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        dutyPasses: { increment: 1 },
        lastDutyPassClaim: now,
      },
      select: {
        dutyPasses: true,
        lastDutyPassClaim: true,
        currentStreak: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Duty pass claimed successfully!',
      dutyPasses: updatedUser.dutyPasses,
      currentStreak: updatedUser.currentStreak,
      claimedAt: updatedUser.lastDutyPassClaim,
    });
  } catch (error) {
    console.error('Error claiming duty pass:', error);
    return NextResponse.json(
      { error: 'Failed to claim duty pass' },
      { status: 500 }
    );
  }
}