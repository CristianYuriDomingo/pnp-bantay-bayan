// app/api/users/modules/route.ts - ENHANCED with proper lesson ordering
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function addCacheHeaders(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Surrogate-Control', 'no-store')
  return response
}

// GET all modules for user display
export async function GET(request: NextRequest) {
  try {
    console.log('📚 Fetching fresh module data with proper lesson ordering...');
    
    // Fetch modules with lessons ordered properly
    const modules = await prisma.module.findMany({
      include: {
        lessons: {
          include: {
            tips: true
          },
          orderBy: [
            // If you have an order field in your lesson model, use it
            // { order: 'asc' }, 
            // Otherwise, fall back to creation date
            { createdAt: 'asc' },
            { id: 'asc' } // Secondary sort for consistency
          ]
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data with proper lesson sequencing
    const userModules = modules.map(module => {
      // Sort lessons consistently
      const sortedLessons = module.lessons.sort((a, b) => {
        // Primary sort: by creation date
        const dateCompare = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (dateCompare !== 0) return dateCompare;
        
        // Secondary sort: by ID for consistency
        return a.id.localeCompare(b.id);
      });

      return {
        id: module.id,
        title: module.title,
        imageSrc: module.image,
        lessons: `${module.lessons.length} Lessons`,
        buttonText: module.lessons.length > 0 ? 'Start Learning' : 'Coming Soon',
        isAvailable: module.lessons.length > 0,
        totalLessons: module.lessons.length,
        // Include properly ordered lessons for next lesson calculation
        allLessons: sortedLessons.map((lesson, index) => ({
          id: lesson.id,
          title: lesson.title,
          sequenceOrder: index, // Add explicit sequence order
          createdAt: lesson.createdAt
        })),
        // Keep first lesson info for backward compatibility
        firstLessonId: sortedLessons.length > 0 ? sortedLessons[0].id : null,
        firstLessonTitle: sortedLessons.length > 0 ? sortedLessons[0].title : null,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
        _fetchedAt: new Date().toISOString()
      };
    });

    console.log(`✅ Returning ${userModules.length} modules with properly ordered lessons`);

    const response = NextResponse.json({
      success: true,
      data: userModules,
      total: userModules.length,
      timestamp: Date.now()
    });

    return addCacheHeaders(response);
  } catch (error) {
    console.error('Error fetching user modules:', error);
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch modules',
        data: []
      },
      { status: 500 }
    );
    return addCacheHeaders(response);
  }
}