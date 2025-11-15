//app/api/users/quest/wednesday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Fetch active Wednesday quest for user to play
export async function GET(request: NextRequest) {
  console.log('🎯 Quest Wednesday API called');
  
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

    // Fetch the active Wednesday quest
    const quest = await prisma.questWednesday.findFirst({
      where: { isActive: true }
    });

    console.log('📦 Quest found:', quest ? `ID: ${quest.id}` : 'No active quest');

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
    const progress = await prisma.questWednesdayProgress.findUnique({
      where: {
        userId_questWednesdayId: {
          userId: session.user.id,
          questWednesdayId: quest.id
        }
      }
    });

    console.log('📊 User progress:', progress ? `Completed: ${progress.isCompleted}` : 'None');

    // Transform data for frontend (hide correct answer)
    const transformedQuest = {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      networkName: quest.networkName,
      // Only send shuffled digits, NOT the correct number
      shuffledDigits: Array.isArray(quest.shuffledDigits) 
        ? quest.shuffledDigits 
        : JSON.parse(quest.shuffledDigits as string),
      userProgress: progress ? {
        isCompleted: progress.isCompleted,
        attempts: progress.attempts,
        completedAt: progress.completedAt
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