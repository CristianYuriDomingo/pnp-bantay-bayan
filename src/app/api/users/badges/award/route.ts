// app/api/users/badges/award/route.ts
import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { BadgeService } from '@/lib/badge-service'

function addCacheHeaders(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Surrogate-Control', 'no-store')
  return response
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return addCacheHeaders(createAuthErrorResponse('Authentication required', 401))
    }

    const body = await request.json()
    const { lessonId, moduleId, type = 'lesson' } = body

    if (!lessonId || !moduleId) {
      return addCacheHeaders(createAuthErrorResponse('Lesson ID and Module ID are required', 400))
    }

    console.log(`🎯 Processing badge awards for user ${user.email}: ${type} completion`)

    // Award badges for lesson completion
    const badgeResult = await BadgeService.awardBadgesForLessonCompletion(
      user.id,
      lessonId,
      moduleId
    )

    if (!badgeResult.success) {
      console.error('Badge awarding failed:', badgeResult.errors)
      return addCacheHeaders(createAuthErrorResponse(
        `Badge awarding failed: ${badgeResult.errors.join(', ')}`,
        500
      ))
    }

    console.log(`🏆 Successfully awarded ${badgeResult.newBadges.length} new badges to user ${user.email}`)

    const response = createSuccessResponse({
      userId: user.id,
      userEmail: user.email,
      newBadges: badgeResult.newBadges,
      badgeCount: badgeResult.newBadges.length,
      success: true
    }, `Badge check completed for ${user.email} - ${badgeResult.newBadges.length} new badges earned`)

    return addCacheHeaders(response)

  } catch (error) {
    console.error('Error in badge awarding process:', error)
    return addCacheHeaders(createAuthErrorResponse('Failed to process badge awards', 500))
  }
}