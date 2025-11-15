// app/api/users/quest/tuesday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch Quest Tuesday data for user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
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

    if (!questTuesday) {
      return NextResponse.json(
        { success: false, error: 'No active Quest Tuesday available' },
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
      }
    });

  } catch (error) {
    console.error('Error fetching Quest Tuesday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quest data' },
      { status: 500 }
    );
  }
}