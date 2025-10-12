//app/api/users/[userId]/rank-progress/route.ts
import { NextResponse } from 'next/server'
import { RankCalculator } from '@/lib/rank-calculator'

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const progress = await RankCalculator.getRankProgress(params.userId)
    
    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'Progress data not available' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: progress
    })
  } catch (error) {
    console.error('Error fetching rank progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress data' },
      { status: 500 }
    )
  }
}