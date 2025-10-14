import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { UserRankInfo } from '@/types/leaderboard'
import { PNPRank } from '@/types/rank'
import { getRankByPosition, getNextRank, getRankInfo } from '@/lib/rank-config'

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
        currentRank: true,
        createdAt: true,
        badgeEarned: {
          select: { id: true }
        }
      }
    })

    if (!currentUser) {
      return addCacheHeaders(createAuthErrorResponse('User not found', 404))
    }

    // Get total number of active users for rank calculation
    const totalUsers = await prisma.user.count({
      where: { status: 'active' }
    })

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

    // Calculate PNP rank based on position - ensure we always have a valid rank
    let pnpRank: PNPRank
    if (currentUser.currentRank && getRankInfo(currentUser.currentRank as PNPRank)) {
      pnpRank = currentUser.currentRank as PNPRank
    } else {
      // Calculate based on position if not set
      pnpRank = getRankByPosition(rank, totalUsers)
      
      // Update the user's rank in the database
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          currentRank: pnpRank,
          leaderboardPosition: rank,
          rankAchievedAt: new Date()
        }
      })
      
      console.log(`🔄 Auto-assigned rank ${pnpRank} to user ${user.email}`)
    }
    
    const nextPNPRank = getNextRank(pnpRank)

    // Get the user directly ahead (for XP difference and next rank info)
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
        totalXP: true,
        currentRank: true
      }
    })

    // Calculate XP to next level (every 100 XP = 1 level)
    const currentLevelXP = (currentUser.level - 1) * 100
    const nextLevelXP = currentUser.level * 100
    const xpInCurrentLevel = currentUser.totalXP - currentLevelXP
    const xpToNextLevel = nextLevelXP - currentUser.totalXP
    const percentToNextLevel = Math.round((xpInCurrentLevel / 100) * 100)

    // Calculate XP needed for next PNP rank (if there is one)
    let xpToNextRank: number | null = null
    if (userAhead && userAhead.currentRank !== pnpRank) {
      xpToNextRank = userAhead.totalXP - currentUser.totalXP
    }

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
      earnedBadges: currentUser.badgeEarned.length,
      pnpRank,
      nextPNPRank,
      xpToNextRank
    }

    console.log(`✅ Rank info for ${user.email}: Rank #${rank}, PNP Rank: ${pnpRank}, Level ${currentUser.level}, ${currentUser.totalXP} XP`)

    return addCacheHeaders(createSuccessResponse(rankInfo))

  } catch (error) {
    console.error('❌ Error fetching user rank:', error)
    return addCacheHeaders(createAuthErrorResponse('Failed to fetch user rank', 500))
  }
}