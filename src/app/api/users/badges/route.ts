// app/api/users/badges/route.ts
import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { BadgeService } from '@/lib/badge-service'

function addCacheHeaders(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Surrogate-Control', 'no-store')
  return response
}

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return addCacheHeaders(createAuthErrorResponse('Authentication required', 401))
    }

    console.log(`🏆 Fetching badges for user: ${user.email} (ID: ${user.id})`)

    // Get user's badges
    const userBadges = await BadgeService.getUserBadges(user.id)
    
    // Get user's badge statistics
    const badgeStats = await BadgeService.getUserBadgeStats(user.id)

    const result = {
      userId: user.id,
      userEmail: user.email,
      badges: userBadges,
      statistics: badgeStats
    }

    console.log(`✅ Retrieved ${userBadges.length} badges for user ${user.email}`)

    const response = createSuccessResponse(result, `Badges retrieved successfully for ${user.email}`)
    return addCacheHeaders(response)

  } catch (error) {
    console.error('Error fetching user badges:', error)
    return addCacheHeaders(createAuthErrorResponse('Failed to fetch badges', 500))
  }
}

