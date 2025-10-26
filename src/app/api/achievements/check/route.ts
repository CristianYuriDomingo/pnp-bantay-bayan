//app/api/achievements/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkAndAwardAchievements } from '@/lib/achievement-checker';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { actionType } = body;

    if (!actionType || !['profile_update', 'badge_earned', 'rank_promotion'].includes(actionType)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      );
    }

    const userId = session.user.id as string;

    // Check and award achievements
    const result = await checkAndAwardAchievements(userId, actionType);

    return NextResponse.json({
      success: true,
      newAchievements: result.newAchievements,
      xpAwarded: result.xpAwarded,
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}