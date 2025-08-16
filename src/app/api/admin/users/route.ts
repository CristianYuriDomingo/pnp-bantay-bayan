//app/api/admin/users/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Fetch all users (simple approach without sessions)
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
    })

    // Transform data to match frontend interface
    const transformedUsers = users.map(user => {
      return {
        id: user.id,
        name: user.name || 'No Name',
        email: user.email,
        role: user.role as 'admin' | 'user',
        status: (user.status || 'active') as 'active' | 'inactive',
        createdAt: user.createdAt.toISOString(),
        completedLessons: 0, // Removed progress tracking
        totalScore: 0 // Removed progress tracking
      }
    })

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    )
  }
}