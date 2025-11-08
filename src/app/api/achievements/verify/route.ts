// app/api/achievements/verify/route.ts
// Automatic achievement verification - runs on demand when user views achievements

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RankCalculator } from '@/lib/rank-calculator'
import { AchievementService } from '@/lib/achievement-service'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    console.log(`🔍 Auto-verifying achievements for user: ${userId}`)

    // 1. Verify and unlock missing rank achievements
    const rankAchievementsUnlocked = await RankCalculator.verifyAndUnlockMissingAchievements(userId)

    // 2. Verify and unlock missing badge milestone achievements
    await AchievementService.checkAndUnlockBadgeMilestoneAchievements(userId)

    // Get updated achievement counts
    const { prisma } = await import('@/lib/prisma')
    const totalUnlocked = await prisma.userAchievement.count({
      where: { userId }
    })

    console.log(`✅ Verification complete. Rank achievements unlocked: ${rankAchievementsUnlocked}`)

    return NextResponse.json({
      success: true,
      message: 'Achievements verified and unlocked',
      rankAchievementsUnlocked,
      totalUnlocked
    })
  } catch (error) {
    console.error('❌ Error verifying achievements:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to verify achievements',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}