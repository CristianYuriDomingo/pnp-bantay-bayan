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

    // Normalize search term - trim and handle spaces properly
    const searchTerm = query.trim();

    // Search with case-insensitive matching
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
      
      // Check if module title matches (case-insensitive)
      const moduleMatches = module.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (moduleMatches) {
        relevanceScore += 10;
      }
      
      // Filter lessons to only include matches (case-insensitive)
      const matchingLessons = module.lessons.filter(lesson => {
        const titleMatch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
        const descriptionMatch = lesson.description && 
          lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        return titleMatch || descriptionMatch;
      });

      // Lesson matches get medium score
      relevanceScore += matchingLessons.length * 5;

      // Add extra points for exact matches
      const exactTitleMatch = matchingLessons.some(
        lesson => lesson.title.toLowerCase() === searchTerm.toLowerCase()
      );
      if (exactTitleMatch) {
        relevanceScore += 15;
      }

      return {
        category: module.title,
        image: module.image,
        moduleId: module.id,
        totalLessons: module._count.lessons,
        relevanceScore,
        moduleMatches, // Add this flag to track if module title matches
        lessons: matchingLessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          path: `/lessons/${lesson.id}`,
          moduleId: module.id,
          moduleName: module.title
        })),
        // Include all lessons when module name matches but no lesson matches
        allLessons: moduleMatches && matchingLessons.length === 0 
          ? module.lessons.map(lesson => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              path: `/lessons/${lesson.id}`,
              moduleId: module.id,
              moduleName: module.title
            }))
          : []
      };
    }).filter(category => {
      // Include if module name matches OR if there are matching lessons
      const hasMatchingLessons = category.lessons.length > 0;
      const hasAllLessons = category.allLessons && category.allLessons.length > 0;
      
      if (includeEmpty) {
        return hasMatchingLessons || category.moduleMatches || hasAllLessons;
      }
      
      // KEY FIX: Include module if its name matches, even without matching lessons
      return hasMatchingLessons || category.moduleMatches;
    }).map(category => {
      // Merge lessons and allLessons for final output
      return {
        ...category,
        lessons: category.lessons.length > 0 
          ? category.lessons 
          : (category.allLessons || [])
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Add search suggestions if no results found
    let suggestions: string[] = [];
    if (searchResults.length === 0) {
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