//app/api/users/quest/wednesday/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { onQuestComplete } from '@/lib/services/streakService';
import { getCurrentWeekProgress } from '@/lib/services/weeklyResetService';

export const dynamic = 'force-dynamic';

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

    const body = await request.json();
    const { questWednesdayId, userAnswer } = body;

    if (!questWednesdayId || !userAnswer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', data: null },
        { status: 400 }
      );
    }

    if (!Array.isArray(userAnswer) || userAnswer.length !== 9) {
      return NextResponse.json(
        { success: false, error: 'Invalid answer format. Must be 9 digits.', data: null },
        { status: 400 }
      );
    }

    const quest = await prisma.questWednesday.findUnique({
      where: { id: questWednesdayId }
    });

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found', data: null },
        { status: 404 }
      );
    }

    const userFullAnswer = '09' + userAnswer.join('');
    const isCorrect = userFullAnswer === quest.correctNumber;

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
      progress = await prisma.questWednesdayProgress.update({
        where: { id: progress.id },
        data: {
          isCompleted: true,
          isCorrect: true,
          userAnswer: userFullAnswer,
          completedAt: new Date(),
          lastPlayedAt: new Date()
        }
      });

      // 🆕 WEEKLY QUEST INTEGRATION
      try {
        console.log('🎯 Quest completed! Updating weekly progress and streak...');
        
        // 1. Update weekly progress FIRST
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { weeklyQuestStartDate: true },
        });

        if (user?.weeklyQuestStartDate) {
          const currentProgress = await getCurrentWeekProgress(session.user.id);
          
          if (currentProgress) {
            const completedDays = Array.isArray(currentProgress.completedDays) 
              ? currentProgress.completedDays as string[]
              : [];
            
            if (!completedDays.includes('wednesday')) {
              await prisma.weeklyQuestProgress.update({
                where: {
                  userId_weekStartDate: {
                    userId: session.user.id,
                    weekStartDate: user.weeklyQuestStartDate,
                  },
                },
                data: {
                  completedDays: [...completedDays, 'wednesday'],
                  totalQuestsCompleted: { increment: 1 },
                },
              });
              console.log('✅ Weekly progress updated: Wednesday added');
            }
          }
        }

        // 2. Update streak AFTER weekly progress
        const streakResult = await onQuestComplete(session.user.id, 'wednesday');
        console.log('🔥 Streak updated:', {
          currentStreak: streakResult.currentStreak,
          longestStreak: streakResult.longestStreak,
          message: streakResult.message
        });

        // 3. Fetch fresh user data to return updated values
        const updatedUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            currentStreak: true,
            longestStreak: true,
          },
        });

        console.log('✅ Fresh user data fetched:', updatedUser);

        return NextResponse.json({
          success: true,
          data: {
            correct: true,
            isCompleted: true,
            progress: {
              isCompleted: progress.isCompleted,
              attempts: progress.attempts,
              completedAt: progress.completedAt
            },
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
          message: '🎉 Quest completed!'
        });
      }

    } else {
      progress = await prisma.questWednesdayProgress.update({
        where: { id: progress.id },
        data: {
          attempts: progress.attempts + 1,
          lastPlayedAt: new Date()
        }
      });

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