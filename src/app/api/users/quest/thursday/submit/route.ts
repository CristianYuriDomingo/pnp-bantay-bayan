// app/api/users/quest/thursday/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { questThursdayId, itemId, selectedDecision } = body;

    // Validation
    if (!questThursdayId || !itemId || typeof selectedDecision !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch the item to check the answer
    const item = await prisma.questThursdayItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        itemName: true,
        isAllowed: true,
        explanation: true,
        questThursdayId: true
      }
    });

    if (!item || item.questThursdayId !== questThursdayId) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if answer is correct
    const isCorrect = selectedDecision === item.isAllowed;

    // Get or create user progress
    let progress = await prisma.questThursdayProgress.findUnique({
      where: {
        userId_questThursdayId: {
          userId: user.id,
          questThursdayId: questThursdayId
        }
      }
    });

    // Get quest data for lives
    const quest = await prisma.questThursday.findUnique({
      where: { id: questThursdayId },
      select: { 
        lives: true,
        items: {
          select: { id: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    if (!progress) {
      // Create new progress
      progress = await prisma.questThursdayProgress.create({
        data: {
          userId: user.id,
          questThursdayId: questThursdayId,
          currentItem: 1,
          livesRemaining: quest.lives,
          completedItems: [],
          answeredItems: []
        }
      });
    }

    // Check if already answered or game is over
    const answeredItems = progress.answeredItems as any[];
    const alreadyAnswered = answeredItems.some(
      (a: any) => a.itemId === itemId
    );

    if (alreadyAnswered) {
      return NextResponse.json(
        { success: false, error: 'Item already answered' },
        { status: 400 }
      );
    }

    if (progress.isCompleted) {
      return NextResponse.json(
        { success: false, error: 'Quest already completed' },
        { status: 400 }
      );
    }

    if (progress.isFailed) {
      return NextResponse.json(
        { success: false, error: 'Quest already failed' },
        { status: 400 }
      );
    }

    // Update progress
    const completedItems = progress.completedItems as string[];
    const newCompletedItems = [...completedItems, itemId];
    
    const newAnsweredItems = [
      ...answeredItems,
      {
        itemId,
        itemName: item.itemName,
        selectedDecision,
        isCorrect,
        answeredAt: new Date()
      }
    ];

    let newLivesRemaining = progress.livesRemaining;
    let newScore = progress.score;
    let isFailed = false;
    let isCompleted = false;

    if (isCorrect) {
      newScore += 1;
    } else {
      newLivesRemaining -= 1;
      if (newLivesRemaining <= 0) {
        isFailed = true;
      }
    }

    // Check if all items answered
    if (newCompletedItems.length >= quest.items.length && !isFailed) {
      isCompleted = true;
    }

    // Update progress in database
    const updatedProgress = await prisma.questThursdayProgress.update({
      where: {
        userId_questThursdayId: {
          userId: user.id,
          questThursdayId: questThursdayId
        }
      },
      data: {
        currentItem: progress.currentItem + 1,
        completedItems: newCompletedItems,
        answeredItems: newAnsweredItems,
        livesRemaining: newLivesRemaining,
        score: newScore,
        isCompleted,
        isFailed,
        completedAt: (isCompleted || isFailed) ? new Date() : null,
        lastPlayedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        correct: isCorrect,
        explanation: item.explanation,
        correctAnswer: item.isAllowed,
        livesRemaining: newLivesRemaining,
        score: newScore,
        isCompleted,
        isFailed,
        currentItem: progress.currentItem + 1,
        totalItems: quest.items.length
      }
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}