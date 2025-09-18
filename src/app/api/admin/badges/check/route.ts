// app/api/admin/badges/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET - Check if badges exist for specific triggers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const triggerType = searchParams.get('triggerType');
    const triggerValue = searchParams.get('triggerValue');

    if (!triggerType || !triggerValue) {
      return NextResponse.json({ 
        error: 'Trigger type and value are required' 
      }, { status: 400 });
    }

    // Validate that the trigger value still exists in the database
    let isValidTrigger = false;
    
    if (triggerType === 'module_complete') {
      const module = await prisma.module.findUnique({
        where: { id: triggerValue },
        select: { id: true }
      });
      isValidTrigger = !!module;
    } else if (triggerType === 'lesson_complete') {
      const lesson = await prisma.lesson.findUnique({
        where: { id: triggerValue },
        select: { id: true }
      });
      isValidTrigger = !!lesson;
    } else {
      // For other trigger types like quiz_complete or manual, assume they're valid
      isValidTrigger = true;
    }

    const badge = await prisma.badge.findFirst({
      where: {
        triggerType,
        triggerValue
      }
    });

    return NextResponse.json({ 
      exists: !!badge,
      badge: badge || null,
      isValidTrigger,
      warning: badge && !isValidTrigger ? 'Badge exists but references deleted content' : null
    });
  } catch (error) {
    console.error('Error checking badge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Bulk check badges for multiple triggers (useful for checking all module/lesson badges at once)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { triggers } = body;

    if (!Array.isArray(triggers)) {
      return NextResponse.json({ 
        error: 'Triggers must be an array of {triggerType, triggerValue} objects' 
      }, { status: 400 });
    }

    // Build OR conditions for all triggers
    const whereConditions = triggers.map(trigger => ({
      AND: {
        triggerType: trigger.triggerType,
        triggerValue: trigger.triggerValue
      }
    }));

    const badges = await prisma.badge.findMany({
      where: {
        OR: whereConditions
      }
    });

    // Get valid modules and lessons for validation
    const moduleIds = new Set();
    const lessonIds = new Set();
    
    const modules = await prisma.module.findMany({ select: { id: true } });
    const lessons = await prisma.lesson.findMany({ select: { id: true } });
    
    modules.forEach(m => moduleIds.add(m.id));
    lessons.forEach(l => lessonIds.add(l.id));

    // Create a map for easy lookup
    const badgeMap = new Map();
    badges.forEach(badge => {
      const key = `${badge.triggerType}-${badge.triggerValue}`;
      badgeMap.set(key, badge);
    });

    // Return results in the same order as requested
    const results = triggers.map(trigger => {
      const key = `${trigger.triggerType}-${trigger.triggerValue}`;
      const badge = badgeMap.get(key) || null;
      
      // Check if trigger is still valid
      let isValidTrigger = true;
      if (trigger.triggerType === 'module_complete') {
        isValidTrigger = moduleIds.has(trigger.triggerValue);
      } else if (trigger.triggerType === 'lesson_complete') {
        isValidTrigger = lessonIds.has(trigger.triggerValue);
      }

      return {
        triggerType: trigger.triggerType,
        triggerValue: trigger.triggerValue,
        exists: !!badge,
        badge,
        isValidTrigger,
        warning: badge && !isValidTrigger ? 'Badge exists but references deleted content' : null
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error bulk checking badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}