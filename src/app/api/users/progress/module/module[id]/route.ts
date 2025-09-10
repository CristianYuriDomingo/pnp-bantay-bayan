// app/api/users/progress/module/[moduleId]/route.ts - FIXED with cache headers
import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

function addCacheHeaders(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Surrogate-Control', 'no-store')
  return response
}

export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return addCacheHeaders(createAuthErrorResponse('Authentication required', 401))
    }

    const { moduleId } = params

    console.log(`📚 User ${user.email} requesting progress for module ${moduleId}`)

    // Get module with its lessons
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      }
    })

    if (!module) {
      return addCacheHeaders(createAuthErrorResponse('Module not found', 404))
    }

    // Get user progress for this module - ONLY for this user
    const moduleProgress = await prisma.userProgress.findMany({
      where: {
        userId: user.id, // 🔒 CRITICAL: Only this user's progress
        moduleId: moduleId
      }
    })

    // Separate lesson progress
    const lessonProgress = moduleProgress.filter(p => p.lessonId !== null)

    // Calculate progress statistics
    const completedLessons = lessonProgress.filter(p => p.completed)
    const progressPercentage = module.lessons.length > 0 
      ? Math.round((completedLessons.length / module.lessons.length) * 100)
      : 0

    console.log(`📈 User ${user.email} module ${moduleId} progress: ${completedLessons.length}/${module.lessons.length} lessons (${progressPercentage}%)`)

    const result = {
      moduleId: moduleId,
      title: module.title,
      image: module.image,
      totalLessons: module.lessons.length,
      completedLessons: completedLessons.length,
      percentage: progressPercentage,
      completed: progressPercentage === 100,
      completedAt: progressPercentage === 100 
        ? completedLessons.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]?.updatedAt
        : null,
      userId: user.id, // 🔒 Include user ID for verification
      userEmail: user.email, // 🔒 For verification
      lessons: module.lessons.map(lesson => {
        const lessonProg = lessonProgress.find(p => p.lessonId === lesson.id)
        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          completed: lessonProg?.completed || false,
          progress: lessonProg?.progress || 0,
          timeSpent: lessonProg?.timeSpent || 0,
          completedAt: lessonProg?.updatedAt || null
        }
      })
    }

    const response = createSuccessResponse(result, `Module progress retrieved successfully for ${user.email}`)
    return addCacheHeaders(response)

  } catch (error) {
    console.error('Error fetching module progress:', error)
    return addCacheHeaders(createAuthErrorResponse('Failed to fetch module progress', 500))
  }
}