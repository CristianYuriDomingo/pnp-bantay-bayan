// app/api/users/quest/tuesday/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { questTuesdayId, questionId, selectedAnswer } = body;

    // Validation
    if (!questTuesdayId || !questionId || typeof selectedAnswer !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch the question to check the answer
    const question = await prisma.questTuesdayQuestion.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        questionNumber: true,
        correctAnswer: true,
        explanation: true,
        questTuesdayId: true
      }
    });

    if (!question || question.questTuesdayId !== questTuesdayId) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }

    // Check if answer is correct
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Get or create user progress
    let progress = await prisma.questTuesdayProgress.findUnique({
      where: {
        userId_questTuesdayId: {
          userId: user.id,
          questTuesdayId: questTuesdayId
        }
      }
    });

    // Get quest data for lives
    const quest = await prisma.questTuesday.findUnique({
      where: { id: questTuesdayId },
      select: { 
        lives: true,
        questions: {
          select: { id: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    if (!progress) {
      // Create new progress
      progress = await prisma.questTuesdayProgress.create({
        data: {
          userId: user.id,
          questTuesdayId: questTuesdayId,
          currentQuestion: question.questionNumber,
          livesRemaining: quest.lives,
          completedQuestions: [],
          answeredQuestions: []
        }
      });
    }

    // Check if already answered or game is over
    const answeredQuestions = progress.answeredQuestions as any[];
    const alreadyAnswered = answeredQuestions.some(
      (a: any) => a.questionNumber === question.questionNumber
    );

    if (alreadyAnswered) {
      return NextResponse.json(
        { success: false, error: 'Question already answered' },
        { status: 400 }
      );
    }

    if (progress.isCompleted) {
      return NextResponse.json(
        { success: false, error: 'Quest already completed' },
        { status: 400 }
      );
    }

    if (progress.isFailed) {
      return NextResponse.json(
        { success: false, error: 'Quest already failed' },
        { status: 400 }
      );
    }

    // Update progress
    const completedQuestions = progress.completedQuestions as number[];
    const newCompletedQuestions = [...completedQuestions, question.questionNumber];
    
    const newAnsweredQuestions = [
      ...answeredQuestions,
      {
        questionNumber: question.questionNumber,
        questionId: question.id,
        selectedAnswer,
        isCorrect,
        answeredAt: new Date()
      }
    ];

    let newLivesRemaining = progress.livesRemaining;
    let newScore = progress.score;
    let isFailed = false;
    let isCompleted = false;

    if (isCorrect) {
      newScore += 1;
    } else {
      newLivesRemaining -= 1;
      if (newLivesRemaining <= 0) {
        isFailed = true;
      }
    }

    // Check if all questions answered
    if (newCompletedQuestions.length >= quest.questions.length && !isFailed) {
      isCompleted = true;
    }

    // Update progress in database
    const updatedProgress = await prisma.questTuesdayProgress.update({
      where: {
        userId_questTuesdayId: {
          userId: user.id,
          questTuesdayId: questTuesdayId
        }
      },
      data: {
        currentQuestion: question.questionNumber + 1,
        completedQuestions: newCompletedQuestions,
        answeredQuestions: newAnsweredQuestions,
        livesRemaining: newLivesRemaining,
        score: newScore,
        isCompleted,
        isFailed,
        completedAt: (isCompleted || isFailed) ? new Date() : null,
        lastPlayedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        correct: isCorrect,
        explanation: question.explanation,
        correctAnswer: question.correctAnswer,
        livesRemaining: newLivesRemaining,
        score: newScore,
        isCompleted,
        isFailed,
        currentQuestion: question.questionNumber + 1,
        totalQuestions: quest.questions.length
      }
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}