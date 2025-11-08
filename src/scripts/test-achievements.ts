// scripts/test-achievements.ts
// Run this script to test the achievement system
// Usage: npx tsx scripts/test-achievements.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAchievementSystem() {
  console.log('🧪 Testing Achievement System\n')

  try {
    // 1. Find or create a test user
    console.log('1️⃣ Setting up test user...')
    
    let testUser = await prisma.user.findFirst({
      where: {
        email: 'test@example.com'
      }
    })

    if (!testUser) {
      console.log('   Creating test user...')
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          currentRank: 'Cadet',
          totalXP: 0,
          level: 1,
          status: 'active'
        }
      })
      console.log('   ✅ Test user created')
    } else {
      console.log('   ✅ Test user found')
      // Reset XP for fresh test
      await prisma.user.update({
        where: { id: testUser.id },
        data: { totalXP: 0, currentRank: 'Cadet' }
      })
      console.log('   🔄 Reset XP to 0')
    }

    const userId = testUser.id
    console.log(`   User ID: ${userId}\n`)

    // 2. Check existing achievements
    console.log('2️⃣ Checking achievements in database...')
    const achievements = await prisma.achievement.findMany({
      where: { type: 'rank', isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 5
    })
    console.log(`   ✅ Found ${achievements.length} rank achievements`)
    achievements.forEach(a => {
      console.log(`      - ${a.name} (${a.criteriaValue} XP)`)
    })
    console.log('')

    // 3. Test XP Award → Achievement Unlock
    console.log('3️⃣ Testing automatic achievement unlock...')
    
    // Award 100 XP (should unlock Patrolman)
    console.log('   Awarding 100 XP...')
    await prisma.user.update({
      where: { id: userId },
      data: { totalXP: 100 }
    })

    // Import and run verification
    const { RankCalculator } = await import('../lib/rank-calculator')
    const unlockedCount = await RankCalculator.verifyAndUnlockMissingAchievements(userId)
    
    console.log(`   ✅ Unlocked ${unlockedCount} achievement(s)`)

    // Check what was unlocked
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true }
    })

    console.log('   📋 User now has:')
    userAchievements.forEach(ua => {
      console.log(`      ✓ ${ua.achievement.name}`)
    })
    console.log('')

    // 4. Test higher XP level
    console.log('4️⃣ Testing multiple achievements at once...')
    console.log('   Awarding 500 XP total (should unlock Pat, PCpl, PSSg)...')
    
    await prisma.user.update({
      where: { id: userId },
      data: { totalXP: 500 }
    })

    const unlockedCount2 = await RankCalculator.verifyAndUnlockMissingAchievements(userId)
    console.log(`   ✅ Unlocked ${unlockedCount2} additional achievement(s)`)

    const userAchievements2 = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true }
    })

    console.log('   📋 User now has:')
    userAchievements2.forEach(ua => {
      console.log(`      ✓ ${ua.achievement.name}`)
    })
    console.log('')

    // 5. Test profile achievements
    console.log('5️⃣ Testing profile achievements...')
    
    // Update name
    await prisma.user.update({
      where: { id: userId },
      data: { name: 'Test User Updated' }
    })

    const { checkAndAwardAchievements } = await import('../lib/achievement-checker')
    const profileResult = await checkAndAwardAchievements(
      userId,
      'profile_update',
      { updatedFields: ['name'] }
    )

    console.log(`   ✅ Profile update checked: ${profileResult.newAchievements.length} new achievements`)
    if (profileResult.newAchievements.length > 0) {
      profileResult.newAchievements.forEach(ua => {
        console.log(`      ✓ ${ua.achievement.name} (+${ua.xpAwarded} XP)`)
      })
    }
    console.log('')

    // 6. Summary
    console.log('6️⃣ Final Summary')
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        totalXP: true,
        currentRank: true,
        achievementsEarned: {
          include: { achievement: true }
        }
      }
    })

    if (finalUser) {
      console.log(`   User: ${finalUser.name}`)
      console.log(`   Total XP: ${finalUser.totalXP}`)
      console.log(`   Current Rank: ${finalUser.currentRank}`)
      console.log(`   Achievements Unlocked: ${finalUser.achievementsEarned.length}`)
      console.log('')
      console.log('   Achievement List:')
      finalUser.achievementsEarned.forEach((ua, index) => {
        console.log(`      ${index + 1}. ${ua.achievement.name} (${ua.achievement.category})`)
      })
    }

    console.log('\n✅ All tests completed!\n')

    // 7. Cleanup instructions
    console.log('🧹 To clean up test data:')
    console.log(`   npx prisma studio`)
    console.log(`   Or manually delete user: ${userId}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run tests
testAchievementSystem()
  .then(() => {
    console.log('🎉 Test script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test script failed:', error)
    process.exit(1)
  })

/*
===========================================
HOW TO RUN THIS SCRIPT
===========================================

1. Install tsx (if not already installed):
   npm install -D tsx

2. Run the test script:
   npx tsx scripts/test-achievements.ts

3. Check the output for:
   ✅ Achievement unlocking working
   ✅ Multiple achievements unlocking at once
   ✅ Profile achievements working
   ✅ Final summary showing all unlocked

4. If errors occur, check:
   - Database connection
   - Achievement seeding (run: npx prisma db seed)
   - Prisma schema is up to date
   - All required files are in place

===========================================
EXPECTED OUTPUT
===========================================

🧪 Testing Achievement System

1️⃣ Setting up test user...
   ✅ Test user found
   🔄 Reset XP to 0
   User ID: abc123...

2️⃣ Checking achievements in database...
   ✅ Found 5 rank achievements
      - Patrolman (100 XP)
      - Police Corporal (250 XP)
      - Police Staff Sergeant (500 XP)
      - Police Master Sergeant (800 XP)
      - Police Senior Master Sergeant (1200 XP)

3️⃣ Testing automatic achievement unlock...
   Awarding 100 XP...
   ✅ Unlocked 1 achievement(s)
   📋 User now has:
      ✓ Patrolman

4️⃣ Testing multiple achievements at once...
   Awarding 500 XP total (should unlock Pat, PCpl, PSSg)...
   ✅ Unlocked 2 additional achievement(s)
   📋 User now has:
      ✓ Patrolman
      ✓ Police Corporal
      ✓ Police Staff Sergeant

5️⃣ Testing profile achievements...
   ✅ Profile update checked: 1 new achievements
      ✓ Identity Established (+50 XP)

6️⃣ Final Summary
   User: Test User Updated
   Total XP: 550
   Current Rank: PSSg
   Achievements Unlocked: 4

   Achievement List:
      1. Patrolman (Rank Promotions)
      2. Police Corporal (Rank Promotions)
      3. Police Staff Sergeant (Rank Promotions)
      4. Identity Established (Profile)

✅ All tests completed!

===========================================
*/