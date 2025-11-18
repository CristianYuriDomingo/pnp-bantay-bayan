// app/api/users/quest/thursday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateQuestAccess } from '@/lib/quest-access-validator';

export const dynamic = 'force-dynamic';

// GET - Fetch Quest Thursday data for user
export async function GET(req: NextRequest) {
  console.log('🎯 Quest Thursday API called');
  
  try {
    const session = await getServerSession(authOptions);

    console.log('🔍 Session check:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    });

    if (!session?.user) {
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
    const accessValidation = await validateQuestAccess(session.user.id, 'thursday');
    
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', data: null },
        { status: 404 }
      );
    }

    // Fetch active Quest Thursday
    const questThursday = await prisma.questThursday.findFirst({
      where: { isActive: true },
      include: {
        items: {
          select: {
            id: true,
            itemName: true,
            itemImage: true,
            // Don't send isAllowed and explanation to client yet!
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    console.log('📦 Quest found:', questThursday ? `ID: ${questThursday.id}, Items: ${questThursday.items.length}` : 'No active quest');

    if (!questThursday) {
      return NextResponse.json(
        { success: false, error: 'No active Quest Thursday available', data: null },
        { status: 404 }
      );
    }

    // Fetch user's progress
    const userProgress = await prisma.questThursdayProgress.findUnique({
      where: {
        userId_questThursdayId: {
          userId: user.id,
          questThursdayId: questThursday.id
        }
      }
    });

    console.log('📊 User progress:', userProgress ? `Item ${userProgress.currentItem}, Lives: ${userProgress.livesRemaining}` : 'None');
    console.log('✅ Returning quest data with access validation passed');

    return NextResponse.json({
      success: true,
      data: {
        id: questThursday.id,
        title: questThursday.title,
        lives: questThursday.lives,
        totalItems: questThursday.items.length,
        items: questThursday.items,
        userProgress: userProgress ? {
          currentItem: userProgress.currentItem,
          completedItems: userProgress.completedItems as string[],
          livesRemaining: userProgress.livesRemaining,
          score: userProgress.score,
          isCompleted: userProgress.isCompleted,
          isFailed: userProgress.isFailed
        } : null
      },
      error: null
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('💥 Error fetching Quest Thursday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quest data', data: null },
      { status: 500 }
    );
  }
}