// app/api/users/quest/tuesday/reset/route.ts
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
    const { questTuesdayId } = body;

    if (!questTuesdayId) {
      return NextResponse.json(
        { success: false, error: 'Quest ID is required' },
        { status: 400 }
      );
    }

    // Get quest to get default lives
    const quest = await prisma.questTuesday.findUnique({
      where: { id: questTuesdayId },
      select: { lives: true }
    });

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    // Delete existing progress (or reset it)
    await prisma.questTuesdayProgress.deleteMany({
      where: {
        userId: user.id,
        questTuesdayId: questTuesdayId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Progress reset successfully'
    });

  } catch (error) {
    console.error('Error resetting progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset progress' },
      { status: 500 }
    );
  }
}