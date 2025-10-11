// app/api/admin/quizzes/[id]/route.ts - Updated for parent-child quiz support with badge cleanup
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

// PUT - Update a quiz with parent-child support
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
    const { title, timer, parentId, isParent, questions } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
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

      // Prevent circular references
      if (parentId === params.id) {
        return NextResponse.json(
          { error: 'Quiz cannot be its own parent' },
          { status: 400 }
        );
      }
    }

    // Handle parent quiz updates
    if (isParent || existingQuiz.isParent) {
      // Parent quizzes don't have questions - they're organizational containers
      const updatedQuiz = await prisma.quiz.update({
        where: { id: params.id },
        data: {
          title: title.trim(),
          timer: timer || 30,
          isParent: true,
          parentId: null, // Parent quizzes can't have parents
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

      console.log('Parent quiz updated successfully:', updatedQuiz.id);
      return NextResponse.json(updatedQuiz);
    }

    // Handle regular quiz updates
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Regular quizzes must have at least one question' },
        { status: 400 }
      );
    }

    // Update regular quiz and replace all questions
    const quiz = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        timer: timer || 30,
        parentId: parentId || null,
        isParent: false,
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

// DELETE - Delete a quiz (with parent-child cascade handling AND badge cleanup)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if quiz exists and get its children
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        children: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Use transaction to handle quiz deletion and related data
    await prisma.$transaction(async (prisma) => {
      // Collect all quiz IDs that need badge cleanup
      const quizIdsToCleanup = [params.id];
      
      // If deleting a parent quiz, handle children
      if (existingQuiz.isParent && existingQuiz.children.length > 0) {
        // Add all child quiz IDs to cleanup list
        quizIdsToCleanup.push(...existingQuiz.children.map(child => child.id));
        
        // Convert children to standalone quizzes (remove parent reference)
        await prisma.quiz.updateMany({
          where: { parentId: params.id },
          data: { parentId: null }
        });
        
        console.log(`Converted ${existingQuiz.children.length} sub-quizzes to standalone quizzes`);
      }

      // Delete all badges associated with this quiz (and its children if parent)
      // This handles both quiz_mastery and parent_quiz_mastery badges
      const deletedBadges = await prisma.badge.deleteMany({
        where: {
          OR: [
            {
              // Delete quiz mastery badges for this quiz and all its children
              triggerType: 'quiz_mastery',
              triggerValue: {
                in: quizIdsToCleanup
              }
            },
            {
              // Delete parent quiz mastery badge if this is a parent quiz
              triggerType: 'parent_quiz_mastery',
              triggerValue: params.id
            }
          ]
        }
      });

      console.log(`Deleted ${deletedBadges.count} badge(s) associated with quiz(es)`);

      // Delete the quiz (questions will be cascade deleted due to schema relationship)
      await prisma.quiz.delete({
        where: { id: params.id }
      });

      console.log(`Quiz deleted: ${params.id}. Type: ${existingQuiz.isParent ? 'Parent' : 'Regular'}`);
    });

    const message = existingQuiz.isParent 
      ? `Parent quiz and associated badges deleted successfully. ${existingQuiz.children.length} sub-quizzes converted to standalone quizzes.`
      : 'Quiz and associated badges deleted successfully.';

    return NextResponse.json({ 
      message,
      deletedQuizType: existingQuiz.isParent ? 'parent' : 'regular',
      affectedSubQuizzes: existingQuiz.children.length
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}