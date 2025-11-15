// app/api/admin/quest/wednesday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch Quest Wednesday data
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
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const questWednesday = await prisma.questWednesday.findFirst({
      where: { isActive: true }
    });

    if (!questWednesday) {
      return NextResponse.json(
        { success: false, error: 'Quest Wednesday not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: questWednesday
    });

  } catch (error) {
    console.error('Error fetching Quest Wednesday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quest data' },
      { status: 500 }
    );
  }
}

// POST - Create new Quest Wednesday
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
      select: { id: true, role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, networkName, correctNumber, shuffledDigits } = body;

    // Validation
    if (!title || !description || !networkName) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and network name are required' },
        { status: 400 }
      );
    }

    if (!correctNumber || correctNumber.length !== 11) {
      return NextResponse.json(
        { success: false, error: 'Correct number must be exactly 11 digits' },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(correctNumber)) {
      return NextResponse.json(
        { success: false, error: 'Correct number must contain only digits' },
        { status: 400 }
      );
    }

    if (!Array.isArray(shuffledDigits) || shuffledDigits.length !== 9) {
      return NextResponse.json(
        { success: false, error: 'Shuffled digits must be an array of 9 digits' },
        { status: 400 }
      );
    }

    // Validate shuffled digits match last 9 digits of correct number
    const lastNine = correctNumber.slice(2).split('');
    const shuffledSorted = [...shuffledDigits].sort();
    const correctSorted = [...lastNine].sort();
    
    if (JSON.stringify(shuffledSorted) !== JSON.stringify(correctSorted)) {
      return NextResponse.json(
        { success: false, error: 'Shuffled digits must match positions 3-11 of correct number' },
        { status: 400 }
      );
    }

    // Deactivate existing Quest Wednesday
    await prisma.questWednesday.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new Quest Wednesday
    const newQuest = await prisma.questWednesday.create({
      data: {
        title,
        description,
        networkName,
        correctNumber,
        shuffledDigits,
        isActive: true,
        createdById: user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: newQuest,
      message: 'Quest Wednesday created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating Quest Wednesday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quest' },
      { status: 500 }
    );
  }
}

// PUT - Update Quest Wednesday
export async function PUT(req: NextRequest) {
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
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { questId, title, description, networkName, correctNumber, shuffledDigits } = body;

    if (!questId) {
      return NextResponse.json(
        { success: false, error: 'Quest ID is required' },
        { status: 400 }
      );
    }

    // Validation
    if (!title || !description || !networkName) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and network name are required' },
        { status: 400 }
      );
    }

    if (!correctNumber || correctNumber.length !== 11) {
      return NextResponse.json(
        { success: false, error: 'Correct number must be exactly 11 digits' },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(correctNumber)) {
      return NextResponse.json(
        { success: false, error: 'Correct number must contain only digits' },
        { status: 400 }
      );
    }

    if (!Array.isArray(shuffledDigits) || shuffledDigits.length !== 9) {
      return NextResponse.json(
        { success: false, error: 'Shuffled digits must be an array of 9 digits' },
        { status: 400 }
      );
    }

    // Validate shuffled digits match last 9 digits of correct number
    const lastNine = correctNumber.slice(2).split('');
    const shuffledSorted = [...shuffledDigits].sort();
    const correctSorted = [...lastNine].sort();
    
    if (JSON.stringify(shuffledSorted) !== JSON.stringify(correctSorted)) {
      return NextResponse.json(
        { success: false, error: 'Shuffled digits must match positions 3-11 of correct number' },
        { status: 400 }
      );
    }

    // Update quest
    const updatedQuest = await prisma.questWednesday.update({
      where: { id: questId },
      data: {
        title,
        description,
        networkName,
        correctNumber,
        shuffledDigits
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedQuest,
      message: 'Quest Wednesday updated successfully'
    });

  } catch (error) {
    console.error('Error updating Quest Wednesday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quest' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Quest Wednesday
export async function DELETE(req: NextRequest) {
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

    await prisma.questWednesday.delete({
      where: { id: questId }
    });

    return NextResponse.json({
      success: true,
      message: 'Quest Wednesday deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Quest Wednesday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quest' },
      { status: 500 }
    );
  }
}