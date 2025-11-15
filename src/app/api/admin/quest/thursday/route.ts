// app/api/admin/quest/thursday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch Quest Thursday data
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

    // Fetch Quest Thursday with all items
    const questThursday = await prisma.questThursday.findFirst({
      where: { isActive: true },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!questThursday) {
      return NextResponse.json(
        { success: false, error: 'Quest Thursday not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: questThursday
    });

  } catch (error) {
    console.error('Error fetching Quest Thursday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quest data' },
      { status: 500 }
    );
  }
}

// POST - Create new Quest Thursday
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
    const { title, lives, items } = body;

    // Validation
    if (!title || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title and at least one item are required' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of items) {
      if (!item.name || !item.explanation) {
        return NextResponse.json(
          { success: false, error: 'Each item must have name and explanation' },
          { status: 400 }
        );
      }
      if (!item.image) {
        return NextResponse.json(
          { success: false, error: 'Each item must have an image' },
          { status: 400 }
        );
      }
      if (typeof item.isAllowed !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Each item must have a boolean isAllowed value' },
          { status: 400 }
        );
      }
    }

    // Deactivate existing Quest Thursday
    await prisma.questThursday.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new Quest Thursday with items
    const newQuest = await prisma.questThursday.create({
      data: {
        title,
        lives: lives || 3,
        isActive: true,
        createdById: user.id,
        items: {
          create: items.map((item: any, index: number) => ({
            itemName: item.name,
            itemImage: item.image,
            isAllowed: item.isAllowed,
            explanation: item.explanation,
            orderIndex: index
          }))
        }
      },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: newQuest,
      message: 'Quest Thursday created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating Quest Thursday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quest' },
      { status: 500 }
    );
  }
}

// PUT - Update Quest Thursday
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
    const { questId, title, lives, items } = body;

    if (!questId) {
      return NextResponse.json(
        { success: false, error: 'Quest ID is required' },
        { status: 400 }
      );
    }

    // Validation
    if (!title || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title and at least one item are required' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of items) {
      if (!item.name || !item.explanation) {
        return NextResponse.json(
          { success: false, error: 'Each item must have name and explanation' },
          { status: 400 }
        );
      }
      if (!item.image) {
        return NextResponse.json(
          { success: false, error: 'Each item must have an image' },
          { status: 400 }
        );
      }
      if (typeof item.isAllowed !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Each item must have a boolean isAllowed value' },
          { status: 400 }
        );
      }
    }

    // Update quest in a transaction
    const updatedQuest = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.questThursdayItem.deleteMany({
        where: { questThursdayId: questId }
      });

      // Update quest and create new items
      return await tx.questThursday.update({
        where: { id: questId },
        data: {
          title,
          lives: lives || 3,
          items: {
            create: items.map((item: any, index: number) => ({
              itemName: item.name,
              itemImage: item.image,
              isAllowed: item.isAllowed,
              explanation: item.explanation,
              orderIndex: index
            }))
          }
        },
        include: {
          items: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedQuest,
      message: 'Quest Thursday updated successfully'
    });

  } catch (error) {
    console.error('Error updating Quest Thursday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quest' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Quest Thursday
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

    // Delete quest (cascade will delete items and progress)
    await prisma.questThursday.delete({
      where: { id: questId }
    });

    return NextResponse.json({
      success: true,
      message: 'Quest Thursday deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Quest Thursday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quest' },
      { status: 500 }
    );
  }
}