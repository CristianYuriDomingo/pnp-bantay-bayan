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
    // SEQUENTIAL RANK ACHIEVEMENTS (NO XP)
    // Pat → PLTCOL - XP-based, never lost
    // ==========================================
    {
      code: 'rank-pat',
      name: 'Patrolman',
      description: 'Reach Patrolman rank',
      icon: '/ranks/Pat.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 0,
      criteriaType: 'xp_threshold',
      criteriaValue: '100',
      sortOrder: 10,
    },
    {
      code: 'rank-pcpl',
      name: 'Police Corporal',
      description: 'Reach Police Corporal rank',
      icon: '/ranks/PCpl.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 0,
      criteriaType: 'xp_threshold',
      criteriaValue: '250',
      sortOrder: 11,
    },
    {
      code: 'rank-pssg',
      name: 'Police Staff Sergeant',
      description: 'Reach Police Staff Sergeant rank',
      icon: '/ranks/PSSg.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 0,
      criteriaType: 'xp_threshold',
      criteriaValue: '500',
      sortOrder: 12,
    },
    {
      code: 'rank-pmsg',
      name: 'Police Master Sergeant',
      description: 'Reach Police Master Sergeant rank',
      icon: '/ranks/PMSg.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 0,
      criteriaType: 'xp_threshold',
      criteriaValue: '800',
      sortOrder: 13,
    },
    {
      code: 'rank-psms',
      name: 'Police Senior Master Sergeant',
      description: 'Reach Police Senior Master Sergeant rank',
      icon: '/ranks/PSMS.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 0,
      criteriaType: 'xp_threshold',
      criteriaValue: '1200',
      sortOrder: 14,
    },
    {
      code: 'rank-pcms',
      name: 'Police Chief Master Sergeant',
      description: 'Reach Police Chief Master Sergeant rank',
      icon: '/ranks/PCMS.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 0,
      criteriaType: 'xp_threshold',
      criteriaValue: '1600',
      sortOrder: 15,
    },
    {
      code: 'rank-pems',
      name: 'Police Executive Master Sergeant',
      description: 'Reach Police Executive Master Sergeant rank',
      icon: '/ranks/PEMS.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 0,
      criteriaType: 'xp_threshold',
      criteriaValue: '2000',
      sortOrder: 16,
    },
    {
      code: 'rank-plt',
      name: 'Police Lieutenant',
      description: 'Reach Police Lieutenant rank',
      icon: '/ranks/PLT.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 0,
      criteriaType: 'xp_threshold',
      criteriaValue: '2400',
      sortOrder: 17,
    },
    {
      code: 'rank-pcpt',
      name: 'Police Captain',
      description: 'Reach Police Captain rank',
      icon: '/ranks/PCPT.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 0,
      criteriaType: 'xp_threshold',
      criteriaValue: '2800',
      sortOrder: 18,
    },
    {
      code: 'rank-pmaj',
      name: 'Police Major',
      description: 'Reach Police Major rank',
      icon: '/ranks/PMAJ.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 0,
      criteriaType: 'xp_threshold',
      criteriaValue: '3200',
      sortOrder: 19,
    },
    {
      code: 'rank-pltcol',
      name: 'Police Lieutenant Colonel',
      description: 'Reach Police Lieutenant Colonel rank',
      icon: '/ranks/PLTCOL.png',
      category: 'Rank Promotions',
      type: 'rank',
      xpReward: 0,
      criteriaType: 'xp_threshold',
      criteriaValue: '3500',
      sortOrder: 20,
    },

    // ==========================================
    // STAR RANK ACHIEVEMENTS (NO XP)
    // PCOL → PGEN - Competitive, can be lost
    // ==========================================
    {
      code: 'rank-pcol',
      name: 'Police Colonel',
      description: 'Reach Police Colonel rank - Maximum learning progression',
      icon: '/ranks/PCOL.png',
      category: 'Star Ranks',
      type: 'star_rank',
      xpReward: 0,
      criteriaType: 'competitive_rank',
      criteriaValue: 'PCOL',
      sortOrder: 21,
    },
    {
      code: 'rank-pbgen',
      name: 'Police Brigadier General ⭐',
      description: 'Achieve Brigadier General rank - Top 10% of officers',
      icon: '/ranks/PBGEN.png',
      category: 'Star Ranks',
      type: 'star_rank',
      xpReward: 0,
      criteriaType: 'competitive_rank',
      criteriaValue: 'PBGEN',
      sortOrder: 22,
    },
    {
      code: 'rank-pmgen',
      name: 'Police Major General ⭐⭐',
      description: 'Achieve Major General rank - Top 2% of officers',
      icon: '/ranks/PMGEN.png',
      category: 'Star Ranks',
      type: 'star_rank',
      xpReward: 0,
      criteriaType: 'competitive_rank',
      criteriaValue: 'PMGEN',
      sortOrder: 23,
    },
    {
      code: 'rank-pltgen',
      name: 'Police Lieutenant General ⭐⭐⭐',
      description: 'Achieve Lieutenant General rank - Deputy Chief (Top 3)',
      icon: '/ranks/PLTGEN.png',
      category: 'Star Ranks',
      type: 'star_rank',
      xpReward: 0,
      criteriaType: 'competitive_rank',
      criteriaValue: 'PLTGEN',
      sortOrder: 24,
    },
    {
      code: 'rank-pgen',
      name: 'Police General ⭐⭐⭐⭐',
      description: 'Achieve Police General rank - Chief of PNP (#1)',
      icon: '/ranks/PGEN.png',
      category: 'Star Ranks',
      type: 'star_rank',
      xpReward: 0,
      criteriaType: 'competitive_rank',
      criteriaValue: 'PGEN',
      sortOrder: 25,
    },

    // ==========================================
    // SPECIAL PERMANENT BADGES
    // These are NEVER lost, even after demotion
    // ==========================================
    {
      code: 'former-chief-pnp',
      name: 'Former Chief of PNP',
      description: 'Served as Police General - Chief of the Philippine National Police',
      icon: '/achievements/former-chief.png',
      category: 'Special Honors',
      type: 'special_achievement',
      xpReward: 0,
      criteriaType: 'special_badge',
      criteriaValue: 'reached_pgen',
      sortOrder: 50,
    },
    {
      code: 'former-deputy-chief-pnp',
      name: 'Former Deputy Chief of PNP',
      description: 'Served as Police Lieutenant General - Deputy Chief of PNP',
      icon: '/achievements/former-deputy.png',
      category: 'Special Honors',
      type: 'special_achievement',
      xpReward: 0,
      criteriaType: 'special_badge',
      criteriaValue: 'reached_pltgen',
      sortOrder: 51,
    },

    // ==========================================
    // DYNAMIC BADGE MILESTONE ACHIEVEMENTS (NO XP)
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
      criteriaValue: 'dynamic',
      criteriaData: { badgeType: 'learning' },
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
      criteriaValue: 'dynamic',
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
      criteriaValue: 'dynamic',
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
      criteriaValue: 'dynamic',
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
      criteriaValue: 'dynamic',
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
      criteriaValue: 'dynamic',
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
  console.log(`\n📋 Breakdown:`);
  console.log(`   - Profile: 2 (with XP)`);
  console.log(`   - Sequential Ranks: 11 (Pat → PLTCOL) - XP-based, PERMANENT`);
  console.log(`   - Star Ranks: 5 (PCOL → PGEN) - Competitive, can be lost`);
  console.log(`   - Special Honors: 2 (Former Chief/Deputy) - PERMANENT`);
  console.log(`   - Learning Badge Milestones: 3 (Starter/Master/Legend) - DYNAMIC`);
  console.log(`   - Quiz Badge Milestones: 3 (Starter/Master/Legend) - DYNAMIC`);
  console.log(`\n✨ Key Features:`);
  console.log(`   🎖️ Sequential ranks: Never skipped, all achievable`);
  console.log(`   ⭐ Star ranks: Competitive, top performers only`);
  console.log(`   👑 PGEN/PLTGEN: Get permanent honor badge even after demotion`);
  console.log(`   💯 All rank achievements have 0 XP (rank IS the reward)`);
}

seedAchievements()
  .catch((error) => {
    console.error('❌ Error seeding achievements:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });