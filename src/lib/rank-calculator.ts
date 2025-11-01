// lib/rank-calculator.ts - COMPLETE WITH OPTION 1 FIX
import { prisma } from '@/lib/prisma'
import { PNPRank, UserRankData, RankChangeEvent } from '@/types/rank'
import { 
  getRankByXP, 
  getBaseRankByXP,
  getRankInfo, 
  compareRanks,
  isStarRank,
  getNextXPThreshold
} from '@/lib/rank-config'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'

export class RankCalculator {
  /**
   * Initialize a new user with Cadet rank
   */
  static async initializeNewUserRank(userId: string): Promise<UserRankData | null> {
    try {
      const rankHistoryEntry = {
        rank: 'Cadet',
        position: null,
        timestamp: new Date().toISOString(),
        totalXP: 0
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          currentRank: 'Cadet',
          leaderboardPosition: null,
          rankAchievedAt: new Date(),
          highestRankEver: 'Cadet',
          rankHistory: [rankHistoryEntry] as any
        },
        select: {
          id: true,
          currentRank: true,
          leaderboardPosition: true,
          totalXP: true,
          level: true,
          rankAchievedAt: true,
          highestRankEver: true
        }
      })

      console.log(`✅ New user initialized with Cadet rank: ${userId}`)

      return {
        userId: user.id,
        currentRank: user.currentRank as PNPRank,
        leaderboardPosition: user.leaderboardPosition || 0,
        totalXP: user.totalXP,
        level: user.level,
        rankAchievedAt: user.rankAchievedAt,
        highestRankEver: user.highestRankEver as PNPRank
      }
    } catch (error) {
      console.error('❌ Error initializing user rank:', error)
      return null
    }
  }

  /**
   * Calculate and update ranks for all users - DUAL TRACK SYSTEM
   */
  static async calculateAllRanks(): Promise<RankChangeEvent[]> {
    try {
      // Get all active users sorted by totalXP (descending)
      const allUsers = await prisma.user.findMany({
        where: {
          status: 'active'
        },
        select: {
          id: true,
          totalXP: true,
          currentRank: true,
          highestRankEver: true,
          createdAt: true
        },
        orderBy: [
          { totalXP: 'desc' },
          { createdAt: 'asc' }
        ]
      })

      if (allUsers.length === 0) {
        return []
      }

      const totalUsers = allUsers.length
      const rankChanges: RankChangeEvent[] = []
      const usersWithSequentialPromotions: Array<{ userId: string; oldRank: PNPRank; newRank: PNPRank }> = []
      const usersWithStarPromotions: Array<{ userId: string; newRank: PNPRank }> = []
      const usersWithStarDemotions: string[] = []

      // Calculate new rank for each user
      for (let i = 0; i < allUsers.length; i++) {
        const user = allUsers[i]
        const position = i + 1
        const oldRank = user.currentRank as PNPRank
        
        // Dual-track rank calculation
        const newRank = getRankByXP(user.totalXP, position, totalUsers)
        const baseRank = getBaseRankByXP(user.totalXP)

        // Prepare rank history entry
        const rankHistoryEntry = {
          rank: newRank,
          position,
          timestamp: new Date().toISOString(),
          totalXP: user.totalXP,
          baseRank
        }

        // Get existing rank history
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { rankHistory: true }
        })

        const rankHistory = Array.isArray(existingUser?.rankHistory) 
          ? existingUser.rankHistory 
          : []

        // Determine highest rank ever
        const rankComparison = compareRanks(newRank, user.highestRankEver as PNPRank)
        const newHighestRank = rankComparison > 0 ? newRank : user.highestRankEver

        // Update user's rank
        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentRank: newRank,
            leaderboardPosition: position,
            rankAchievedAt: oldRank !== newRank ? new Date() : undefined,
            highestRankEver: newHighestRank,
            rankHistory: [...rankHistory, rankHistoryEntry] as any,
            lastActiveDate: new Date()
          }
        })

        // Track rank changes
        if (oldRank !== newRank) {
          const change = compareRanks(newRank, oldRank) > 0 ? 'promotion' : 'demotion'
          const isStarRankChange = isStarRank(newRank) || isStarRank(oldRank)
          
          rankChanges.push({
            userId: user.id,
            oldRank,
            newRank,
            change,
            timestamp: new Date(),
            isStarRank: isStarRankChange
          })

          // Track different types of changes
          if (change === 'promotion') {
            if (isStarRank(newRank)) {
              usersWithStarPromotions.push({ userId: user.id, newRank })
            } else {
              usersWithSequentialPromotions.push({ userId: user.id, oldRank, newRank })
            }
          } else if (change === 'demotion' && isStarRank(oldRank)) {
            usersWithStarDemotions.push(user.id)
          }
        }
      }

      // ⭐ ACHIEVEMENT HANDLING

      // 1. Sequential rank promotions: Award all skipped achievements
      if (usersWithSequentialPromotions.length > 0) {
        console.log(`🎖️ Processing ${usersWithSequentialPromotions.length} sequential rank promotions...`)
        
        for (const { userId, oldRank, newRank } of usersWithSequentialPromotions) {
          try {
            await this.awardSequentialRankAchievements(userId, oldRank, newRank)
          } catch (error) {
            console.error(`⚠️ Failed to award sequential achievements for user ${userId}:`, error)
          }
        }
      }

      // 2. Star rank promotions: Award star rank achievement + special badges
      if (usersWithStarPromotions.length > 0) {
        console.log(`⭐ Processing ${usersWithStarPromotions.length} star rank promotions...`)
        
        for (const { userId, newRank } of usersWithStarPromotions) {
          try {
            await this.handleStarRankPromotion(userId, newRank)
          } catch (error) {
            console.error(`⚠️ Failed to handle star promotion for user ${userId}:`, error)
          }
        }
      }

      // 3. Star rank demotions: Remove temporary star achievements
      if (usersWithStarDemotions.length > 0) {
        console.log(`📉 Processing ${usersWithStarDemotions.length} star rank demotions...`)
        
        for (const userId of usersWithStarDemotions) {
          try {
            await this.handleStarRankDemotion(userId)
          } catch (error) {
            console.error(`⚠️ Failed to handle star demotion for user ${userId}:`, error)
          }
        }
      }

      console.log(`✅ Rank calculation complete. ${rankChanges.length} rank changes.`)
      return rankChanges

    } catch (error) {
      console.error('❌ Error calculating ranks:', error)
     throw error
    }
  }

  /**
   * Award achievements for all sequential ranks between old and new
   */
  private static async awardSequentialRankAchievements(
    userId: string,
    oldRank: PNPRank,
    newRank: PNPRank
  ): Promise<void> {
    const oldOrder = getRankInfo(oldRank).order
    const newOrder = getRankInfo(newRank).order

    console.log(`🎯 Awarding sequential achievements for ${oldRank} → ${newRank}`)

    // Award achievement for each rank in between (inclusive of new rank)
    for (let order = oldOrder + 1; order <= newOrder; order++) {
      // Find the rank with this order
      const rankEntry = Object.entries(getRankInfo).find(
        ([_, info]: [string, any]) => info.order === order
      )

      if (rankEntry) {
        const rank = rankEntry[0] as PNPRank

        try {
          // Use the correct function signature with context
          const result = await checkAndAwardAchievements(
            userId, 
            'rank_promotion', 
            { rank } // Pass rank in context
          )
          
          if (result.newAchievements.length > 0) {
            console.log(`✅ Awarded achievement for rank: ${rank}`)
          }
        } catch (error) {
          console.error(`❌ Failed to award achievement for rank ${rank}:`, error)
        }
      }
    }
  }

  /**
   * Handle star rank promotion (award competitive achievement + special badges)
   */
  private static async handleStarRankPromotion(
    userId: string,
    newRank: PNPRank
  ): Promise<void> {
    console.log(`👑 User ${userId} promoted to star rank: ${newRank}`)

    // Award the star rank achievement (with rank in context)
    await checkAndAwardAchievements(
      userId, 
      'star_rank_achieved', 
      { rank: newRank }
    )

    // Special permanent badges for highest ranks
    if (newRank === 'PGEN') {
      await checkAndAwardAchievements(
        userId, 
        'special_achievement', 
        { code: 'former-chief-pnp' }
      )
      console.log(`🎖️ Awarded permanent "Former Chief PNP" badge to user ${userId}`)
    }

    if (newRank === 'PLTGEN') {
      await checkAndAwardAchievements(
        userId, 
        'special_achievement', 
        { code: 'former-deputy-chief-pnp' }
      )
      console.log(`🎖️ Awarded permanent "Former Deputy Chief PNP" badge to user ${userId}`)
    }
  }

  /**
   * Handle star rank demotion (remove temporary achievements, keep permanent ones)
   * OPTION 1: No isPermanent field - use achievement codes instead
   */
  private static async handleStarRankDemotion(userId: string): Promise<void> {
    console.log(`📉 User ${userId} demoted from star rank`)

    try {
      // Get current user to check which star rank they currently hold
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          currentRank: true,
          highestRankEver: true 
        }
      })

      if (!user) {
        console.error(`⚠️ User ${userId} not found during demotion`)
        return
      }

      console.log(`   - Current rank: ${user.currentRank}`)
      console.log(`   - Highest ever: ${user.highestRankEver}`)

      // Get all star rank achievements (excluding PCOL which is permanent baseline)
      // PBGEN, PMGEN, PLTGEN, PGEN can be lost on demotion
      const starRankAchievements = await prisma.achievement.findMany({
        where: {
          type: 'star_rank',
          code: {
            notIn: ['rank-pcol'] // PCOL is permanent baseline, keep it
          }
        }
      })

      console.log(`   - Found ${starRankAchievements.length} removable star achievements`)

      // Remove user's competitive star rank achievements
      // Keep only the achievement matching their CURRENT rank
      let removedCount = 0
      for (const achievement of starRankAchievements) {
        // Only remove if this achievement doesn't match current rank
        if (achievement.criteriaValue !== user.currentRank) {
          const result = await prisma.userAchievement.deleteMany({
            where: {
              userId,
              achievementId: achievement.id
            }
          })
          
          if (result.count > 0) {
            console.log(`   🗑️ Removed: ${achievement.name}`)
            removedCount++
          }
        } else {
          console.log(`   ✅ Keeping: ${achievement.name} (current rank)`)
        }
      }
      
      console.log(`   ✅ Removed ${removedCount} temporary achievement(s)`)
      console.log(`   ⭐ Permanent badges retained:`)
      console.log(`      - PCOL (baseline)`)
      console.log(`      - Special honors (Former Chief/Deputy)`)
      console.log(`      - Current rank achievement`)
      
    } catch (error) {
      console.error(`⚠️ Error removing star rank achievements:`, error)
    }

    // Note: These are NEVER removed:
    // 1. rank-pcol (PCOL baseline achievement)
    // 2. former-chief-pnp (Special honor - type: special_achievement)
    // 3. former-deputy-chief-pnp (Special honor - type: special_achievement)
    // 4. Current rank achievement (user still holds this rank)
  }

  /**
   * Get a single user's rank data
   */
  static async getUserRank(userId: string): Promise<UserRankData | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          currentRank: true,
          leaderboardPosition: true,
          totalXP: true,
          level: true,
          rankAchievedAt: true,
          highestRankEver: true
        }
      })

      if (!user) return null

      // Calculate base rank (learning progression)
      const baseRank = getBaseRankByXP(user.totalXP)

      return {
        userId: user.id,
        currentRank: user.currentRank as PNPRank,
        leaderboardPosition: user.leaderboardPosition || 0,
        totalXP: user.totalXP,
        level: user.level,
        rankAchievedAt: user.rankAchievedAt,
        highestRankEver: user.highestRankEver as PNPRank,
        baseRank
      }
    } catch (error) {
      console.error('❌ Error getting user rank:', error)
      return null
    }
  }

  /**
   * Get rank statistics
   */
  static async getRankStatistics() {
    try {
      const users = await prisma.user.findMany({
        where: { status: 'active' },
        select: { currentRank: true }
      })

      const rankCounts: Record<string, number> = {}
      
      users.forEach((user: { currentRank: string }) => {
        const rank = user.currentRank
        rankCounts[rank] = (rankCounts[rank] || 0) + 1
      })

      return {
        totalUsers: users.length,
        rankDistribution: rankCounts
      }
    } catch (error) {
      console.error('❌ Error getting rank statistics:', error)
      return null
    }
  }

  /**
   * Get users by rank
   */
  static async getUsersByRank(rank: PNPRank) {
    try {
      return await prisma.user.findMany({
        where: {
          currentRank: rank,
          status: 'active'
        },
        select: {
          id: true,
          name: true,
          image: true,
          totalXP: true,
          level: true,
          leaderboardPosition: true,
          rankAchievedAt: true
        },
        orderBy: {
          totalXP: 'desc'
        }
      })
    } catch (error) {
      console.error('❌ Error getting users by rank:', error)
      return []
    }
  }

  /**
   * Get rank progress for a user (UPDATED for dual-track system)
   */
  static async getRankProgress(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalXP: true,
          leaderboardPosition: true,
          currentRank: true
        }
      })

      if (!user) return null

      const currentRank = user.currentRank as PNPRank
      const baseRank = getBaseRankByXP(user.totalXP)

      // Check if user is in a competitive star rank
      if (isStarRank(currentRank)) {
        // For star ranks, show competitive progress
        if (!user.leaderboardPosition) return null

        // Get user ahead for competitive progress
        const userAhead = await prisma.user.findFirst({
          where: {
            leaderboardPosition: user.leaderboardPosition - 1,
            status: 'active'
          },
          select: {
            totalXP: true,
            currentRank: true,
            name: true
          }
        })

        if (!userAhead) {
          return {
            type: 'star_rank',
            currentXP: user.totalXP,
            message: 'You are at the top! No one to overtake.',
            currentRank,
            baseRank
          }
        }

        const xpGap = userAhead.totalXP - user.totalXP
        const willPromote = userAhead.currentRank !== user.currentRank

        return {
          type: 'star_rank',
          currentXP: user.totalXP,
          targetXP: userAhead.totalXP,
          xpNeeded: xpGap,
          targetUser: userAhead.name,
          willPromote,
          targetRank: userAhead.currentRank,
          currentRank,
          baseRank
        }
      } else {
        // For non-star ranks, show XP-based progress
        const nextThreshold = getNextXPThreshold(user.totalXP)

        if (!nextThreshold) {
          // User has maxed XP for sequential ranks
          return {
            type: 'sequential_maxed',
            currentXP: user.totalXP,
            message: 'You have completed all learning ranks! Compete for star ranks on the leaderboard.',
            currentRank,
            baseRank
          }
        }

        return {
          type: 'sequential',
          currentXP: user.totalXP,
          targetXP: getRankInfo(nextThreshold.rank).minXP || 0,
          xpNeeded: nextThreshold.xpNeeded,
          nextRank: nextThreshold.rank,
          currentRank,
          baseRank
        }
      }
    } catch (error) {
      console.error('❌ Error getting rank progress:', error)
      return null
    }
  }

  /**
   * Get detailed rank info for a user (both competitive and base rank)
   */
  static async getUserRankDetails(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          totalXP: true,
          currentRank: true,
          leaderboardPosition: true,
          highestRankEver: true,
          rankAchievedAt: true
        }
      })

      if (!user) return null

      const currentRank = user.currentRank as PNPRank
      const baseRank = getBaseRankByXP(user.totalXP)
      const isCurrentlyStarRank = isStarRank(currentRank)

      return {
        userId: user.id,
        currentRank,
        currentRankInfo: getRankInfo(currentRank),
        baseRank,
        baseRankInfo: getRankInfo(baseRank),
        isStarRank: isCurrentlyStarRank,
        leaderboardPosition: user.leaderboardPosition,
        totalXP: user.totalXP,
        highestRankEver: user.highestRankEver as PNPRank,
        rankAchievedAt: user.rankAchievedAt
      }
    } catch (error) {
      console.error('❌ Error getting rank details:', error)
      return null
    }
  }
}