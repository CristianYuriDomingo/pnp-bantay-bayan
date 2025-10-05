// app/api/admin/modules/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single module by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        lessons: {
          include: {
            tips: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Transform data to match your admin interface expectations
    const transformedModule = {
      id: module.id,
      title: module.title,
      image: module.image,
      lessonCount: module.lessons.length,
      status: 'active' as const,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      lessons: module.lessons
    };

    return NextResponse.json(transformedModule);
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { error: 'Failed to fetch module' },
      { status: 500 }
    );
  }
}

// PUT update module by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, image } = body;

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id }
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Update module
    const updatedModule = await prisma.module.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(image && { image: image })
      },
      include: {
        lessons: {
          include: {
            tips: true
          }
        }
      }
    });

    // Transform response to match admin interface
    const transformedModule = {
      id: updatedModule.id,
      title: updatedModule.title,
      image: updatedModule.image,
      lessonCount: updatedModule.lessons.length,
      status: 'active' as const,
      createdAt: updatedModule.createdAt,
      updatedAt: updatedModule.updatedAt
    };

    return NextResponse.json(transformedModule);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    );
  }
}

// DELETE module by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id }
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );  
    }

    // Delete module (lessons and tips will be cascade deleted)
    await prisma.module.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    );
  }
}