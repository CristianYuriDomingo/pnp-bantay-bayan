//app/api/admin/users/[userId]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
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

    const body = await request.json()
    const { role, status } = body

    const updateData: any = {}
    
    if (role) {
      updateData.role = role
    }
    
    if (status) {
      updateData.status = status
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: updateData
    })

    return NextResponse.json({
      id: updatedUser.id,
      role: updatedUser.role,
      status: updatedUser.status
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
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

    // Prevent admin from deleting themselves
    if (currentUser.id === params.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' }, 
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: params.userId }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' }, 
      { status: 500 }
    )
  }
}