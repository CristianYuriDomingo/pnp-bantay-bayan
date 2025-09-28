// FILE 2: app/api/users/quizzes/[id]/route.ts - Updated to handle parent quizzes
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch quiz questions for users (without correct answers)
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
        subjectDomain: true,
        skillArea: true,
        questions: {
          select: {
            id: true,
            question: true,
            lesson: true,
            image: true,
            options: true,
            // Don't include correctAnswer or explanation
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        // Include children if this is a parent quiz
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
        // Include parent info if this is a sub-quiz
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

    // If this is a parent quiz, return error since parent quizzes don't have questions
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

    // For regular quizzes, shuffle questions order for each user session
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