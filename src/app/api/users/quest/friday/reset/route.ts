// ============================================
// app/api/users/quest/friday/reset/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST - Reset user progress (for "Play Again" functionality)
export async function POST(request: NextRequest) {
  console.log('🎯 Reset progress API called');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('❌ No session found');
      return NextResponse.json(
        { success: false, error: 'Authentication required', data: null },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', session.user.email);

    const body = await request.json();
    const { questFridayId } = body;

    console.log('📝 Reset quest ID:', questFridayId);

    if (!questFridayId) {
      return NextResponse.json(
        { success: false, error: 'Quest ID is required', data: null },
        { status: 400 }
      );
    }

    // Delete existing progress
    await prisma.questFridayProgress.deleteMany({
      where: {
        userId: session.user.id,
        questFridayId: questFridayId
      }
    });

    console.log('✅ Progress reset successfully');

    return NextResponse.json({
      success: true,
      data: { reset: true },
      message: 'Progress reset successfully'
    });

  } catch (error) {
    console.error('💥 Error resetting progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset progress', data: null },
      { status: 500 }
    );
  }
}