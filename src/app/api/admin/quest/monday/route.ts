//app/api/admin/quest/monday/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch the active Quest Monday with all levels and suspects
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (dbUser?.role !== 'admin') {
      return createAuthErrorResponse('Admin access required', 403);
    }

    // Fetch the active quest (or create one if none exists)
    let quest = await prisma.questMonday.findFirst({
      where: { isActive: true },
      include: {
        levels: {
          include: {
            suspects: {
              orderBy: { suspectNumber: 'asc' }
            }
          },
          orderBy: { levelNumber: 'asc' }
        }
      }
    });

    // If no active quest exists, create one
    if (!quest) {
      quest = await prisma.questMonday.create({
        data: {
          title: 'Suspect Line-Up',
          description: 'Identify the correct suspects based on their descriptions',
          isActive: true,
          createdById: user.id
        },
        include: {
          levels: {
            include: {
              suspects: {
                orderBy: { suspectNumber: 'asc' }
              }
            },
            orderBy: { levelNumber: 'asc' }
          }
        }
      });
    }

    return createSuccessResponse(quest);

  } catch (error) {
    console.error('Error fetching Quest Monday:', error);
    return createAuthErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch quest', 
      500
    );
  }
}

// POST - Create or update the entire quest structure
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (dbUser?.role !== 'admin') {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { levels } = body;

    // Validate levels data
    if (!levels || !Array.isArray(levels) || levels.length === 0) {
      return createAuthErrorResponse('Invalid levels data', 400);
    }

    // Validate each level
    for (const level of levels) {
      if (!level.description || !level.description.trim()) {
        return createAuthErrorResponse(`Level ${level.level} is missing description`, 400);
      }

      if (!level.suspects || level.suspects.length !== 4) {
        return createAuthErrorResponse(`Level ${level.level} must have exactly 4 suspects`, 400);
      }

      const correctCount = level.suspects.filter((s: any) => s.isCorrect).length;
      if (correctCount !== 1) {
        return createAuthErrorResponse(`Level ${level.level} must have exactly 1 correct suspect`, 400);
      }

      const missingImages = level.suspects.filter((s: any) => !s.image || !s.image.trim()).length;
      if (missingImages > 0) {
        return createAuthErrorResponse(`Level ${level.level} has ${missingImages} suspect(s) missing image`, 400);
      }
    }

    // Find or create the quest
    let quest = await prisma.questMonday.findFirst({
      where: { isActive: true }
    });

    if (!quest) {
      quest = await prisma.questMonday.create({
        data: {
          title: 'Suspect Line-Up',
          description: 'Identify the correct suspects based on their descriptions',
          isActive: true,
          createdById: user.id
        }
      });
    }

    // Delete existing levels (cascade will delete suspects)
    await prisma.questMondayLevel.deleteMany({
      where: { questMondayId: quest.id }
    });

    // Create new levels with suspects
    const createdLevels = await Promise.all(
      levels.map(async (level: any, index: number) => {
        return await prisma.questMondayLevel.create({
          data: {
            questMondayId: quest.id,
            levelNumber: level.level,
            description: level.description,
            orderIndex: index,
            suspects: {
              create: level.suspects.map((suspect: any, suspectIndex: number) => ({
                imageUrl: suspect.image,
                isCorrect: suspect.isCorrect,
                suspectNumber: suspectIndex + 1
              }))
            }
          },
          include: {
            suspects: {
              orderBy: { suspectNumber: 'asc' }
            }
          }
        });
      })
    );

    // Fetch the updated quest
    const updatedQuest = await prisma.questMonday.findUnique({
      where: { id: quest.id },
      include: {
        levels: {
          include: {
            suspects: {
              orderBy: { suspectNumber: 'asc' }
            }
          },
          orderBy: { levelNumber: 'asc' }
        }
      }
    });

    return createSuccessResponse(updatedQuest, 'Quest saved successfully');

  } catch (error) {
    console.error('Error saving Quest Monday:', error);
    return createAuthErrorResponse(
      error instanceof Error ? error.message : 'Failed to save quest', 
      500
    );
  }
}

// DELETE - Delete a specific level
export async function DELETE(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (dbUser?.role !== 'admin') {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('levelId');

    if (!levelId) {
      return createAuthErrorResponse('Level ID is required', 400);
    }

    // Check if level exists
    const level = await prisma.questMondayLevel.findUnique({
      where: { id: levelId }
    });

    if (!level) {
      return createAuthErrorResponse('Level not found', 404);
    }

    // Delete the level (cascade will delete suspects)
    await prisma.questMondayLevel.delete({
      where: { id: levelId }
    });

    return createSuccessResponse({ deleted: true }, 'Level deleted successfully');

  } catch (error) {
    console.error('Error deleting level:', error);
    return createAuthErrorResponse(
      error instanceof Error ? error.message : 'Failed to delete level', 
      500
    );
  }
}