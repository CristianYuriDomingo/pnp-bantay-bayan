// app/api/admin/quest/friday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch Quest Friday data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch Quest Friday with all rank options
    const questFriday = await prisma.questFriday.findFirst({
      where: { isActive: true },
      include: {
        rankOptions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!questFriday) {
      return NextResponse.json(
        { success: false, error: 'Quest Friday not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: questFriday
    });

  } catch (error) {
    console.error('Error fetching Quest Friday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quest data' },
      { status: 500 }
    );
  }
}

// POST - Create new Quest Friday
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, instruction, rankOptions } = body;

    // Validation
    if (!title || !instruction) {
      return NextResponse.json(
        { success: false, error: 'Title and instruction are required' },
        { status: 400 }
      );
    }

    if (!rankOptions || !Array.isArray(rankOptions) || rankOptions.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Exactly 3 rank options are required' },
        { status: 400 }
      );
    }

    // Validate rank options
    let correctCount = 0;
    for (const option of rankOptions) {
      if (!option.rankImage) {
        return NextResponse.json(
          { success: false, error: 'Each rank option must have rankImage' },
          { status: 400 }
        );
      }
      if (typeof option.isCorrect !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Each rank option must have a boolean isCorrect value' },
          { status: 400 }
        );
      }
      if (option.isCorrect) correctCount++;
    }

    if (correctCount !== 1) {
      return NextResponse.json(
        { success: false, error: 'Exactly one rank option must be marked as correct' },
        { status: 400 }
      );
    }

    // Deactivate existing Quest Friday
    await prisma.questFriday.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new Quest Friday with rank options
    const newQuest = await prisma.questFriday.create({
      data: {
        title,
        instruction,
        isActive: true,
        createdById: user.id,
        rankOptions: {
          create: rankOptions.map((option: any, index: number) => ({
            rankName: option.rankName,
            rankImage: option.rankImage,
            isCorrect: option.isCorrect,
            orderIndex: index
          }))
        }
      },
      include: {
        rankOptions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: newQuest,
      message: 'Quest Friday created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating Quest Friday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quest' },
      { status: 500 }
    );
  }
}

// PUT - Update Quest Friday
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { questId, title, instruction, rankOptions } = body;

    if (!questId) {
      return NextResponse.json(
        { success: false, error: 'Quest ID is required' },
        { status: 400 }
      );
    }

    // Validation
    if (!title || !instruction) {
      return NextResponse.json(
        { success: false, error: 'Title and instruction are required' },
        { status: 400 }
      );
    }

    if (!rankOptions || !Array.isArray(rankOptions) || rankOptions.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Exactly 3 rank options are required' },
        { status: 400 }
      );
    }

    // Validate rank options
    let correctCount = 0;
    for (const option of rankOptions) {
      if (!option.rankName || !option.rankImage) {
        return NextResponse.json(
          { success: false, error: 'Each rank option must have rankName and rankImage' },
          { status: 400 }
        );
      }
      if (typeof option.isCorrect !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Each rank option must have a boolean isCorrect value' },
          { status: 400 }
        );
      }
      if (option.isCorrect) correctCount++;
    }

    if (correctCount !== 1) {
      return NextResponse.json(
        { success: false, error: 'Exactly one rank option must be marked as correct' },
        { status: 400 }
      );
    }

    // Update quest in a transaction
    const updatedQuest = await prisma.$transaction(async (tx) => {
      // Delete existing rank options
      await tx.questFridayRankOption.deleteMany({
        where: { questFridayId: questId }
      });

      // Update quest and create new rank options
      return await tx.questFriday.update({
        where: { id: questId },
        data: {
          title,
          instruction,
          rankOptions: {
            create: rankOptions.map((option: any, index: number) => ({
              rankName: option.rankName,
              rankImage: option.rankImage,
              isCorrect: option.isCorrect,
              orderIndex: index
            }))
          }
        },
        include: {
          rankOptions: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedQuest,
      message: 'Quest Friday updated successfully'
    });

  } catch (error) {
    console.error('Error updating Quest Friday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quest' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Quest Friday
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const questId = searchParams.get('questId');

    if (!questId) {
      return NextResponse.json(
        { success: false, error: 'Quest ID is required' },
        { status: 400 }
      );
    }

    // Delete quest (cascade will delete rank options and progress)
    await prisma.questFriday.delete({
      where: { id: questId }
    });

    return NextResponse.json({
      success: true,
      message: 'Quest Friday deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Quest Friday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quest' },
      { status: 500 }
    );
  }
}