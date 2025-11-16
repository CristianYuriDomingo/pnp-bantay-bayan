// app/api/users/quest/friday/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { onQuestComplete } from '@/lib/services/streakService';
import { getCurrentWeekProgress } from '@/lib/services/weeklyResetService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🎯 Submit answer API called');
  
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
    const { questFridayId, selectedRankId } = body;

    if (!questFridayId || !selectedRankId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', data: null },
        { status: 400 }
      );
    }

    const quest = await prisma.questFriday.findUnique({
      where: { id: questFridayId },
      include: {
        rankOptions: true
      }
    });

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found', data: null },
        { status: 404 }
      );
    }

    const selectedRank = quest.rankOptions.find(r => r.id === selectedRankId);
    
    if (!selectedRank) {
      return NextResponse.json(
        { success: false, error: 'Invalid rank selection', data: null },
        { status: 400 }
      );
    }

    const isCorrect = selectedRank.isCorrect;

    let progress = await prisma.questFridayProgress.findUnique({
      where: {
        userId_questFridayId: {
          userId: session.user.id,
          questFridayId: questFridayId
        }
      }
    });

    if (!progress) {
      progress = await prisma.questFridayProgress.create({
        data: {
          userId: session.user.id,
          questFridayId: questFridayId,
          selectedRank: selectedRankId,
          isCorrect: isCorrect,
          isCompleted: isCorrect,
          attempts: 1,
          completedAt: isCorrect ? new Date() : undefined
        }
      });
    } else {
      progress = await prisma.questFridayProgress.update({
        where: { id: progress.id },
        data: {
          selectedRank: selectedRankId,
          isCorrect: isCorrect,
          isCompleted: isCorrect,
          attempts: progress.attempts + 1,
          completedAt: isCorrect ? new Date() : undefined,
          lastPlayedAt: new Date()
        }
      });
    }

    // 🆕 WEEKLY QUEST INTEGRATION
    if (isCorrect) {
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
            
            if (!completedDays.includes('friday')) {
              await prisma.weeklyQuestProgress.update({
                where: {
                  userId_weekStartDate: {
                    userId: session.user.id,
                    weekStartDate: user.weeklyQuestStartDate,
                  },
                },
                data: {
                  completedDays: [...completedDays, 'friday'],
                  totalQuestsCompleted: { increment: 1 },
                },
              });
              console.log('✅ Weekly progress updated: Friday added');
            }
          }
        }

        // 2. Update streak AFTER weekly progress
        const streakResult = await onQuestComplete(session.user.id, 'friday');
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
            correct: isCorrect,
            isCompleted: isCorrect,
            attempts: progress.attempts,
            progress: {
              isCorrect: progress.isCorrect,
              isCompleted: progress.isCompleted,
              attempts: progress.attempts
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
            correct: isCorrect,
            isCompleted: isCorrect,
            attempts: progress.attempts,
            progress: {
              isCorrect: progress.isCorrect,
              isCompleted: progress.isCompleted,
              attempts: progress.attempts
            }
          },
          message: '🎉 Quest completed!'
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        correct: isCorrect,
        isCompleted: isCorrect,
        attempts: progress.attempts,
        progress: {
          isCorrect: progress.isCorrect,
          isCompleted: progress.isCompleted,
          attempts: progress.attempts
        }
      },
      message: isCorrect ? '🎉 Quest completed! Streak updated!' : 'Wrong answer!'
    });

  } catch (error) {
    console.error('💥 Error submitting answer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit answer', data: null },
      { status: 500 }
    );
  }
}