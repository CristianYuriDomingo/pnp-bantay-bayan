// app/api/leaderboard/user/route.ts
import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { UserRankInfo } from '@/types/leaderboard'
import { PNPRank } from '@/types/rank'
import { getRankByXP, getBaseRankByXP, getNextRank, getRankInfo, getNextXPThreshold, isStarRank } from '@/lib/rank-config'

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
        role: true,
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

    // ✅ SOLUTION: Special handling for admins
    if (currentUser.role === 'admin') {
      console.log('👑 Admin user detected - returning special admin stats')
      
      // Get total badges count
      const totalBadges = await prisma.badge.count()
      
      // Return admin-specific response (no competitive rank)
      const adminRankInfo: UserRankInfo = {
        rank: 0, // Admins are not ranked
        totalXP: currentUser.totalXP,
        level: currentUser.level,
        xpToNextLevel: 0,
        percentToNextLevel: 100,
        usersAhead: 0,
        xpBehindNext: null,
        totalBadges,
        earnedBadges: currentUser.badgeEarned.length,
        pnpRank: 'PGEN', // Admins get highest rank for display
        baseRank: getBaseRankByXP(currentUser.totalXP),
        nextPNPRank: null,
        xpToNextRank: null
      }

      return addCacheHeaders(createSuccessResponse(adminRankInfo))
    }

    // ✅ For regular users: Calculate competitive rank (excluding admins)
    const totalUsers = await prisma.user.count({
      where: { 
        status: 'active',
        role: { not: 'admin' } // Don't count admins
      }
    })

    // Count users ahead (higher XP, or same XP but older account) - EXCLUDING ADMINS
    const usersAhead = await prisma.user.count({
      where: {
        status: 'active',
        role: { not: 'admin' }, // ⭐ Don't count admins
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

    // ✅ NEW: Calculate rank using dual-track system
    const pnpRank = getRankByXP(currentUser.totalXP, rank, totalUsers)
    const baseRank = getBaseRankByXP(currentUser.totalXP)
    
    // Update if rank changed
    if (currentUser.currentRank !== pnpRank) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          currentRank: pnpRank,
          leaderboardPosition: rank,
          rankAchievedAt: new Date()
        }
      })
      console.log(`🔄 Auto-updated rank ${pnpRank} for user ${user.email}`)
    }
    
    // ✅ NEW: Determine next rank based on rank type
    let nextPNPRank: PNPRank | null = null
    let xpToNextRank: number | null = null
    
    if (isStarRank(pnpRank)) {
      // For star ranks, show competitive progression - EXCLUDING ADMINS
      const userAhead = await prisma.user.findFirst({
        where: {
          status: 'active',
          role: { not: 'admin' }, // ⭐ Don't count admins
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
      
      if (userAhead && userAhead.currentRank !== pnpRank) {
        nextPNPRank = userAhead.currentRank as PNPRank
        xpToNextRank = userAhead.totalXP - currentUser.totalXP
      }
    } else {
      // For sequential ranks, show XP threshold progression
      const nextThreshold = getNextXPThreshold(currentUser.totalXP)
      if (nextThreshold) {
        nextPNPRank = nextThreshold.rank
        xpToNextRank = nextThreshold.xpNeeded
      }
    }

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
      xpBehindNext: xpToNextRank,
      totalBadges,
      earnedBadges: currentUser.badgeEarned.length,
      pnpRank,
      baseRank, // ✅ NEW: Learning progression rank
      nextPNPRank,
      xpToNextRank
    }

    console.log(`✅ Rank info: #${rank}, Rank: ${pnpRank}, Base: ${baseRank}, Level ${currentUser.level}, ${currentUser.totalXP} XP`)

    return addCacheHeaders(createSuccessResponse(rankInfo))

  } catch (error) {
    console.error('❌ Error fetching user rank:', error)
    return addCacheHeaders(createAuthErrorResponse('Failed to fetch user rank', 500))
  }
}