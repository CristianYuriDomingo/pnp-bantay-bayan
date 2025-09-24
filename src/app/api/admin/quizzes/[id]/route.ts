// app/api/admin/quizzes/[id]/route.ts - Updated for badge management integration
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch a specific quiz
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

// PUT - Update a quiz with badge management support
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, timer, subjectDomain, skillArea, questions } = body;

    // Validate required fields
    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one question are required' },
        { status: 400 }
      );
    }

    // Validate subjectDomain if provided
    const validSubjectDomains = [
      'cybersecurity',
      'crime_prevention',
      'emergency_preparedness',
      'financial_security',
      'personal_safety',
      'digital_literacy',
      'risk_assessment'
    ];

    if (subjectDomain && !validSubjectDomains.includes(subjectDomain)) {
      return NextResponse.json(
        { error: `Invalid subject domain. Must be one of: ${validSubjectDomains.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: params.id }
    });

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Update quiz and replace all questions
    const quiz = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        timer: timer || 30,
        subjectDomain: subjectDomain || null,
        skillArea: skillArea ? skillArea.trim() : null,
        questions: {
          deleteMany: {}, // Delete all existing questions
          create: questions.map((q: any) => ({
            question: q.question.trim(),
            lesson: q.lesson.trim(),
            image: q.image || null,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation ? q.explanation.trim() : null
          }))
        }
      },
      include: {
        questions: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    console.log('Quiz updated successfully:', quiz.id);
    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a quiz (with badge cleanup consideration)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: params.id }
    });

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Use transaction to handle quiz deletion and related badges
    await prisma.$transaction(async (prisma) => {
      // Delete the quiz (questions will be cascade deleted)
      await prisma.quiz.delete({
        where: { id: params.id }
      });

      // Note: Associated mastery badges will become orphaned and 
      // will be cleaned up by the badge cleanup system
      console.log(`Quiz deleted: ${params.id}. Associated badges may need cleanup.`);
    });

    return NextResponse.json({ 
      message: 'Quiz deleted successfully. Associated mastery badges may need cleanup.' 
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}