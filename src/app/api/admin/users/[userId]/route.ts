// src/app/api/admin/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  console.log('GET individual user:', userId);
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated',
        data: null
      }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        error: 'Not authorized',
        data: null
      }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found',
        data: null
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name || 'No Name',
        email: user.email,
        role: user.role as 'admin' | 'user',
        status: (user.status || 'active') as 'active' | 'inactive',
        createdAt: user.createdAt.toISOString(),
        completedLessons: 0,
        totalScore: 0
      },
      message: 'User fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user',
      data: null,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  console.log('PATCH request received for userId:', userId);
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated',
        data: null
      }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        error: 'Not authorized - admin role required',
        data: null
      }, { status: 403 });
    }

    const body = await request.json();
    const { role, status } = body;

    if (role && !['admin', 'user'].includes(role)) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid role. Must be admin or user',
        data: null
      }, { status: 400 });
    }

    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid status. Must be active or inactive',
        data: null
      }, { status: 400 });
    }

    const updateData: any = { updatedAt: new Date() };
    
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found',
        data: null
      }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        role: updatedUser.role,
        status: updatedUser.status,
        name: updatedUser.name,
        email: updatedUser.email
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('PATCH: Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user',
      data: null,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  console.log('DELETE request received for userId:', userId);
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated',
        data: null
      }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        error: 'Not authorized - admin role required',
        data: null
      }, { status: 403 });
    }

    if (currentUser.id === userId) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete your own account',
        data: null
      }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found',
        data: null
      }, { status: 404 });
    }

    try {
      await prisma.userProgress.deleteMany({
        where: { userId: userId }
      });
    } catch (relatedError) {
      console.log('No related UserProgress records to delete:', relatedError);
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('DELETE: Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user',
      data: null,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}