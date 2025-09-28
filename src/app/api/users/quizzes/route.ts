// FILE: app/api/users/quizzes/route.ts - Updated to support parent-child structure
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all quizzes for users with parent-child structure
export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        timer: true,
        createdAt: true,
        isParent: true,
        parentId: true,
        subjectDomain: true,
        skillArea: true,
        questions: {
          select: {
            id: true,
            lesson: true,
            // Don't include question text, options, or correct answers
          }
        },
        // Include children for parent quizzes
        children: {
          select: {
            id: true,
            title: true,
            timer: true,
            createdAt: true,
            isParent: true,
            parentId: true,
            subjectDomain: true,
            skillArea: true,
            questions: {
              select: {
                id: true,
                lesson: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        // Include parent info for sub-quizzes
        parent: {
          select: {
            id: true,
            title: true,
            isParent: true
          }
        }
      },
      orderBy: [
        { isParent: 'desc' }, // Parent quizzes first
        { createdAt: 'desc' }
      ]
    });

    // Transform data for user consumption
    const userQuizzes = quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      timer: quiz.timer,
      questionCount: quiz.questions.length,
      lessons: [...new Set(quiz.questions.map(q => q.lesson))], // Unique lessons
      createdAt: quiz.createdAt,
      isParent: quiz.isParent,
      parentId: quiz.parentId,
      subjectDomain: quiz.subjectDomain,
      skillArea: quiz.skillArea,
      // Include children data for parent quizzes
      children: quiz.children ? quiz.children.map(child => ({
        id: child.id,
        title: child.title,
        timer: child.timer,
        questionCount: child.questions.length,
        lessons: [...new Set(child.questions.map(q => q.lesson))],
        createdAt: child.createdAt,
        isParent: child.isParent,
        parentId: child.parentId,
        subjectDomain: child.subjectDomain,
        skillArea: child.skillArea,
        questions: child.questions // Include for counting
      })) : [],
      // Include parent info
      parent: quiz.parent
    }));

    return NextResponse.json(userQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}