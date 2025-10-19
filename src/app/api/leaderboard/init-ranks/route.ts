// app/api/leaderboard/init-ranks/route.ts
// Call this endpoint once to initialize all ranks: GET /api/leaderboard/init-ranks

import { NextRequest } from 'next/server'
import { createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { getRankByPosition } from '@/lib/rank-config'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Initializing ranks for all users with updated thresholds...')

    // Fetch all users sorted by XP
    const allUsers = await prisma.user.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        email: true,
        totalXP: true,
        currentRank: true,
        createdAt: true
      },
      orderBy: [
        { totalXP: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    const totalUsers = allUsers.length
    let updatedCount = 0
    const rankDistribution: Record<string, number> = {}

    console.log(`📊 Found ${totalUsers} active users`)

    // Update all users with their ranks based on new thresholds
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i]
      const position = i + 1
      const calculatedRank = getRankByPosition(position, totalUsers)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          currentRank: calculatedRank,
          leaderboardPosition: position,
          rankAchievedAt: new Date(),
          highestRankEver: calculatedRank,
          lastActiveDate: new Date()
        }
      })

      rankDistribution[calculatedRank] = (rankDistribution[calculatedRank] || 0) + 1
      updatedCount++
      console.log(`✅ ${i + 1}/${totalUsers}: ${user.email} → Position #${position}, Rank ${calculatedRank}`)
    }

    console.log(`\n🎉 Rank initialization complete!`)
    console.log(`   - Total users: ${totalUsers}`)
    console.log(`   - Ranks updated: ${updatedCount}`)
    console.log(`   - Rank distribution:`, rankDistribution)

    return createSuccessResponse({
      success: true,
      totalUsers,
      updatedCount,
      rankDistribution,
      message: 'All ranks initialized successfully with new thresholds'
    })

  } catch (error) {
    console.error('❌ Error initializing ranks:', error)
    return createAuthErrorResponse('Failed to initialize ranks', 500)
  }
}