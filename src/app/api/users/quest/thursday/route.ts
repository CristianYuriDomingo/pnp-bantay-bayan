// app/api/users/quest/thursday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch Quest Thursday data for user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
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

    if (!questThursday) {
      return NextResponse.json(
        { success: false, error: 'No active Quest Thursday available' },
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
      }
    });

  } catch (error) {
    console.error('Error fetching Quest Thursday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quest data' },
      { status: 500 }
    );
  }
}
