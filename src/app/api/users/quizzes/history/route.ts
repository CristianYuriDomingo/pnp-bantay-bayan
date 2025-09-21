// FILE 2: app/api/users/quizzes/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch user's quiz history and mastery progress
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get URL search parameters
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch quiz mastery overview
    const quizMasteries = await prisma.quizMastery.findMany({
      where: {
        userId: user.id,
        ...(quizId && { quizId })
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            timer: true,
            questions: {
              select: { id: true }
            }
          }
        }
      },
      orderBy: {
        bestMasteryScore: 'desc'
      }
    });

    // Fetch recent quiz attempts
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        ...(quizId && { quizId })
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            timer: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Calculate statistics
    const totalAttempts = await prisma.quizAttempt.count({
      where: {
        userId: user.id,
        ...(quizId && { quizId })
      }
    });

    const masteryStats = {
      perfect: quizMasteries.filter(m => m.currentMasteryLevel === 'Perfect').length,
      gold: quizMasteries.filter(m => m.currentMasteryLevel === 'Gold').length,
      silver: quizMasteries.filter(m => m.currentMasteryLevel === 'Silver').length,
      bronze: quizMasteries.filter(m => m.currentMasteryLevel === 'Bronze').length,
      total: quizMasteries.length
    };

    const averageScore = recentAttempts.length > 0 
      ? recentAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / recentAttempts.length
      : 0;

    // Transform data for frontend
    const masteryOverview = quizMasteries.map(mastery => ({
      quizId: mastery.quizId,
      quizTitle: mastery.quiz.title,
      questionCount: mastery.quiz.questions.length,
      masteryLevel: mastery.currentMasteryLevel,
      bestScore: mastery.bestScore,
      bestPercentage: Math.round(mastery.bestPercentage * 100) / 100,
      bestMasteryScore: Math.round(mastery.bestMasteryScore * 100) / 100,
      attemptCount: mastery.attemptCount,
      firstAttemptAt: mastery.firstAttemptAt,
      bestAttemptAt: mastery.bestAttemptAt,
      lastAttemptAt: mastery.lastAttemptAt
    }));

    const attemptHistory = recentAttempts.map(attempt => ({
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz.title,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: Math.round(attempt.percentage * 100) / 100,
      timeSpent: attempt.timeSpent,
      timeAllowed: attempt.timeAllowed,
      timeEfficiency: Math.round(attempt.timeEfficiency * 100) / 100,
      masteryScore: Math.round(attempt.masteryScore * 100) / 100,
      masteryLevel: attempt.masteryLevel,
      createdAt: attempt.createdAt
    }));

    return NextResponse.json({
      masteryOverview,
      attemptHistory,
      statistics: {
        totalAttempts,
        totalQuizzesAttempted: masteryOverview.length,
        averageScore: Math.round(averageScore * 100) / 100,
        masteryStats
      },
      pagination: {
        limit,
        offset,
        total: totalAttempts,
        hasMore: offset + limit < totalAttempts
      }
    });

  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz history' },
      { status: 500 }
    );
  }
}