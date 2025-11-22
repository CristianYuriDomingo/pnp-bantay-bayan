// FILE: app/api/users/quizzes/[id]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Submit answer for a specific question and get feedback
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { questionId, selectedAnswer } = body;

    // Validate required fields
    if (!questionId || selectedAnswer === undefined) {
      return NextResponse.json(
        { error: 'Question ID and selected answer are required' },
        { status: 400 }
      );
    }

    // Find the specific question to get the correct answer and explanation
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        quizId: params.id
      },
      select: {
        id: true,
        question: true,
        options: true,
        correctAnswer: true,
        explanation: true
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Check if the answer is correct
    // selectedAnswer is the ORIGINAL index (sent from frontend after conversion)
    // question.correctAnswer is also the ORIGINAL index (stored in database)
    // -1 means timeout (no answer selected)
    const isCorrect = selectedAnswer !== -1 && selectedAnswer === question.correctAnswer;

    // Return the result with correct answer and explanation
    return NextResponse.json({
      questionId: question.id,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      correctAnswerText: question.options[question.correctAnswer],
      isCorrect,
      explanation: question.explanation,
      question: question.question,
      options: question.options
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

// PUT - Submit all answers at once (for complete quiz submission)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { answers } = body; // Array of { questionId, selectedAnswer }

    // Validate input
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Answers array is required' },
        { status: 400 }
      );
    }

    // Get all questions for this quiz
    const questions = await prisma.question.findMany({
      where: { quizId: params.id },
      select: {
        id: true,
        question: true,
        options: true,
        correctAnswer: true,
        explanation: true
      }
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found or has no questions' },
        { status: 404 }
      );
    }

    // Process each answer
    const results = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      
      if (!question) {
        return {
          questionId: answer.questionId,
          error: 'Question not found'
        };
      }

      // selectedAnswer is ORIGINAL index, question.correctAnswer is also ORIGINAL index
      const isCorrect = answer.selectedAnswer !== -1 && answer.selectedAnswer === question.correctAnswer;
      
      return {
        questionId: question.id,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        correctAnswerText: question.options[question.correctAnswer],
        isCorrect,
        explanation: question.explanation,
        question: question.question,
        options: question.options
      };
    });

    // Calculate score
    const correctCount = results.filter(r => r.isCorrect).length;
    const totalQuestions = results.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    return NextResponse.json({
      score,
      correctCount,
      totalQuestions,
      results
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}