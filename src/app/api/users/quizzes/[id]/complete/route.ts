// FILE 1: app/api/users/quizzes/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Complete quiz submission with mastery calculation and badge awarding
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session - adjust this based on your auth setup
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

    const body = await request.json();
    const { 
      answers, 
      timeSpent, 
      score, 
      totalQuestions 
    } = body;

    // Validate input
    if (!answers || !Array.isArray(answers) || typeof timeSpent !== 'number') {
      return NextResponse.json(
        { error: 'Invalid submission data' },
        { status: 400 }
      );
    }

    // Get quiz data to calculate mastery
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: true
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Calculate mastery metrics
    const timeAllowed = quiz.questions.length * quiz.timer;
    const percentage = (score / totalQuestions) * 100;
    const timeEfficiency = Math.max(0, ((timeAllowed - timeSpent) / timeAllowed) * 100);
    
    // Mastery calculation formula
    const baseScore = percentage * 0.6; // 60% weight for accuracy
    const timeBonus = timeEfficiency * 0.25; // 25% weight for time efficiency
    const perfectBonus = (score === totalQuestions ? 15 : 0); // 15% bonus for perfect score
    
    const masteryScore = Math.min(100, baseScore + timeBonus + perfectBonus);
    
    // Determine mastery level
    let masteryLevel: string | null = null;
    if (masteryScore >= 100) {
      masteryLevel = 'Perfect';
    } else if (masteryScore >= 90) {
      masteryLevel = 'Gold';
    } else if (masteryScore >= 75) {
      masteryLevel = 'Silver';
    } else if (masteryScore >= 60) {
      masteryLevel = 'Bronze';
    }

    // Save quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: params.id,
        score,
        totalQuestions,
        percentage,
        timeSpent,
        timeAllowed,
        timeEfficiency,
        masteryScore,
        masteryLevel,
        answers: answers
      }
    });

    // Update or create quiz mastery record
    const existingMastery = await prisma.quizMastery.findUnique({
      where: {
        userId_quizId: {
          userId: user.id,
          quizId: params.id
        }
      }
    });

    let quizMastery;
    let isNewBestScore = false;

    if (existingMastery) {
      // Update if this is a better score
      if (masteryScore > existingMastery.bestMasteryScore) {
        isNewBestScore = true;
        quizMastery = await prisma.quizMastery.update({
          where: {
            userId_quizId: {
              userId: user.id,
              quizId: params.id
            }
          },
          data: {
            bestScore: score,
            bestPercentage: percentage,
            bestMasteryScore: masteryScore,
            currentMasteryLevel: masteryLevel,
            attemptCount: existingMastery.attemptCount + 1,
            bestAttemptAt: new Date(),
            lastAttemptAt: new Date()
          }
        });
      } else {
        // Just update attempt count and last attempt
        quizMastery = await prisma.quizMastery.update({
          where: {
            userId_quizId: {
              userId: user.id,
              quizId: params.id
            }
          },
          data: {
            attemptCount: existingMastery.attemptCount + 1,
            lastAttemptAt: new Date()
          }
        });
      }
    } else {
      // Create new mastery record
      isNewBestScore = true;
      quizMastery = await prisma.quizMastery.create({
        data: {
          userId: user.id,
          quizId: params.id,
          bestScore: score,
          bestPercentage: percentage,
          bestMasteryScore: masteryScore,
          currentMasteryLevel: masteryLevel,
          attemptCount: 1,
          firstAttemptAt: new Date(),
          bestAttemptAt: new Date(),
          lastAttemptAt: new Date()
        }
      });
    }

    // Award badges if new best score and mastery level achieved
    const earnedBadges = [];
    if (isNewBestScore && masteryLevel) {
      const badgeTriggerTypes: Record<string, string> = {
        'Bronze': 'quiz_mastery_bronze',
        'Silver': 'quiz_mastery_silver', 
        'Gold': 'quiz_mastery_gold',
        'Perfect': 'quiz_perfect'
      };

      const triggerType = badgeTriggerTypes[masteryLevel];
      
      if (triggerType) {
        // Find eligible badges
        const eligibleBadges = await prisma.badge.findMany({
          where: {
            triggerType,
            triggerValue: params.id
          }
        });

        for (const badge of eligibleBadges) {
          // Check if user already has this badge
          const existingUserBadge = await prisma.userBadge.findUnique({
            where: {
              userId_badgeId: {
                userId: user.id,
                badgeId: badge.id
              }
            }
          });

          if (!existingUserBadge) {
            // Award the badge
            await prisma.userBadge.create({
              data: {
                userId: user.id,
                badgeId: badge.id
              }
            });

            earnedBadges.push({
              id: badge.id,
              name: badge.name,
              description: badge.description,
              image: badge.image,
              rarity: badge.rarity
            });
          }
        }
      }
    }

    return NextResponse.json({
      attemptId: quizAttempt.id,
      score,
      totalQuestions,
      percentage,
      timeSpent,
      timeEfficiency: Math.round(timeEfficiency * 100) / 100,
      masteryScore: Math.round(masteryScore * 100) / 100,
      masteryLevel,
      isNewBestScore,
      currentBestMastery: quizMastery.currentMasteryLevel,
      attemptCount: quizMastery.attemptCount,
      earnedBadges,
      message: earnedBadges.length > 0 
        ? `Congratulations! You earned ${earnedBadges.length} new badge${earnedBadges.length > 1 ? 's' : ''}!`
        : masteryLevel 
          ? `You achieved ${masteryLevel} mastery level!`
          : 'Keep practicing to achieve mastery!'
    });

  } catch (error) {
    console.error('Error completing quiz:', error);
    return NextResponse.json(
      { error: 'Failed to complete quiz submission' },
      { status: 500 }
    );
  }
}