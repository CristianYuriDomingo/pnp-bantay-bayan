// app/api/ranks/calculate/route.ts
import { NextResponse } from 'next/server'
import { RankCalculator } from '@/lib/rank-calculator'

export async function POST(req: Request) {
  try {
    // Optional: Add authentication check here
    // Only admins or cron jobs should call this
    
    const rankChanges = await RankCalculator.calculateAllRanks()
    
    return NextResponse.json({
      success: true,
      message: 'Ranks calculated successfully',
      changes: rankChanges.length,
      rankChanges
    })
  } catch (error) {
    console.error('Error in rank calculation API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate ranks' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    // Get basic statistics from the database
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const totalUsers = await prisma.user.count()
    
    // Get all users with their current rank
    const users = await prisma.user.findMany({
      select: {
        currentRank: true
      }
    })
    
    // Count ranks manually
    const rankCounts: Record<string, number> = {}
    users.forEach(user => {
      const rank = user.currentRank || 'Cadet'
      rankCounts[rank] = (rankCounts[rank] || 0) + 1
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      statistics: {
        totalUsers,
        rankDistribution: rankCounts
      }
    })
  } catch (error) {
    console.error('Error getting rank statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get statistics' },
      { status: 500 }
    )
  }
}