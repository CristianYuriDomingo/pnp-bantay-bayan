// app/api/users/modules/route.ts
/**
 * USER-FACING API for fetching modules to display in user dashboard
 * This API is different from admin API - it focuses on READ operations only
 * and formats data specifically for user interface components
 * 
 * Key differences from admin API:
 * - Only GET operations (no CREATE, UPDATE, DELETE)
 * - Returns data formatted for UI components (LearnCard)
 * - Includes user-friendly text formatting
 * - Can include user-specific data like progress (future enhancement)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all modules for user display
export async function GET(request: NextRequest) {
  try {
    // Fetch modules with lessons count
    const modules = await prisma.module.findMany({
      include: {
        lessons: {
          include: {
            tips: true
          },
          orderBy: {
            createdAt: 'asc' // Get lessons in order
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data specifically for user interface (LearnCard component)
    const userModules = modules.map(module => ({
      id: module.id,
      title: module.title,
      imageSrc: module.image, // Match LearnCard prop name
      lessons: `${module.lessons.length} Lessons`, // Format for display
      buttonText: module.lessons.length > 0 ? 'Start Learning' : 'Coming Soon',
      isAvailable: module.lessons.length > 0, // Add availability status
      totalLessons: module.lessons.length,
      // Add first lesson info for RecommendedNext component
      firstLessonId: module.lessons.length > 0 ? module.lessons[0].id : null,
      firstLessonTitle: module.lessons.length > 0 ? module.lessons[0].title : null,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: userModules,
      total: userModules.length
    });
  } catch (error) {
    console.error('Error fetching user modules:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch modules',
        data: []
      },
      { status: 500 }
    );
  }
}