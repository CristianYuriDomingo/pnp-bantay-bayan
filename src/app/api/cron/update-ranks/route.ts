// app/api/cron/update-ranks/route.ts
// Scheduled rank recalculation for competitive star ranks
// Set up a cron job to call this endpoint every hour (or as needed)

import { NextResponse } from 'next/server'
import { RankCalculator } from '@/lib/rank-calculator'

// Protect this endpoint - only allow calls from your cron service or with a secret token
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-token-here'

export async function GET(request: Request) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token !== CRON_SECRET) {
      console.log('❌ Unauthorized cron request')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('⏰ Starting scheduled rank recalculation...')
    const startTime = Date.now()

    // Recalculate all ranks (includes achievement awarding)
    const rankChanges = await RankCalculator.calculateAllRanks()

    const duration = Date.now() - startTime
    console.log(`✅ Rank recalculation complete in ${duration}ms`)
    console.log(`📊 Changes: ${rankChanges.length} users affected`)

    // Log promotions and demotions
    const promotions = rankChanges.filter(rc => rc.change === 'promotion')
    const demotions = rankChanges.filter(rc => rc.change === 'demotion')
    const starRankChanges = rankChanges.filter(rc => rc.isStarRank)

    console.log(`   ⬆️ Promotions: ${promotions.length}`)
    console.log(`   ⬇️ Demotions: ${demotions.length}`)
    console.log(`   ⭐ Star rank changes: ${starRankChanges.length}`)

    return NextResponse.json({
      success: true,
      message: 'Rank recalculation completed',
      stats: {
        totalChanges: rankChanges.length,
        promotions: promotions.length,
        demotions: demotions.length,
        starRankChanges: starRankChanges.length,
        durationMs: duration
      },
      changes: rankChanges.map(rc => ({
        userId: rc.userId,
        oldRank: rc.oldRank,
        newRank: rc.newRank,
        change: rc.change,
        isStarRank: rc.isStarRank
      }))
    })

  } catch (error) {
    console.error('❌ Cron job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Rank recalculation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Alternative: POST endpoint for manual triggering (admin only)
export async function POST(request: Request) {
  try {
    // Add your admin authentication check here
    // For example, check if user has admin role
    
    console.log('🔧 Manual rank recalculation triggered')
    
    const rankChanges = await RankCalculator.calculateAllRanks()

    return NextResponse.json({
      success: true,
      message: 'Manual rank recalculation completed',
      changes: rankChanges.length,
      rankChanges
    })

  } catch (error) {
    console.error('❌ Manual recalculation failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to recalculate ranks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/* 
===========================================
SETUP INSTRUCTIONS
===========================================

1. Add to your .env file:
   CRON_SECRET=your-secure-random-token-here
   
   Generate a secure token:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

2. Set up a cron job using one of these services:

   A) Vercel Cron (vercel.json):
   {
     "crons": [{
       "path": "/api/cron/update-ranks",
       "schedule": "0 * * * *"
     }]
   }

   B) GitHub Actions (.github/workflows/rank-cron.yml):
   name: Update Ranks
   on:
     schedule:
       - cron: '0 * * * *'  # Every hour
   jobs:
     update-ranks:
       runs-on: ubuntu-latest
       steps:
         - name: Call rank update endpoint
           run: |
             curl -X GET https://your-domain.com/api/cron/update-ranks \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

   C) External Cron Service (cron-job.org, EasyCron, etc.):
   URL: https://your-domain.com/api/cron/update-ranks
   Method: GET
   Header: Authorization: Bearer YOUR_CRON_SECRET
   Schedule: Every 1 hour

3. Test the endpoint:
   curl -X GET http://localhost:3000/api/cron/update-ranks \
     -H "Authorization: Bearer your-secret-token"

===========================================
RECOMMENDED SCHEDULE
===========================================

Development: Every 5 minutes (for testing)
  "0,5,10,15,20,25,30,35,40,45,50,55 * * * *"

Production: Every 1 hour
  "0 * * * *"

Peak Hours: Every 30 minutes
  "0,30 * * * *"

Low Traffic: Every 6 hours
  "0 0,6,12,18 * * *"

===========================================
MONITORING
===========================================

Add monitoring to track:
- Execution time (should be < 5 seconds for most databases)
- Number of rank changes per run
- Failed executions
- Star rank volatility

Example logging service integration:
- Sentry for error tracking
- Datadog for performance monitoring
- Custom webhook for Slack notifications

===========================================
*/