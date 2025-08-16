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

    // Validate the data
    if (role && !['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updateData: any = {}
    
    if (role !== undefined) {
      updateData.role = role
    }
    
    if (status !== undefined) {
      updateData.status = status
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: params.userId }
    })

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        role: updatedUser.role,
        status: updatedUser.status,
        name: updatedUser.name,
        email: updatedUser.email
      }
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

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: params.userId }
    })

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete the user directly (no sessions to worry about)
    await prisma.user.delete({
      where: { id: params.userId }
    })

    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' }, 
      { status: 500 }
    )
  }
}