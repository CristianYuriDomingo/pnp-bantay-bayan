// lib/rank-calculator.ts - FIXED ACHIEVEMENT VERIFICATION
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
   * Calculate and update ranks for all users
   */
  static async calculateAllRanks(): Promise<RankChangeEvent[]> {
    try {
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

      for (let i = 0; i < allUsers.length; i++) {
        const user = allUsers[i]
        const position = i + 1
        const oldRank = user.currentRank as PNPRank
        
        const newRank = getRankByXP(user.totalXP, position, totalUsers)
        const baseRank = getBaseRankByXP(user.totalXP)

        const rankHistoryEntry = {
          rank: newRank,
          position,
          timestamp: new Date().toISOString(),
          totalXP: user.totalXP,
          baseRank
        }

        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { rankHistory: true }
        })

        const rankHistory = Array.isArray(existingUser?.rankHistory) 
          ? existingUser.rankHistory 
          : []

        const rankComparison = compareRanks(newRank, user.highestRankEver as PNPRank)
        const newHighestRank = rankComparison > 0 ? newRank : user.highestRankEver

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

      // Achievement handling
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

    for (let order = oldOrder + 1; order <= newOrder; order++) {
      const rankEntry = Object.entries(RANK_INFO_MAP).find(
        ([_, info]: [string, any]) => info.order === order
      )

      if (rankEntry) {
        const rank = rankEntry[0] as PNPRank

        try {
          const result = await checkAndAwardAchievements(
            userId, 
            'rank_promotion', 
            { rank }
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
   * Handle star rank promotion
   */
  private static async handleStarRankPromotion(
    userId: string,
    newRank: PNPRank
  ): Promise<void> {
    console.log(`👑 User ${userId} promoted to star rank: ${newRank}`)

    await checkAndAwardAchievements(
      userId, 
      'star_rank_achieved', 
      { rank: newRank }
    )

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
   * Handle star rank demotion
   */
  private static async handleStarRankDemotion(userId: string): Promise<void> {
    console.log(`📉 User ${userId} demoted from star rank`)

    try {
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

      const starRankAchievements = await prisma.achievement.findMany({
        where: {
          type: 'star_rank',
          code: {
            notIn: ['rank-pcol']
          }
        }
      })

      let removedCount = 0
      for (const achievement of starRankAchievements) {
        if (achievement.criteriaValue !== user.currentRank) {
          const result = await prisma.userAchievement.deleteMany({
            where: {
              userId,
              achievementId: achievement.id
            }
          })
          
          if (result.count > 0) {
            removedCount++
          }
        }
      }
      
      console.log(`   ✅ Removed ${removedCount} temporary achievement(s)`)
      
    } catch (error) {
      console.error(`⚠️ Error removing star rank achievements:`, error)
    }
  }

  /**
   * 🔥 FIXED: Verify and unlock missing achievements
   */
  static async verifyAndUnlockMissingAchievements(userId: string): Promise<number> {
    try {
      console.log(`🔍 Verifying achievements for user ${userId}`)
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalXP: true,
          currentRank: true,
          highestRankEver: true
        }
      })

      if (!user) {
        console.error(`User ${userId} not found`)
        return 0
      }

      console.log(`   User XP: ${user.totalXP}, Current Rank: ${user.currentRank}`)

      let unlockedCount = 0

      // Get base rank from XP
      const baseRank = getBaseRankByXP(user.totalXP)
      const baseRankOrder = getRankInfo(baseRank).order

      console.log(`   Base rank: ${baseRank} (order ${baseRankOrder})`)

      // 🔥 FIX: Check all sequential rank achievements up to base rank
      for (let order = 1; order <= baseRankOrder; order++) {
        const rankEntry = Object.entries(RANK_INFO_MAP).find(
          ([_, info]: [string, any]) => info.order === order
        )

        if (rankEntry) {
          const rank = rankEntry[0] as PNPRank
          const rankInfo = getRankInfo(rank)
          
          console.log(`   Checking rank: ${rank} (XP: ${rankInfo.minXP})`)
          
          // 🔥 FIX: Search by RANK CODE, not XP
          const achievement = await prisma.achievement.findFirst({
            where: {
              type: 'rank',
              code: {
                contains: rank.toLowerCase().replace('p', '-p')  // e.g., "Pat" → "rank-pat"
              }
            }
          })

          if (!achievement) {
            console.log(`   ⚠️ No achievement found for rank: ${rank}`)
            continue
          }

          console.log(`   Found achievement: ${achievement.name} (${achievement.code})`)

          // Check if already unlocked
          const alreadyUnlocked = await prisma.userAchievement.findUnique({
            where: {
              userId_achievementId: {
                userId,
                achievementId: achievement.id
              }
            }
          })

          if (alreadyUnlocked) {
            console.log(`   ✓ Already unlocked: ${achievement.name}`)
            continue
          }

          // Check if user qualifies
          if (user.totalXP >= (rankInfo.minXP || 0)) {
            console.log(`   🎉 Unlocking: ${achievement.name}`)
            
            // Award the achievement
            await prisma.userAchievement.create({
              data: {
                userId,
                achievementId: achievement.id,
                xpAwarded: achievement.xpReward
              }
            })

            // Award XP if applicable
            if (achievement.xpReward > 0) {
              await prisma.user.update({
                where: { id: userId },
                data: {
                  totalXP: {
                    increment: achievement.xpReward
                  }
                }
              })
            }

            unlockedCount++
            console.log(`   ✅ Unlocked: ${achievement.name} (+${achievement.xpReward} XP)`)
          } else {
            console.log(`   ⏳ Not yet qualified: needs ${rankInfo.minXP}, has ${user.totalXP}`)
          }
        }
      }

      // Check star rank achievement (if applicable)
      if (isStarRank(user.currentRank as PNPRank)) {
        console.log(`   ⭐ Checking star rank: ${user.currentRank}`)
        
        const starAchievement = await prisma.achievement.findFirst({
          where: {
            type: 'star_rank',
            code: {
              contains: (user.currentRank as string).toLowerCase()
            }
          }
        })

        if (starAchievement) {
          const alreadyUnlocked = await prisma.userAchievement.findUnique({
            where: {
              userId_achievementId: {
                userId,
                achievementId: starAchievement.id
              }
            }
          })

          if (!alreadyUnlocked) {
            await prisma.userAchievement.create({
              data: {
                userId,
                achievementId: starAchievement.id,
                xpAwarded: starAchievement.xpReward
              }
            })

            if (starAchievement.xpReward > 0) {
              await prisma.user.update({
                where: { id: userId },
                data: {
                  totalXP: {
                    increment: starAchievement.xpReward
                  }
                }
              })
            }

            unlockedCount++
            console.log(`   ✅ Unlocked star achievement: ${starAchievement.name}`)
          }
        }
      }

      console.log(`✅ Verification complete. Unlocked ${unlockedCount} missing achievements`)
      return unlockedCount

    } catch (error) {
      console.error('❌ Error verifying achievements:', error)
      return 0
    }
  }

  // ... rest of the methods remain the same
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
}

// Helper map
const RANK_INFO_MAP = {
  'Cadet': getRankInfo('Cadet'),
  'Pat': getRankInfo('Pat'),
  'PCpl': getRankInfo('PCpl'),
  'PSSg': getRankInfo('PSSg'),
  'PMSg': getRankInfo('PMSg'),
  'PSMS': getRankInfo('PSMS'),
  'PCMS': getRankInfo('PCMS'),
  'PEMS': getRankInfo('PEMS'),
  'PLT': getRankInfo('PLT'),
  'PCPT': getRankInfo('PCPT'),
  'PMAJ': getRankInfo('PMAJ'),
  'PLTCOL': getRankInfo('PLTCOL'),
  'PCOL': getRankInfo('PCOL'),
  'PBGEN': getRankInfo('PBGEN'),
  'PMGEN': getRankInfo('PMGEN'),
  'PLTGEN': getRankInfo('PLTGEN'),
  'PGEN': getRankInfo('PGEN')
}