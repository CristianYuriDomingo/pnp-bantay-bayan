// ============================================
// app/api/users/quest/friday/submit/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST - Submit answer
export async function POST(request: NextRequest) {
  console.log('🎯 Submit answer API called');
  
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
    const { questFridayId, selectedRankId } = body;

    console.log('📝 Submit data:', { questFridayId, selectedRankId });

    if (!questFridayId || !selectedRankId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', data: null },
        { status: 400 }
      );
    }

    // Fetch the quest with rank options
    const quest = await prisma.questFriday.findUnique({
      where: { id: questFridayId },
      include: {
        rankOptions: true
      }
    });

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found', data: null },
        { status: 404 }
      );
    }

    const selectedRank = quest.rankOptions.find(r => r.id === selectedRankId);
    
    if (!selectedRank) {
      return NextResponse.json(
        { success: false, error: 'Invalid rank selection', data: null },
        { status: 400 }
      );
    }

    const isCorrect = selectedRank.isCorrect;
    console.log('🎲 Answer is:', isCorrect ? 'CORRECT' : 'WRONG');

    // Get or create user progress
    let progress = await prisma.questFridayProgress.findUnique({
      where: {
        userId_questFridayId: {
          userId: session.user.id,
          questFridayId: questFridayId
        }
      }
    });

    if (!progress) {
      progress = await prisma.questFridayProgress.create({
        data: {
          userId: session.user.id,
          questFridayId: questFridayId,
          selectedRank: selectedRankId,
          isCorrect: isCorrect,
          isCompleted: isCorrect,
          attempts: 1,
          completedAt: isCorrect ? new Date() : undefined
        }
      });
    } else {
      progress = await prisma.questFridayProgress.update({
        where: { id: progress.id },
        data: {
          selectedRank: selectedRankId,
          isCorrect: isCorrect,
          isCompleted: isCorrect,
          attempts: progress.attempts + 1,
          completedAt: isCorrect ? new Date() : undefined,
          lastPlayedAt: new Date()
        }
      });
    }

    console.log('✅ Progress updated:', { 
      isCorrect, 
      attempts: progress.attempts,
      isCompleted: progress.isCompleted
    });

    return NextResponse.json({
      success: true,
      data: {
        correct: isCorrect,
        isCompleted: isCorrect,
        attempts: progress.attempts,
        progress: {
          isCorrect: progress.isCorrect,
          isCompleted: progress.isCompleted,
          attempts: progress.attempts
        }
      },
      message: isCorrect ? 'Correct answer!' : 'Wrong answer!'
    });

  } catch (error) {
    console.error('💥 Error submitting answer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit answer', data: null },
      { status: 500 }
    );
  }
}
