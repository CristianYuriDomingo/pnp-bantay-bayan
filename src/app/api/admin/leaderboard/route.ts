// app/api/admin/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Admin leaderboard request received')
    
    // Verify admin authentication
    const user = await getApiUser(request)
    
    if (!user) {
      console.error('❌ No user authenticated')
      return createAuthErrorResponse('Authentication required', 401)
    }

    console.log('✅ User authenticated:', user.email)

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, email: true, name: true }
    })

    console.log('👤 User role check:', dbUser?.role)

    if (dbUser?.role !== 'admin') {
      console.error('❌ User is not admin:', dbUser?.email)
      return createAuthErrorResponse('Admin access required', 403)
    }

    console.log('✅ Admin access confirmed')

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 100)

    console.log('📊 Fetching top', limit, 'learners...')

    // Fetch top learners with all required data
    const topLearners = await prisma.user.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        totalXP: true,
        level: true,
        currentRank: true,
        createdAt: true,
        badgeEarned: {
          select: { id: true }
        }
      },
      orderBy: [
        { totalXP: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit
    })

    console.log('📊 Found', topLearners.length, 'top learners')

    // Count total badges for reference
    const totalBadges = await prisma.badge.count()
    console.log('🏆 Total badges:', totalBadges)

    // Transform data to leaderboard format
    const leaderboard = topLearners.map((user, index) => ({
      userId: user.id,
      name: user.name,
      displayName: user.name || 'Anonymous User',
      email: user.email,
      image: user.image,
      totalXP: user.totalXP,
      level: user.level,
      rank: index + 1,
      pnpRank: user.currentRank || 'Cadet',
      earnedBadges: user.badgeEarned.length,
      totalBadges,
      createdAt: user.createdAt
    }))

    // Calculate statistics
    const totalUsers = await prisma.user.count({
      where: { status: 'active' }
    })

    const avgXPResult = await prisma.user.aggregate({
      where: { status: 'active' },
      _avg: {
        totalXP: true
      }
    })

    const responseData = {
      leaderboard,
      totalUsers,
      topXP: leaderboard[0]?.totalXP || 0,
      averageXP: Math.round(avgXPResult._avg.totalXP || 0)
    }

    console.log('✅ Successfully generated leaderboard with', leaderboard.length, 'entries')

    return createSuccessResponse(responseData)

  } catch (error) {
    console.error('❌ Error fetching admin leaderboard:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    return createAuthErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch leaderboard', 
      500
    )
  }
}

// Optional: Clear cache endpoint
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401)
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (dbUser?.role !== 'admin') {
      return createAuthErrorResponse('Admin access required', 403)
    }

    // You can add cache clearing logic here if needed
    console.log('🗑️ Cache clear requested by admin:', user.email)

    return createSuccessResponse({ cleared: true }, 'Cache cleared successfully')

  } catch (error) {
    console.error('❌ Error clearing cache:', error)
    return createAuthErrorResponse('Failed to clear cache', 500)
  }
}