// app/api/users/quest/friday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Fetch active quest for user to play
export async function GET(request: NextRequest) {
  console.log('🎯 Quest Friday API called');
  
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

    // Fetch the active quest with all rank options
    const quest = await prisma.questFriday.findFirst({
      where: { isActive: true },
      include: {
        rankOptions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    console.log('📦 Quest found:', quest ? `ID: ${quest.id}, Options: ${quest.rankOptions.length}` : 'No active quest');

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
    const progress = await prisma.questFridayProgress.findUnique({
      where: {
        userId_questFridayId: {
          userId: session.user.id,
          questFridayId: quest.id
        }
      }
    });

    console.log('📊 User progress:', progress ? `Attempts: ${progress.attempts}, Completed: ${progress.isCompleted}` : 'None');

    // Transform data for frontend (hide correct answers)
    const transformedQuest = {
      id: quest.id,
      title: quest.title,
      instruction: quest.instruction,
      rankOptions: quest.rankOptions.map(option => ({
        id: option.id,
        rankImage: option.rankImage,
        orderIndex: option.orderIndex
        // Note: isCorrect is NOT sent to frontend for security
      })),
      userProgress: progress ? {
        isCompleted: progress.isCompleted,
        isCorrect: progress.isCorrect,
        attempts: progress.attempts,
        selectedRank: progress.selectedRank
      } : null
    };

    console.log('✅ Returning quest data');

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