// app/api/admin/lessons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET - Fetch lessons (for specific module OR all lessons)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    let lessons;

    if (moduleId) {
      // Fetch lessons for a specific module (existing functionality)
      lessons = await prisma.lesson.findMany({
        where: { moduleId },
        include: {
          tips: true,
          module: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
    } else {
      // Fetch ALL lessons across all modules (new functionality for badge management)
      lessons = await prisma.lesson.findMany({
        include: {
          tips: true,
          module: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: [
          { module: { title: 'asc' } },
          { createdAt: 'asc' }
        ]
      });
    }

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new lesson
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, bubbleSpeech, timer, moduleId, tips } = body;

    if (!title || !description || !moduleId) {
      return NextResponse.json({ error: 'Title, description, and module ID are required' }, { status: 400 });
    }

    // Create lesson with tips in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      const lesson = await prisma.lesson.create({
        data: {
          title,
          description,
          bubbleSpeech: bubbleSpeech || '',
          timer: timer || 300,
          moduleId
        }
      });

      // Create tips if provided
      if (tips && tips.length > 0) {
        await prisma.tip.createMany({
          data: tips.map((tip: any) => ({
            title: tip.title,
            description: tip.description,
            image: tip.image || null,
            lessonId: lesson.id
          }))
        });
      }

      // Return lesson with tips and module info
      return await prisma.lesson.findUnique({
        where: { id: lesson.id },
        include: { 
          tips: true,
          module: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update an existing lesson
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('id');

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, bubbleSpeech, timer, tips } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Update lesson with tips in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update the lesson
      const lesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          title,
          description,
          bubbleSpeech: bubbleSpeech || '',
          timer: timer || 300
        }
      });

      // Delete existing tips
      await prisma.tip.deleteMany({
        where: { lessonId }
      });

      // Create new tips if provided
      if (tips && tips.length > 0) {
        await prisma.tip.createMany({
          data: tips.map((tip: any) => ({
            title: tip.title,
            description: tip.description,
            image: tip.image || null,
            lessonId: lesson.id
          }))
        });
      }

      // Return updated lesson with tips and module info
      return await prisma.lesson.findUnique({
        where: { id: lesson.id },
        include: { 
          tips: true,
          module: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a lesson and clean up associated badges
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('id');

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, title: true }
    });

    if (!existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Perform cleanup in a transaction
    await prisma.$transaction(async (prisma) => {
      // 1. Delete badges associated with this lesson (lesson completion badges)
      await prisma.badge.deleteMany({
        where: {
          triggerType: 'lesson_complete',
          triggerValue: lessonId
        }
      });

      // 2. Delete the lesson (tips will be deleted automatically due to cascade)
      await prisma.lesson.delete({
        where: { id: lessonId }
      });
    });

    return NextResponse.json({ 
      message: 'Lesson and associated badges deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}