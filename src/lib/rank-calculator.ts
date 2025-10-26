// lib/rank-calculator.ts - With Achievement Trigger
import { prisma } from '@/lib/prisma'
import { PNPRank, UserRankData, RankChangeEvent } from '@/types/rank'
import { getRankByPosition, getRankInfo, compareRanks } from '@/lib/rank-config'
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
   * Calculate and update ranks for all users - WITH ACHIEVEMENT TRIGGERS
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
      const usersWithPromotions: string[] = []

      // Calculate new rank for each user
      for (let i = 0; i < allUsers.length; i++) {
        const user = allUsers[i]
        const position = i + 1
        const oldRank = user.currentRank as PNPRank
        const newRank = getRankByPosition(position, totalUsers)

        // Prepare rank history entry
        const rankHistoryEntry = {
          rank: newRank,
          position,
          timestamp: new Date().toISOString(),
          totalXP: user.totalXP
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

        // Track rank changes and promotions
        if (oldRank !== newRank) {
          const change = compareRanks(newRank, oldRank) > 0 ? 'promotion' : 'demotion'
          rankChanges.push({
            userId: user.id,
            oldRank,
            newRank,
            change,
            timestamp: new Date()
          })

          // Track users who got promoted for achievement check
          if (change === 'promotion') {
            usersWithPromotions.push(user.id)
          }
        }
      }

      // ⭐ TRIGGER ACHIEVEMENT CHECKS FOR PROMOTED USERS
      if (usersWithPromotions.length > 0) {
        console.log(`🏆 Checking rank achievements for ${usersWithPromotions.length} promoted users...`)
        
        for (const userId of usersWithPromotions) {
          try {
            const achievementResult = await checkAndAwardAchievements(
              userId,
              'rank_promotion'
            )

            if (achievementResult.newAchievements.length > 0) {
              console.log(
                `🎉 User ${userId} earned ${achievementResult.newAchievements.length} rank achievement(s)!`
              )
            }
          } catch (achievementError) {
            console.error(`⚠️ Achievement check failed for user ${userId}:`, achievementError)
            // Continue with other users even if one fails
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
   * Get rank progress for a user
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

      if (!user || !user.leaderboardPosition) return null

      // Get user ahead (next position)
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

      if (!userAhead) return null

      const xpGap = userAhead.totalXP - user.totalXP
      const willPromote = userAhead.currentRank !== user.currentRank

      return {
        currentXP: user.totalXP,
        targetXP: userAhead.totalXP,
        xpNeeded: xpGap,
        targetUser: userAhead.name,
        willPromote,
        targetRank: userAhead.currentRank
      }
    } catch (error) {
      console.error('❌ Error getting rank progress:', error)
      return null
    }
  }
}