// FILE: app/api/users/quizzes/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Badge awarding logic - SIMPLIFIED to match admin badge creation
    const earnedBadges = [];
    let totalXPGained = 0;

    // KEEP: Sub-Quiz Mastery Badge (Epic - 90%+)
    if (masteryScore >= 90) {
      const subQuizMasteryBadge = await prisma.badge.findFirst({
        where: {
          triggerType: 'quiz_mastery',
          triggerValue: quizId
        }
      });

      if (subQuizMasteryBadge) {
        const existingSubQuizBadge = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId: subQuizMasteryBadge.id
            }
          }
        });

        if (!existingSubQuizBadge) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: subQuizMasteryBadge.id,
              xpAwarded: subQuizMasteryBadge.xpValue
            }
          });

          earnedBadges.push(subQuizMasteryBadge);
          totalXPGained += subQuizMasteryBadge.xpValue;
        }
      }
    }

    // KEEP: Parent Quiz Master Badge (Legendary - ALL sub-quizzes at 90%+)
    if (quiz.parentId && quiz.parent) {
      const parentId = quiz.parentId;
      const allSubQuizIds = quiz.parent.children.map(child => child.id);

      // Get FRESH mastery records (including the one we just created/updated)
      const userMasteries = await prisma.quizMastery.findMany({
        where: {
          userId,
          quizId: { in: allSubQuizIds }
        }
      });

      // Check if ALL sub-quizzes have been attempted AND mastered at 90%+
      const allSubQuizzesMastered =
        userMasteries.length === allSubQuizIds.length &&
        userMasteries.every(mastery => mastery.bestMasteryScore >= 90);

      if (allSubQuizzesMastered) {
        const parentMasterBadge = await prisma.badge.findFirst({
          where: {
            triggerType: 'parent_quiz_mastery',
            triggerValue: parentId
          }
        });

        if (parentMasterBadge) {
          const existingParentBadge = await prisma.userBadge.findUnique({
            where: {
              userId_badgeId: {
                userId,
                badgeId: parentMasterBadge.id
              }
            }
          });

          if (!existingParentBadge) {
            await prisma.userBadge.create({
              data: {
                userId,
                badgeId: parentMasterBadge.id,
                xpAwarded: parentMasterBadge.xpValue
              }
            });

            earnedBadges.push(parentMasterBadge);
            totalXPGained += parentMasterBadge.xpValue;
          }
        }
      }
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