//app/api/users/quest/wednesday/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST - Submit answer for Wednesday quest
export async function POST(request: NextRequest) {
  console.log('🎯 Submit Wednesday answer API called');
  
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
    const { questWednesdayId, userAnswer } = body;

    console.log('📝 Submit data:', { questWednesdayId, userAnswer });

    if (!questWednesdayId || !userAnswer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', data: null },
        { status: 400 }
      );
    }

    // Validate userAnswer format
    if (!Array.isArray(userAnswer) || userAnswer.length !== 9) {
      return NextResponse.json(
        { success: false, error: 'Invalid answer format. Must be 9 digits.', data: null },
        { status: 400 }
      );
    }

    // Fetch the quest
    const quest = await prisma.questWednesday.findUnique({
      where: { id: questWednesdayId }
    });

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found', data: null },
        { status: 404 }
      );
    }

    // Check if answer is correct
    // User's full answer should be: 0 + 9 + their 9 digits
    const userFullAnswer = '09' + userAnswer.join('');
    const isCorrect = userFullAnswer === quest.correctNumber;

    console.log('🎲 Answer check:', {
      userAnswer: userFullAnswer,
      correctAnswer: quest.correctNumber,
      isCorrect
    });

    // Get or create user progress
    let progress = await prisma.questWednesdayProgress.findUnique({
      where: {
        userId_questWednesdayId: {
          userId: session.user.id,
          questWednesdayId: questWednesdayId
        }
      }
    });

    if (!progress) {
      progress = await prisma.questWednesdayProgress.create({
        data: {
          userId: session.user.id,
          questWednesdayId: questWednesdayId,
          isCompleted: false,
          attempts: 0
        }
      });
    }

    if (isCorrect) {
      // Update progress as completed
      progress = await prisma.questWednesdayProgress.update({
        where: { id: progress.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          lastPlayedAt: new Date()
        }
      });

      console.log('✅ Quest completed!');

      return NextResponse.json({
        success: true,
        data: {
          correct: true,
          isCompleted: true,
          progress: {
            isCompleted: progress.isCompleted,
            attempts: progress.attempts,
            completedAt: progress.completedAt
          }
        },
        message: 'Correct answer! Quest completed!'
      });

    } else {
      // Increment attempts
      progress = await prisma.questWednesdayProgress.update({
        where: { id: progress.id },
        data: {
          attempts: progress.attempts + 1,
          lastPlayedAt: new Date()
        }
      });

      console.log('❌ Wrong answer, attempts:', progress.attempts);

      return NextResponse.json({
        success: true,
        data: {
          correct: false,
          attempts: progress.attempts
        },
        message: 'Wrong answer! Try again.'
      });
    }

  } catch (error) {
    console.error('💥 Error submitting answer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit answer', data: null },
      { status: 500 }
    );
  }
}