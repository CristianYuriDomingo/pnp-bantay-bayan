// FILE: app/api/users/quizzes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch quiz questions for users
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        timer: true,
        isParent: true,
        parentId: true,
        questions: {
          select: {
            id: true,
            question: true,
            lesson: true,
            image: true,
            options: true,
            correctAnswer: true,  // Added: Need this for frontend to track correct answers
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        children: {
          select: {
            id: true,
            title: true,
            timer: true,
            isParent: true,
            questions: {
              select: {
                id: true,
                question: true,
                lesson: true,
                image: true,
                options: true,
              },
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

    if (quiz.isParent) {
      return NextResponse.json(
        { 
          error: 'Parent quiz cannot be started directly. Please select a sub-quiz.',
          isParent: true,
          children: quiz.children
        },
        { status: 400 }
      );
    }

    // Shuffle questions order for each user session
    const shuffledQuestions = quiz.questions.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      ...quiz,
      questions: shuffledQuestions
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}