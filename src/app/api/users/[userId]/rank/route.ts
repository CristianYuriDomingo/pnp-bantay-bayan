//app/api/users/[userId]/rank/route.ts
import { NextResponse } from 'next/server'
import { RankCalculator } from '@/lib/rank-calculator'

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const rankData = await RankCalculator.getUserRank(params.userId)
    
    if (!rankData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: rankData
    })
  } catch (error) {
    console.error('Error fetching user rank:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rank data' },
      { status: 500 }
    )
  }
}