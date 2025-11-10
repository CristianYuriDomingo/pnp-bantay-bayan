// app/api/achievements/check-new/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get achievements that were earned recently but haven't been seen
    const newAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        notificationSeen: false,
      },
      include: {
        achievement: true
      },
      orderBy: {
        earnedAt: 'desc'
      },
      take: 5
    })

    console.log(`📊 Found ${newAchievements.length} unseen achievements for user ${userId}`)

    // Format for frontend BEFORE marking as seen
    const formattedAchievements = newAchievements.map(ua => ({
      id: ua.achievement.id,
      code: ua.achievement.code,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      category: ua.achievement.category,
      xpReward: ua.xpAwarded
    }))

    // Mark them as seen AFTER formatting (prevent data loss)
    if (newAchievements.length > 0) {
      await prisma.userAchievement.updateMany({
        where: {
          userId,
          notificationSeen: false
        },
        data: {
          notificationSeen: true
        }
      })
      console.log(`✅ Marked ${newAchievements.length} achievements as seen`)
    }

    return NextResponse.json({
      success: true,
      newAchievements: formattedAchievements,
      count: formattedAchievements.length
    })
  } catch (error) {
    console.error('❌ Error checking new achievements:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check achievements' },
      { status: 500 }
    )
  }
}

// Set cache headers to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
