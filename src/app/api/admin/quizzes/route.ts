// FILE: app/api/admin/quizzes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all quizzes with hierarchical structure
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
        },
        children: {
          include: {
            questions: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        parent: {
          select: {
            id: true,
            title: true,
            isParent: true
          }
        }
      },
      orderBy: [
        { isParent: 'desc' },
        { createdAt: 'desc' }
      ]
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

// POST - Create a new quiz (both parent and sub-quiz support)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, timer, parentId, isParent, questions } = body;
    // REMOVED: subjectDomain, skillArea from destructuring

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create parent quiz
    if (isParent) {
      const parentQuiz = await prisma.quiz.create({
        data: {
          title: title.trim(),
          timer: timer || 30,
          isParent: true,
          parentId: null,
          // REMOVED: subjectDomain, skillArea
        },
        include: {
          children: {
            include: {
              questions: {
                orderBy: {
                  createdAt: 'asc'
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      console.log('Parent quiz created successfully:', parentQuiz.id);
      return NextResponse.json(parentQuiz, { status: 201 });
    }

    // Validate sub-quiz has questions
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Regular quizzes must have at least one question' },
        { status: 400 }
      );
    }

    // Validate parent exists if parentId provided
    if (parentId) {
      const parentQuiz = await prisma.quiz.findUnique({
        where: { id: parentId }
      });

      if (!parentQuiz) {
        return NextResponse.json(
          { error: 'Parent quiz not found' },
          { status: 404 }
        );
      }

      if (!parentQuiz.isParent) {
        return NextResponse.json(
          { error: 'Referenced parent is not a parent quiz' },
          { status: 400 }
        );
      }
    }

    // Create regular quiz with questions
    const quiz = await prisma.quiz.create({
      data: {
        title: title.trim(),
        timer: timer || 30,
        parentId: parentId || null,
        isParent: false,
        // REMOVED: subjectDomain, skillArea
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
        },
        parent: {
          select: {
            id: true,
            title: true,
            isParent: true
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