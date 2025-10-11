// app/api/leaderboard/route.ts
import { NextRequest } from 'next/server'
import { createSuccessResponse, createAuthErrorResponse, getApiUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { LeaderboardResponse, LeaderboardPaginationLimit } from '@/types/leaderboard'

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
let cachedData: { data: LeaderboardResponse; timestamp: number } | null = null

function addCacheHeaders(response: Response): Response {
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
  return response
}

export async function GET(request: NextRequest) {
  try {
    // Get current user (optional - works for both authenticated and public)
    const currentUser = await getApiUser(request)
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '25') as LeaderboardPaginationLimit
    const page = parseInt(searchParams.get('page') || '1')
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Validate pagination
    if (![10, 25, 50, 100].includes(limit)) {
      return createAuthErrorResponse('Invalid limit. Must be 10, 25, 50, or 100', 400)
    }

    if (page < 1) {
      return createAuthErrorResponse('Invalid page number', 400)
    }

    console.log(`📊 Leaderboard request: limit=${limit}, page=${page}, user=${currentUser?.email || 'anonymous'}`)

    // Check cache (unless force refresh)
    const now = Date.now()
    if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      console.log('✅ Returning cached leaderboard data')
      
      // Filter cached data for current page
      const start = (page - 1) * limit
      const end = start + limit
      const paginatedLeaderboard = cachedData.data.leaderboard.slice(start, end)
      
      return addCacheHeaders(createSuccessResponse({
        ...cachedData.data,
        leaderboard: paginatedLeaderboard,
        pagination: {
          page,
          limit,
          total: cachedData.data.leaderboard.length,
          hasMore: end < cachedData.data.leaderboard.length
        }
      }))
    }

    // Fetch all users with their stats
    const allUsers = await prisma.user.findMany({
      where: {
        status: 'active' // Only active users
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        totalXP: true,
        level: true,
        createdAt: true,
        badgeEarned: {
          select: {
            id: true
          }
        }
      },
      orderBy: [
        { totalXP: 'desc' },
        { createdAt: 'asc' } // Tie-breaker: older account wins
      ]
    })

    // Count total badges available (for stats)
    const totalBadgesCount = await prisma.badge.count()

    // Transform to leaderboard entries with ranks
    const leaderboard = allUsers.map((user, index) => ({
      userId: user.id,
      name: user.name,
      displayName: user.name || 'Anonymous User',
      image: user.image,
      totalXP: user.totalXP,
      level: user.level,
      rank: index + 1,
      createdAt: user.createdAt,
      totalBadges: totalBadgesCount,
      earnedBadges: user.badgeEarned.length
    }))

    // Find current user's entry
    const currentUserEntry = currentUser 
      ? leaderboard.find(entry => entry.userId === currentUser.id) || null
      : null

    // Calculate statistics
    const totalXP = leaderboard.reduce((sum, user) => sum + user.totalXP, 0)
    const stats = {
      totalUsers: leaderboard.length,
      topXP: leaderboard[0]?.totalXP || 0,
      averageXP: leaderboard.length > 0 ? Math.round(totalXP / leaderboard.length) : 0,
      averageLevel: leaderboard.length > 0 
        ? Math.round(leaderboard.reduce((sum, u) => sum + u.level, 0) / leaderboard.length) 
        : 1,
      lastUpdated: new Date()
    }

    // Paginate results
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedLeaderboard = leaderboard.slice(start, end)

    const responseData: LeaderboardResponse = {
      leaderboard: paginatedLeaderboard,
      currentUser: currentUserEntry,
      stats,
      pagination: {
        page,
        limit,
        total: leaderboard.length,
        hasMore: end < leaderboard.length
      }
    }

    // Cache the full leaderboard
    cachedData = {
      data: {
        ...responseData,
        leaderboard: leaderboard // Cache full list
      },
      timestamp: now
    }

    console.log(`✅ Leaderboard generated: ${leaderboard.length} users, showing ${paginatedLeaderboard.length}`)

    return addCacheHeaders(createSuccessResponse(responseData))

  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error)
    return createAuthErrorResponse('Failed to fetch leaderboard', 500)
  }
}

// Endpoint to invalidate cache (for admin use or after major events)
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401)
    }

    // Optional: Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (dbUser?.role !== 'admin') {
      return createAuthErrorResponse('Admin access required', 403)
    }

    // Clear cache
    cachedData = null
    console.log('🗑️ Leaderboard cache cleared by admin:', user.email)

    return createSuccessResponse({ cleared: true }, 'Cache cleared successfully')

  } catch (error) {
    console.error('❌ Error clearing cache:', error)
    return createAuthErrorResponse('Failed to clear cache', 500)
  }
}