// app/api/admin/quizzes/route.ts - Updated for badge management integration
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all quizzes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

// POST - Create a new quiz with badge management support
export async function POST(request: NextRequest) {
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

    // Create quiz with questions and new badge management fields
    const quiz = await prisma.quiz.create({
      data: {
        title: title.trim(),
        timer: timer || 30,
        subjectDomain: subjectDomain || null,
        skillArea: skillArea ? skillArea.trim() : null,
        questions: {
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

    console.log('Quiz created successfully:', quiz.id);
    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
