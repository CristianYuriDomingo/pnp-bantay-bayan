// prisma/seed-achievements.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAchievements() {
  console.log('🌱 Starting achievement seeding...');

  const achievements = [
    // ==========================================
    // PROFILE ACHIEVEMENTS (WITH XP)
    // ==========================================
    {
      code: 'identity-established',
      name: 'Identity Established',
      description: 'Set your username',
      icon: '/achievements/identity-established.png',
      category: 'Profile',
      type: 'profile',
      xpReward: 50,
      criteriaType: 'profile_field',
      criteriaValue: 'name',
      sortOrder: 1,
    },
    {
      code: 'face-of-justice',
      name: 'Face of Justice',
      description: 'Upload a profile picture',
      icon: '/achievements/face-of-justice.png',
      category: 'Profile',
      type: 'profile',
      xpReward: 50,
      criteriaType: 'profile_field',
      criteriaValue: 'image',
      sortOrder: 2,
    },

    // ==========================================
    // RANK ACHIEVEMENTS (WITH XP)
    // ==========================================
    {
      code: 'rank-pat',
      name: 'Patrolman',
      description: 'Reach Patrolman rank',
      icon: '/ranks/Pat.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 50,
      criteriaType: 'rank_achieved',
      criteriaValue: 'Pat',
      sortOrder: 10,
    },
    {
      code: 'rank-pcpl',
      name: 'Police Corporal',
      description: 'Reach Police Corporal rank',
      icon: '/ranks/PCpl.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 100,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PCpl',
      sortOrder: 11,
    },
    {
      code: 'rank-pssg',
      name: 'Police Staff Sergeant',
      description: 'Reach Police Staff Sergeant rank',
      icon: '/ranks/PSSg.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 150,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PSSg',
      sortOrder: 12,
    },
    {
      code: 'rank-pmsg',
      name: 'Police Master Sergeant',
      description: 'Reach Police Master Sergeant rank',
      icon: '/ranks/PMSg.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 200,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PMSg',
      sortOrder: 13,
    },
    {
      code: 'rank-psms',
      name: 'Police Senior Master Sergeant',
      description: 'Reach Police Senior Master Sergeant rank',
      icon: '/ranks/PSMS.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 300,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PSMS',
      sortOrder: 14,
    },
    {
      code: 'rank-pcms',
      name: 'Police Chief Master Sergeant',
      description: 'Reach Police Chief Master Sergeant rank',
      icon: '/ranks/PCMS.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 400,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PCMS',
      sortOrder: 15,
    },
    {
      code: 'rank-pems',
      name: 'Police Executive Master Sergeant',
      description: 'Reach Police Executive Master Sergeant rank',
      icon: '/ranks/PEMS.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 500,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PEMS',
      sortOrder: 16,
    },
    {
      code: 'rank-plt',
      name: 'Police Lieutenant',
      description: 'Reach Police Lieutenant rank',
      icon: '/ranks/PLT.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 750,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PLT',
      sortOrder: 17,
    },
    {
      code: 'rank-pcpt',
      name: 'Police Captain',
      description: 'Reach Police Captain rank',
      icon: '/ranks/PCPT.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 1000,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PCPT',
      sortOrder: 18,
    },
    {
      code: 'rank-pmaj',
      name: 'Police Major',
      description: 'Reach Police Major rank',
      icon: '/ranks/PMAJ.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 1500,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PMAJ',
      sortOrder: 19,
    },
    {
      code: 'rank-pltcol',
      name: 'Police Lieutenant Colonel',
      description: 'Reach Police Lieutenant Colonel rank',
      icon: '/ranks/PLTCOL.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 2000,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PLTCOL',
      sortOrder: 20,
    },
    {
      code: 'rank-pcol',
      name: 'Police Colonel',
      description: 'Reach Police Colonel rank',
      icon: '/ranks/PCOL.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 3000,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PCOL',
      sortOrder: 21,
    },
    {
      code: 'rank-pbgen',
      name: 'Police Brigadier General',
      description: 'Reach Police Brigadier General rank',
      icon: '/ranks/PBGEN.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 4000,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PBGEN',
      sortOrder: 22,
    },
    {
      code: 'rank-pmgen',
      name: 'Police Major General',
      description: 'Reach Police Major General rank',
      icon: '/ranks/PMGEN.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 5000,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PMGEN',
      sortOrder: 23,
    },
    {
      code: 'rank-pltgen',
      name: 'Police Lieutenant General',
      description: 'Reach Police Lieutenant General rank',
      icon: '/ranks/PLTGEN.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 7500,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PLTGEN',
      sortOrder: 24,
    },
    {
      code: 'rank-pgen',
      name: 'Police General',
      description: 'Reach Police General rank - The highest honor',
      icon: '/ranks/PGEN.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 10000,
      criteriaType: 'rank_achieved',
      criteriaValue: 'PGEN',
      sortOrder: 25,
    },

    // ==========================================
    // 🔥 DYNAMIC BADGE MILESTONE ACHIEVEMENTS (NO XP)
    // criteriaData is optional - system detects from code/name
    // ==========================================
    
    // Learning Badge Achievements
    {
      code: 'learning-starter',
      name: 'Learning Starter',
      description: 'Earn your first learning badge',
      icon: '/achievements/learning-starter.png',
      category: 'Learning Badges',
      type: 'badge_milestone',
      xpReward: 0,
      criteriaType: 'badge_count',
      criteriaValue: 'dynamic', // System detects: 1 badge
      criteriaData: { badgeType: 'learning' }, // Optional hint
      sortOrder: 30,
    },
    {
      code: 'learning-master',
      name: 'Learning Master',
      description: 'Earn half of all learning badges',
      icon: '/achievements/learning-master.png',
      category: 'Learning Badges',
      type: 'badge_milestone',
      xpReward: 0,
      criteriaType: 'badge_count',
      criteriaValue: 'dynamic', // System detects: 50% of total
      criteriaData: { badgeType: 'learning' },
      sortOrder: 31,
    },
    {
      code: 'learning-legend',
      name: 'Learning Legend',
      description: 'Earn all learning badges',
      icon: '/achievements/learning-legend.png',
      category: 'Learning Badges',
      type: 'badge_milestone',
      xpReward: 0,
      criteriaType: 'badge_count',
      criteriaValue: 'dynamic', // System detects: 100% of total
      criteriaData: { badgeType: 'learning' },
      sortOrder: 32,
    },

    // Quiz Badge Achievements
    {
      code: 'quiz-starter',
      name: 'Quiz Starter',
      description: 'Earn your first quiz mastery badge',
      icon: '/achievements/quiz-starter.png',
      category: 'Learning Badges',
      type: 'badge_milestone',
      xpReward: 0,
      criteriaType: 'badge_count',
      criteriaValue: 'dynamic', // System detects: 1 badge
      criteriaData: { badgeType: 'quiz' },
      sortOrder: 33,
    },
    {
      code: 'quiz-master',
      name: 'Quiz Master',
      description: 'Earn half of all quiz mastery badges',
      icon: '/achievements/quiz-master.png',
      category: 'Learning Badges',
      type: 'badge_milestone',
      xpReward: 0,
      criteriaType: 'badge_count',
      criteriaValue: 'dynamic', // System detects: 50% of total
      criteriaData: { badgeType: 'quiz' },
      sortOrder: 34,
    },
    {
      code: 'quiz-legend',
      name: 'Quiz Legend',
      description: 'Earn all quiz mastery badges',
      icon: '/achievements/quiz-legend.png',
      category: 'Learning Badges',
      type: 'badge_milestone',
      xpReward: 0,
      criteriaType: 'badge_count',
      criteriaValue: 'dynamic', // System detects: 100% of total
      criteriaData: { badgeType: 'quiz' },
      sortOrder: 35,
    },
  ];

  // Delete existing achievements (optional - for clean slate)
  await prisma.achievement.deleteMany({});
  console.log('🗑️  Cleared existing achievements');

  // Create achievements
  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement as any,
    });
    console.log(`✅ Created achievement: ${achievement.name}`);
  }

  console.log('🎉 Achievement seeding completed!');
  console.log(`📊 Total achievements created: ${achievements.length}`);
  console.log(`   - Profile: 2 (with XP)`);
  console.log(`   - Rank: 16 (with XP) - Pat to PGEN`);
  console.log(`   - Learning Badge Milestones: 3 (Starter/Master/Legend) - DYNAMIC`);
  console.log(`   - Quiz Badge Milestones: 3 (Starter/Master/Legend) - DYNAMIC`);
  console.log(`\n💡 Badge milestone achievements are now FULLY DYNAMIC:`);
  console.log(`   - Starter: Unlocks at 1 badge`);
  console.log(`   - Master: Unlocks at 50% of total badges`);
  console.log(`   - Legend: Unlocks at 100% of total badges`);
  console.log(`   ✨ Automatically adjusts when admin adds/removes badges!`);
}

seedAchievements()
  .catch((error) => {
    console.error('❌ Error seeding achievements:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });