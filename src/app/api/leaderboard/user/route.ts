// app/api/leaderboard/user/route.ts
import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { UserRankInfo } from '@/types/leaderboard'

function addCacheHeaders(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return addCacheHeaders(createAuthErrorResponse('Authentication required', 401))
    }

    console.log(`📊 Fetching rank info for user: ${user.email}`)

    // Get current user's data
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        totalXP: true,
        level: true,
        createdAt: true,
        badgeEarned: {
          select: { id: true }
        }
      }
    })

    if (!currentUser) {
      return addCacheHeaders(createAuthErrorResponse('User not found', 404))
    }

    // Count users ahead (higher XP, or same XP but older account)
    const usersAhead = await prisma.user.count({
      where: {
        status: 'active',
        OR: [
          { totalXP: { gt: currentUser.totalXP } },
          {
            AND: [
              { totalXP: currentUser.totalXP },
              { createdAt: { lt: currentUser.createdAt } }
            ]
          }
        ]
      }
    })

    const rank = usersAhead + 1

    // Get the user directly ahead (for XP difference)
    const userAhead = await prisma.user.findFirst({
      where: {
        status: 'active',
        OR: [
          { totalXP: { gt: currentUser.totalXP } },
          {
            AND: [
              { totalXP: currentUser.totalXP },
              { createdAt: { lt: currentUser.createdAt } }
            ]
          }
        ]
      },
      orderBy: [
        { totalXP: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        totalXP: true
      }
    })

    // Calculate XP to next level (every 100 XP = 1 level)
    const currentLevelXP = (currentUser.level - 1) * 100
    const nextLevelXP = currentUser.level * 100
    const xpInCurrentLevel = currentUser.totalXP - currentLevelXP
    const xpToNextLevel = nextLevelXP - currentUser.totalXP
    const percentToNextLevel = Math.round((xpInCurrentLevel / 100) * 100)

    // Get total badges count
    const totalBadges = await prisma.badge.count()

    const rankInfo: UserRankInfo = {
      rank,
      totalXP: currentUser.totalXP,
      level: currentUser.level,
      xpToNextLevel,
      percentToNextLevel,
      usersAhead,
      xpBehindNext: userAhead ? userAhead.totalXP - currentUser.totalXP : null,
      totalBadges,
      earnedBadges: currentUser.badgeEarned.length
    }

    console.log(`✅ Rank info for ${user.email}: Rank #${rank}, Level ${currentUser.level}, ${currentUser.totalXP} XP`)

    return addCacheHeaders(createSuccessResponse(rankInfo))

  } catch (error) {
    console.error('❌ Error fetching user rank:', error)
    return addCacheHeaders(createAuthErrorResponse('Failed to fetch user rank', 500))
  }
}