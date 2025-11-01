// app/api/leaderboard/init-ranks/route.ts
import { NextRequest } from 'next/server'
import { createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { RankCalculator } from '@/lib/rank-calculator'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Initializing ranks for all users with NEW DUAL-TRACK SYSTEM...')

    // Use the RankCalculator to recalculate all ranks
    const changes = await RankCalculator.calculateAllRanks()

    console.log(`\n🎉 Rank initialization complete!`)
    console.log(`   - Rank changes: ${changes.length}`)
    console.log(`   - Promotions: ${changes.filter(c => c.change === 'promotion').length}`)
    console.log(`   - Demotions: ${changes.filter(c => c.change === 'demotion').length}`)

    // Get rank distribution
    const users = await prisma.user.findMany({
      where: { status: 'active' },
      select: { currentRank: true }
    })

    const rankDistribution: Record<string, number> = {}
    users.forEach(user => {
      const rank = user.currentRank || 'Cadet'
      rankDistribution[rank] = (rankDistribution[rank] || 0) + 1
    })

    console.log(`   - Rank distribution:`, rankDistribution)

    return createSuccessResponse({
      success: true,
      totalUsers: users.length,
      changes: changes.length,
      rankDistribution,
      message: 'All ranks initialized successfully with NEW DUAL-TRACK SYSTEM'
    })

  } catch (error) {
    console.error('❌ Error initializing ranks:', error)
    return createAuthErrorResponse('Failed to initialize ranks', 500)
  }
}

// Add missing import
import { prisma } from '@/lib/prisma'