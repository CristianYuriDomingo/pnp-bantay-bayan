// app/api/users/weekly-quest/use-duty-pass/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { useDutyPassForMissedQuest } from '@/lib/services/streakService';
import { canAccessQuest } from '@/lib/services/questAccessService';

interface UseDutyPassRequest {
  questDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
}

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

    // 2. Get request body
    const body = await request.json() as UseDutyPassRequest;
    const { questDay } = body;

    // 3. Validate quest day
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    if (!questDay || !validDays.includes(questDay)) {
      return NextResponse.json(
        { error: 'Invalid quest day. Must be one of: monday, tuesday, wednesday, thursday, friday' },
        { status: 400 }
      );
    }

    // 4. Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        dutyPasses: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 5. Check if user has duty passes
    if (user.dutyPasses <= 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No duty passes available',
          message: 'You need at least 1 Duty Pass to unlock a missed quest. Claim one on Sunday!'
        },
        { status: 400 }
      );
    }

    // 6. Check if quest is actually missed
    const questAccess = await canAccessQuest(user.id, questDay);
    
    if (!questAccess.isMissed) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Quest is not missed',
          message: questAccess.reason
        },
        { status: 400 }
      );
    }

    // 7. Use duty pass
    const result = await useDutyPassForMissedQuest(user.id, questDay);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.message
        },
        { status: 400 }
      );
    }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        questDay,
        dutyPassesRemaining: result.dutyPassesRemaining,
        questUnlocked: true,
      },
    });

  } catch (error) {
    console.error('Error using duty pass:', error);
    return NextResponse.json(
      { 
        error: 'Failed to use duty pass',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
      );
  }
}