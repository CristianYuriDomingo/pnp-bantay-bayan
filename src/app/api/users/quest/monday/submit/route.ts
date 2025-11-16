//app/api/users/quest/monday/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { onQuestComplete } from '@/lib/services/streakService';
import { getCurrentWeekProgress } from '@/lib/services/weeklyResetService';

export const dynamic = 'force-dynamic';

// POST - Submit answer for current level
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

    console.log('✅ User authenticated:', session.user.email);

    const body = await request.json();
    const { questMondayId, levelId, suspectId } = body;

    console.log('📝 Submit data:', { questMondayId, levelId, suspectId });

    if (!questMondayId || !levelId || !suspectId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', data: null },
        { status: 400 }
      );
    }

    // Fetch the level with suspects
    const level = await prisma.questMondayLevel.findUnique({
      where: { id: levelId },
      include: {
        suspects: true,
        questMonday: true
      }
    });

    if (!level) {
      return NextResponse.json(
        { success: false, error: 'Level not found', data: null },
        { status: 404 }
      );
    }

    const selectedSuspect = level.suspects.find(s => s.id === suspectId);
    
    if (!selectedSuspect) {
      return NextResponse.json(
        { success: false, error: 'Invalid suspect selection', data: null },
        { status: 400 }
      );
    }

    const isCorrect = selectedSuspect.isCorrect;
    console.log('🎲 Answer is:', isCorrect ? 'CORRECT' : 'WRONG');

    // Get or create user progress
    let progress = await prisma.questMondayProgress.findUnique({
      where: {
        userId_questMondayId: {
          userId: session.user.id,
          questMondayId: questMondayId
        }
      }
    });

    if (!progress) {
      progress = await prisma.questMondayProgress.create({
        data: {
          userId: session.user.id,
          questMondayId: questMondayId,
          currentLevel: level.levelNumber,
          completedLevels: [],
          isCompleted: false,
          attempts: 0
        }
      });
    }

    const totalLevels = await prisma.questMondayLevel.count({
      where: { questMondayId: questMondayId }
    });

    if (isCorrect) {
      const completedLevels = progress.completedLevels as number[];
      const newCompletedLevels = [...completedLevels, level.levelNumber];
      const isQuestCompleted = newCompletedLevels.length >= totalLevels;

      progress = await prisma.questMondayProgress.update({
        where: { id: progress.id },
        data: {
          completedLevels: newCompletedLevels,
          currentLevel: isQuestCompleted ? level.levelNumber : level.levelNumber + 1,
          isCompleted: isQuestCompleted,
          completedAt: isQuestCompleted ? new Date() : undefined,
          lastPlayedAt: new Date()
        }
      });

      console.log('✅ Progress updated:', { 
        completedLevels: newCompletedLevels.length, 
        isQuestCompleted 
      });

      // 🆕 WEEKLY QUEST INTEGRATION - Only if quest is completed
      if (isQuestCompleted) {
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
              
              // Add 'monday' if not already added
              if (!completedDays.includes('monday')) {
                await prisma.weeklyQuestProgress.update({
                  where: {
                    userId_weekStartDate: {
                      userId: session.user.id,
                      weekStartDate: user.weeklyQuestStartDate,
                    },
                  },
                  data: {
                    completedDays: [...completedDays, 'monday'],
                    totalQuestsCompleted: { increment: 1 },
                  },
                });
                console.log('✅ Weekly progress updated: Monday added to completed days');
              } else {
                console.log('ℹ️ Monday already marked as completed this week');
              }
            }
          }

          // 2. Update streak AFTER weekly progress
          const streakResult = await onQuestComplete(session.user.id, 'monday');
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
              isQuestCompleted,
              nextLevel: null,
              progress: {
                currentLevel: progress.currentLevel,
                completedLevels: progress.completedLevels,
                isCompleted: progress.isCompleted
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
          // Still return success but log the error
          return NextResponse.json({
            success: true,
            data: {
              correct: true,
              isQuestCompleted,
              nextLevel: null,
              progress: {
                currentLevel: progress.currentLevel,
                completedLevels: progress.completedLevels,
                isCompleted: progress.isCompleted
              }
            },
            message: '🎉 Quest completed!'
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          correct: true,
          isQuestCompleted,
          nextLevel: isQuestCompleted ? null : level.levelNumber + 1,
          progress: {
            currentLevel: progress.currentLevel,
            completedLevels: progress.completedLevels,
            isCompleted: progress.isCompleted
          }
        },
        message: isQuestCompleted 
          ? '🎉 Quest completed! Streak updated!' 
          : 'Correct answer!'
      });

    } else {
      progress = await prisma.questMondayProgress.update({
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
        message: 'Wrong answer!'
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