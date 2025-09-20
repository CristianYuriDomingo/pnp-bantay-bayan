// app/api/users/badges/public/route.ts
import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

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

    console.log(`Fetching all badges with user progress for: ${user.email} (ID: ${user.id})`)

    // Get all badges
    const allBadges = await prisma.badge.findMany({
      orderBy: [
        { category: 'asc' },
        { rarity: 'asc' },
        { name: 'asc' }
      ]
    })

    // Get user's earned badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      select: {
        badgeId: true,
        earnedAt: true
      }
    })

    // Create a map of earned badges for quick lookup
    const earnedBadgeMap = new Map(
      userBadges.map(ub => [ub.badgeId, ub.earnedAt])
    )

    // Combine all badges with earned status
    const badgesWithProgress = allBadges.map(badge => ({
      ...badge,
      earnedAt: earnedBadgeMap.get(badge.id) || null,
      isEarned: earnedBadgeMap.has(badge.id)
    }))

    // Get user's badge statistics
    const totalEarned = userBadges.length
    const totalAvailable = allBadges.length
    
    const rarityBreakdown = {
      Common: 0,
      Rare: 0,
      Epic: 0,
      Legendary: 0
    }

    // Count earned badges by rarity
    badgesWithProgress.forEach(badge => {
      if (badge.isEarned && badge.rarity in rarityBreakdown) {
        rarityBreakdown[badge.rarity as keyof typeof rarityBreakdown]++
      }
    })

    const statistics = {
      totalEarned,
      totalAvailable,
      completionPercentage: totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0,
      rarityBreakdown,
      latestBadge: userBadges.length > 0 ? badgesWithProgress.find(b => 
        b.earnedAt && b.earnedAt.getTime() === Math.max(...userBadges.map(ub => ub.earnedAt.getTime()))
      ) || null : null
    }

    const result = {
      userId: user.id,
      userEmail: user.email,
      badges: badgesWithProgress,
      statistics
    }

    console.log(`Retrieved ${allBadges.length} total badges (${totalEarned} earned) for user ${user.email}`)

    const response = createSuccessResponse(result, `All badges retrieved successfully for ${user.email}`)
    return addCacheHeaders(response)

  } catch (error) {
    console.error('Error fetching all badges:', error)
    return addCacheHeaders(createAuthErrorResponse('Failed to fetch badges', 500))
  }
}