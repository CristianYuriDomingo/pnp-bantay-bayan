// app/api/users/quest/tuesday/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { onQuestComplete } from '@/lib/services/streakService';
import { getCurrentWeekProgress } from '@/lib/services/weeklyResetService';

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

    if (!questTuesdayId || !questionId || typeof selectedAnswer !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    const isCorrect = selectedAnswer === question.correctAnswer;

    let progress = await prisma.questTuesdayProgress.findUnique({
      where: {
        userId_questTuesdayId: {
          userId: user.id,
          questTuesdayId: questTuesdayId
        }
      }
    });

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

    if (newCompletedQuestions.length >= quest.questions.length && !isFailed) {
      isCompleted = true;
    }

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

    // 🆕 WEEKLY QUEST INTEGRATION
    if (isCompleted) {
      try {
        console.log('🎯 Quest completed! Updating weekly progress and streak...');
        
        // 1. Update weekly progress FIRST
        const userWithWeek = await prisma.user.findUnique({
          where: { id: user.id },
          select: { weeklyQuestStartDate: true },
        });

        if (userWithWeek?.weeklyQuestStartDate) {
          const currentProgress = await getCurrentWeekProgress(user.id);
          
          if (currentProgress) {
            const completedDays = Array.isArray(currentProgress.completedDays) 
              ? currentProgress.completedDays as string[]
              : [];
            
            if (!completedDays.includes('tuesday')) {
              await prisma.weeklyQuestProgress.update({
                where: {
                  userId_weekStartDate: {
                    userId: user.id,
                    weekStartDate: userWithWeek.weeklyQuestStartDate,
                  },
                },
                data: {
                  completedDays: [...completedDays, 'tuesday'],
                  totalQuestsCompleted: { increment: 1 },
                },
              });
              console.log('✅ Weekly progress updated: Tuesday added');
            }
          }
        }

        // 2. Update streak AFTER weekly progress
        const streakResult = await onQuestComplete(user.id, 'tuesday');
        console.log('🔥 Streak updated:', {
          currentStreak: streakResult.currentStreak,
          longestStreak: streakResult.longestStreak,
          message: streakResult.message
        });

        // 3. Fetch fresh user data to return updated values
        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            currentStreak: true,
            longestStreak: true,
          },
        });

        console.log('✅ Fresh user data fetched:', updatedUser);

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
            totalQuestions: quest.questions.length,
            // Return fresh streak data
            streak: {
              current: updatedUser?.currentStreak || streakResult.currentStreak,
              longest: updatedUser?.longestStreak || streakResult.longestStreak,
              message: streakResult.message
            }
          },
          message: '🎉 Quest completed! Streak updated!'
        });

      } catch (weeklyError) {
        console.error('⚠️ Error updating weekly progress:', weeklyError);
      }
    }

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