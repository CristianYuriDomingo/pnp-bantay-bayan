//app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeEmpty = searchParams.get('includeEmpty') === 'true';

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No search query provided',
        total: 0
      });
    }

    const searchTerm = query.trim().toLowerCase();

    // Search with more sophisticated query
    const modules = await prisma.module.findMany({
      where: {
        OR: [
          // Search in module title
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          // Search in lessons within modules
          {
            lessons: {
              some: {
                OR: [
                  {
                    title: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    }
                  },
                  {
                    description: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      include: {
        lessons: {
          // Remove the where clause here to get ALL lessons from matching modules
          orderBy: {
            createdAt: 'asc'
          }
        },
        _count: {
          select: {
            lessons: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Transform data and add relevance scoring
    const searchResults = modules.map(module => {
      // Calculate relevance score
      let relevanceScore = 0;
      
      // Module title match gets high score
      if (module.title.toLowerCase().includes(searchTerm)) {
        relevanceScore += 10;
      }
      
      // Filter lessons to only include matches - with null check
      const matchingLessons = module.lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchTerm) ||
        (lesson.description && lesson.description.toLowerCase().includes(searchTerm))
      );

      // Lesson matches get medium score
      relevanceScore += matchingLessons.length * 5;

      return {
        category: module.title,
        image: module.image,
        moduleId: module.id,
        totalLessons: module._count.lessons,
        relevanceScore,
        lessons: matchingLessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          path: `/lessons/${lesson.id}`, // Adjust path based on your routing
          moduleId: module.id,
          moduleName: module.title
        }))
      };
    }).filter(category => {
      // Include categories with matching lessons or if module name matches
      const hasMatchingLessons = category.lessons.length > 0;
      const moduleNameMatches = category.category.toLowerCase().includes(searchTerm);
      
      if (includeEmpty) {
        return hasMatchingLessons || moduleNameMatches;
      }
      
      return hasMatchingLessons;
    }).sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance

    // Add search suggestions if no results found
    let suggestions: string[] = [];
    if (searchResults.length === 0) {
      // Get popular search terms (you can implement this based on your needs)
      const popularModules = await prisma.module.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          title: true
        }
      });
      
      suggestions = popularModules.map(m => m.title);
    }

    return NextResponse.json({
      success: true,
      data: searchResults,
      total: searchResults.length,
      query: searchTerm,
      suggestions,
      hasMore: searchResults.length === limit
    });

  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search',
      data: [],
      total: 0
    }, { status: 500 });
  }
}