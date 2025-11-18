// app/api/users/quest/tuesday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateQuestAccess } from '@/lib/quest-access-validator';

export const dynamic = 'force-dynamic';

// GET - Fetch Quest Tuesday data for user
export async function GET(req: NextRequest) {
  console.log('🎯 Quest Tuesday API called');
  
  try {
    const session = await getServerSession(authOptions);

    console.log('🔍 Session check:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    });

    if (!session?.user) {
      console.log('❌ No session found');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required. Please sign in.',
          data: null
        },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    console.log('✅ User authenticated:', session.user.email);

    // ========================================
    // QUEST ACCESS VALIDATION
    // ========================================
    const accessValidation = await validateQuestAccess(session.user.id, 'tuesday');
    
    if (!accessValidation.canAccess) {
      console.log('🚫 Access denied:', accessValidation.reason);
      return NextResponse.json(
        {
          success: false,
          error: accessValidation.reason,
          data: null,
          shouldRedirect: accessValidation.shouldRedirect,
          redirectTo: accessValidation.redirectTo,
        },
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    console.log('✅ Access granted:', accessValidation.reason);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', data: null },
        { status: 404 }
      );
    }

    // Fetch active Quest Tuesday
    const questTuesday = await prisma.questTuesday.findFirst({
      where: { isActive: true },
      include: {
        questions: {
          select: {
            id: true,
            questionNumber: true,
            question: true,
            // Don't send correctAnswer and explanation to client yet!
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    console.log('📦 Quest found:', questTuesday ? `ID: ${questTuesday.id}, Questions: ${questTuesday.questions.length}` : 'No active quest');

    if (!questTuesday) {
      return NextResponse.json(
        { success: false, error: 'No active Quest Tuesday available', data: null },
        { status: 404 }
      );
    }

    // Fetch user's progress
    const userProgress = await prisma.questTuesdayProgress.findUnique({
      where: {
        userId_questTuesdayId: {
          userId: user.id,
          questTuesdayId: questTuesday.id
        }
      }
    });

    console.log('📊 User progress:', userProgress ? `Question ${userProgress.currentQuestion}, Lives: ${userProgress.livesRemaining}` : 'None');
    console.log('✅ Returning quest data with access validation passed');

    return NextResponse.json({
      success: true,
      data: {
        id: questTuesday.id,
        title: questTuesday.title,
        lives: questTuesday.lives,
        totalQuestions: questTuesday.questions.length,
        questions: questTuesday.questions,
        userProgress: userProgress ? {
          currentQuestion: userProgress.currentQuestion,
          completedQuestions: userProgress.completedQuestions as number[],
          livesRemaining: userProgress.livesRemaining,
          score: userProgress.score,
          isCompleted: userProgress.isCompleted,
          isFailed: userProgress.isFailed
        } : null
      },
      error: null
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('💥 Error fetching Quest Tuesday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quest data', data: null },
      { status: 500 }
    );
  }
}