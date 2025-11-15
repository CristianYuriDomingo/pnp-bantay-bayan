// app/api/admin/quest/tuesday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch Quest Tuesday data
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

    // Fetch Quest Tuesday with all questions
    const questTuesday = await prisma.questTuesday.findFirst({
      where: { isActive: true },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!questTuesday) {
      return NextResponse.json(
        { success: false, error: 'Quest Tuesday not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: questTuesday
    });

  } catch (error) {
    console.error('Error fetching Quest Tuesday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quest data' },
      { status: 500 }
    );
  }
}

// POST - Create new Quest Tuesday
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
    const { title, lives, questions } = body;

    // Validation
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title and at least one question are required' },
        { status: 400 }
      );
    }

    // Validate questions
    for (const question of questions) {
      if (!question.question || !question.explanation) {
        return NextResponse.json(
          { success: false, error: 'Each question must have text and explanation' },
          { status: 400 }
        );
      }
      if (typeof question.correctAnswer !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Each question must have a boolean correctAnswer' },
          { status: 400 }
        );
      }
    }

    // Deactivate existing Quest Tuesday
    await prisma.questTuesday.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new Quest Tuesday with questions
    const newQuest = await prisma.questTuesday.create({
      data: {
        title,
        lives: lives || 3,
        isActive: true,
        createdById: user.id,
        questions: {
          create: questions.map((q: any, index: number) => ({
            questionNumber: index + 1,
            question: q.question,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            orderIndex: index
          }))
        }
      },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: newQuest,
      message: 'Quest Tuesday created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating Quest Tuesday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quest' },
      { status: 500 }
    );
  }
}

// PUT - Update Quest Tuesday
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
    const { questId, title, lives, questions } = body;

    if (!questId) {
      return NextResponse.json(
        { success: false, error: 'Quest ID is required' },
        { status: 400 }
      );
    }

    // Validation
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title and at least one question are required' },
        { status: 400 }
      );
    }

    // Validate questions
    for (const question of questions) {
      if (!question.question || !question.explanation) {
        return NextResponse.json(
          { success: false, error: 'Each question must have text and explanation' },
          { status: 400 }
        );
      }
      if (typeof question.correctAnswer !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Each question must have a boolean correctAnswer' },
          { status: 400 }
        );
      }
    }

    // Update quest in a transaction
    const updatedQuest = await prisma.$transaction(async (tx) => {
      // Delete existing questions
      await tx.questTuesdayQuestion.deleteMany({
        where: { questTuesdayId: questId }
      });

      // Update quest and create new questions
      return await tx.questTuesday.update({
        where: { id: questId },
        data: {
          title,
          lives: lives || 3,
          questions: {
            create: questions.map((q: any, index: number) => ({
              questionNumber: index + 1,
              question: q.question,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              orderIndex: index
            }))
          }
        },
        include: {
          questions: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedQuest,
      message: 'Quest Tuesday updated successfully'
    });

  } catch (error) {
    console.error('Error updating Quest Tuesday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quest' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Quest Tuesday
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

    // Delete quest (cascade will delete questions and progress)
    await prisma.questTuesday.delete({
      where: { id: questId }
    });

    return NextResponse.json({
      success: true,
      message: 'Quest Tuesday deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Quest Tuesday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quest' },
      { status: 500 }
    );
  }
}