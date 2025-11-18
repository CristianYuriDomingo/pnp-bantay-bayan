// app/api/users/quest/monday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateQuestAccess } from '@/lib/quest-access-validator';

export const dynamic = 'force-dynamic';

// GET - Fetch active quest for user to play
export async function GET(request: NextRequest) {
  console.log('🎯 Quest Monday API called');
  
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🔍 Session check:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    });

    if (!session || !session.user) {
      console.log('❌ No session found');
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please sign in.',
          data: null
        },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    console.log('✅ User authenticated:', session.user.email);

    // ========================================
    // QUEST ACCESS VALIDATION
    // ========================================
    const accessValidation = await validateQuestAccess(session.user.id, 'monday');
    
    if (!accessValidation.canAccess) {
      console.log('🚫 Access denied:', accessValidation.reason);
      return NextResponse.json(
        {
          success: false,
          error: accessValidation.reason,
          data: null,
          shouldRedirect: accessValidation.shouldRedirect,
          redirectTo: accessValidation.redirectTo,
        },
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    console.log('✅ Access granted:', accessValidation.reason);

    // Fetch the active quest with all levels and suspects
    const quest = await prisma.questMonday.findFirst({
      where: { isActive: true },
      include: {
        levels: {
          include: {
            suspects: {
              orderBy: { suspectNumber: 'asc' }
            }
          },
          orderBy: { levelNumber: 'asc' }
        }
      }
    });

    console.log('📦 Quest found:', quest ? `ID: ${quest.id}, Levels: ${quest.levels.length}` : 'No active quest');

    if (!quest) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active quest available',
          data: null
        },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Get user's progress for this quest
    const progress = await prisma.questMondayProgress.findUnique({
      where: {
        userId_questMondayId: {
          userId: session.user.id,
          questMondayId: quest.id
        }
      }
    });

    console.log('📊 User progress:', progress ? `Level ${progress.currentLevel}` : 'None');

    // Transform data for frontend (hide correct answers)
    const transformedQuest = {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      levels: quest.levels.map(level => ({
        id: level.id,
        levelNumber: level.levelNumber,
        description: level.description,
        suspects: level.suspects.map(suspect => ({
          id: suspect.id,
          imageUrl: suspect.imageUrl,
          suspectNumber: suspect.suspectNumber
          // Note: isCorrect is NOT sent to frontend for security
        }))
      })),
      userProgress: progress ? {
        currentLevel: progress.currentLevel,
        completedLevels: progress.completedLevels,
        isCompleted: progress.isCompleted,
        attempts: progress.attempts
      } : null
    };

    console.log('✅ Returning quest data with access validation passed');

    return NextResponse.json(
      {
        success: true,
        data: transformedQuest,
        error: null
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('💥 Error in quest API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch quest',
        data: null
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}