// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: Date | null;
  image: string | null;
}

export async function GET() {
  console.log('📋 GET /api/admin/users called');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('GET Users - Session found:', !!session);
    
    if (!session || !session.user) {
      console.log('GET Users - No valid session');
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated',
        data: null
      }, { status: 401 });
    }

    console.log('GET Users - User ID from session:', session.user.id);

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    console.log('GET Users - Current user role:', currentUser?.role);

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        error: 'Not authorized - admin role required',
        data: null
      }, { status: 403 });
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        image: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`GET Users - Found ${users.length} users`);

    // Transform data to match frontend interface
    const transformedUsers = users.map((user: User) => ({
      id: user.id,
      name: user.name || 'No Name',
      email: user.email,
      role: user.role as 'admin' | 'user',
      status: (user.status || 'active') as 'active' | 'inactive',
      createdAt: user.createdAt.toISOString(),
      completedLessons: 0,
      totalScore: 0
    }));

    console.log('GET Users - Returning transformed users');

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      message: 'Users fetched successfully'
    });

  } catch (error) {
    console.error('GET Users - Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users',
      data: null,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}