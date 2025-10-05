// FILE: app/api/users/quizzes/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BadgeService } from '@/lib/badge-service';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user.id;
    const quizId = params.id;
    const body = await request.json();
    const { answers, timeSpent } = body;

    // Fetch quiz with correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { 
        questions: true,
        parent: {
          select: {
            id: true,
            children: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Calculate score
    let correctAnswers = 0;
    const detailedAnswers = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = (correctAnswers / totalQuestions) * 100;
    const timeAllowed = totalQuestions * quiz.timer;
    const timeEfficiency = Math.max(0, ((timeAllowed - timeSpent) / timeAllowed) * 100);
    
    // Calculate mastery score (70% accuracy + 30% time efficiency)
    const masteryScore = (percentage * 0.7) + (timeEfficiency * 0.3);

    // Debug logging
    console.log('=== QUIZ COMPLETION DEBUG ===');
    console.log('Correct Answers:', correctAnswers);
    console.log('Total Questions:', totalQuestions);
    console.log('Percentage:', percentage);
    console.log('Time Spent:', timeSpent);
    console.log('Time Allowed:', timeAllowed);
    console.log('Time Efficiency:', timeEfficiency);
    console.log('Mastery Score:', masteryScore);
    console.log('=============================');

    // Determine mastery level
    let masteryLevel = null;
    if (percentage === 100) {
      masteryLevel = 'Perfect';
    } else if (masteryScore >= 90) {
      masteryLevel = 'Gold';
    } else if (masteryScore >= 75) {
      masteryLevel = 'Silver';
    } else if (masteryScore >= 60) {
      masteryLevel = 'Bronze';
    }

    // Save quiz attempt
    await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score: correctAnswers,
        totalQuestions,
        percentage,
        timeSpent,
        timeAllowed,
        timeEfficiency,
        masteryScore,
        masteryLevel,
        answers: detailedAnswers
      }
    });

    // Update or create quiz mastery record
    const existingMastery = await prisma.quizMastery.findUnique({
      where: {
        userId_quizId: { userId, quizId }
      }
    });

    if (existingMastery) {
      if (masteryScore > existingMastery.bestMasteryScore) {
        await prisma.quizMastery.update({
          where: { id: existingMastery.id },
          data: {
            bestScore: correctAnswers,
            bestPercentage: percentage,
            bestMasteryScore: masteryScore,
            currentMasteryLevel: masteryLevel,
            attemptCount: { increment: 1 },
            bestAttemptAt: new Date(),
            lastAttemptAt: new Date()
          }
        });
      } else {
        await prisma.quizMastery.update({
          where: { id: existingMastery.id },
          data: {
            attemptCount: { increment: 1 },
            lastAttemptAt: new Date()
          }
        });
      }
    } else {
      await prisma.quizMastery.create({
        data: {
          userId,
          quizId,
          bestScore: correctAnswers,
          bestPercentage: percentage,
          bestMasteryScore: masteryScore,
          currentMasteryLevel: masteryLevel,
          attemptCount: 1
        }
      });
    }

    // Award badges using BadgeService
    const badgeResult = await BadgeService.awardBadgesForQuizCompletion(
      userId,
      quizId,
      masteryScore,
      percentage
    );

    const earnedBadges = badgeResult.newBadges;
    let totalXPGained = earnedBadges.reduce((sum, badge) => sum + (badge.xpValue || 0), 0);

    // Dispatch badge event if badges were earned
    if (earnedBadges.length > 0) {
      console.log(`🏆 User earned ${earnedBadges.length} badges from quiz completion`);
    }

    // Update user XP and level
    if (totalXPGained > 0) {
      const newTotalXP = user.totalXP + totalXPGained;
      const newLevel = Math.floor(newTotalXP / 100) + 1;

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXP: newTotalXP,
          level: newLevel
        }
      });
    }

    return NextResponse.json({
      score: correctAnswers,
      totalQuestions,
      percentage,
      masteryScore,
      masteryLevel,
      timeSpent,
      timeAllowed,
      timeEfficiency,
      answers: detailedAnswers,
      earnedBadges,
      totalXPGained
    });

  } catch (error) {
    console.error('Error completing quiz:', error);
    return NextResponse.json(
      { error: 'Failed to complete quiz' },
      { status: 500 }
    );
  }
}