// app/api/admin/badges/route.ts - Fixed TypeScript errors
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET - Fetch all badges
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const badges = await prisma.badge.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new badge
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/badges called'); // Debug log

    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      console.log('Unauthorized access attempt'); // Debug log
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body received:', body); // Debug log

    const { name, description, image, category, rarity, triggerType, triggerValue, prerequisites } = body;

    // Validate required fields
    if (!name || !description || !image || !category || !rarity || !triggerType || !triggerValue) {
      console.log('Missing required fields:', { name: !!name, description: !!description, image: !!image, category: !!category, rarity: !!rarity, triggerType: !!triggerType, triggerValue: !!triggerValue });
      return NextResponse.json({ 
        error: 'All required fields must be provided',
        missing: {
          name: !name,
          description: !description,
          image: !image,
          category: !category,
          rarity: !rarity,
          triggerType: !triggerType,
          triggerValue: !triggerValue
        }
      }, { status: 400 });
    }

    // Validate triggerType
    const validTriggerTypes = ['module_complete', 'lesson_complete', 'quiz_complete', 'manual'];
    if (!validTriggerTypes.includes(triggerType)) {
      console.log('Invalid trigger type:', triggerType);
      return NextResponse.json({ 
        error: `Invalid trigger type. Must be one of: ${validTriggerTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Validate rarity
    const validRarities = ['Common', 'Rare', 'Epic', 'Legendary'];
    if (!validRarities.includes(rarity)) {
      console.log('Invalid rarity:', rarity);
      return NextResponse.json({ 
        error: `Invalid rarity level. Must be one of: ${validRarities.join(', ')}` 
      }, { status: 400 });
    }

    // Check if badge with same trigger already exists
    const existingBadge = await prisma.badge.findFirst({
      where: {
        triggerType,
        triggerValue: triggerValue.trim()
      }
    });

    if (existingBadge) {
      console.log('Badge already exists for this trigger:', { triggerType, triggerValue });
      return NextResponse.json({ 
        error: 'A badge already exists for this trigger. Please edit the existing badge instead.' 
      }, { status: 409 });
    }

    console.log('Creating badge with data:', {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      rarity,
      triggerType,
      triggerValue: triggerValue.trim(),
      hasPrerequisites: !!(prerequisites && prerequisites.length > 0)
    });

    const badge = await prisma.badge.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        image,
        category: category.trim(),
        rarity,
        triggerType,
        triggerValue: triggerValue.trim(),
        prerequisites: prerequisites || []
      }
    });

    console.log('Badge created successfully:', badge.id);
    return NextResponse.json(badge);
  } catch (error: unknown) {
    console.error('Error creating badge:', error);
    
    // Check for specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'A badge with this configuration already exists' 
      }, { status: 409 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}

// PUT - Update an existing badge
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/admin/badges called'); // Debug log

    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('PUT Request body received:', body); // Debug log

    const { id, name, description, image, category, rarity, triggerType, triggerValue, prerequisites } = body;

    if (!id) {
      return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 });
    }

    if (!name || !description || !image || !category || !rarity || !triggerType || !triggerValue) {
      return NextResponse.json({ 
        error: 'All required fields must be provided' 
      }, { status: 400 });
    }

    // Check if badge exists
    const existingBadge = await prisma.badge.findUnique({
      where: { id }
    });

    if (!existingBadge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    // Check if another badge with same trigger already exists (excluding current badge)
    if (triggerType !== existingBadge.triggerType || triggerValue !== existingBadge.triggerValue) {
      const duplicateBadge = await prisma.badge.findFirst({
        where: {
          triggerType,
          triggerValue: triggerValue.trim(),
          NOT: {
            id: id
          }
        }
      });

      if (duplicateBadge) {
        return NextResponse.json({ 
          error: 'Another badge already exists for this trigger' 
        }, { status: 409 });
      }
    }

    const badge = await prisma.badge.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description.trim(),
        image,
        category: category.trim(),
        rarity,
        triggerType,
        triggerValue: triggerValue.trim(),
        prerequisites: prerequisites || []
      }
    });

    console.log('Badge updated successfully:', badge.id);
    return NextResponse.json(badge);
  } catch (error: unknown) {
    console.error('Error updating badge:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    }, { status: 500 });
  }
}

// DELETE - Delete a badge
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const badgeId = searchParams.get('id');

    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 });
    }

    // Check if badge exists
    const existingBadge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });

    if (!existingBadge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    await prisma.badge.delete({
      where: { id: badgeId }
    });

    return NextResponse.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}