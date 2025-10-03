// FILE: scripts/seed-quiz-badges.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// NOTE: This seed file creates GENERIC achievement badges only
// Actual quiz mastery badges (Epic) and parent master badges (Legendary)
// are created by admins via the Quiz Management UI for each specific quiz

const quizBadges = [
  // Achievement progression badges (manual trigger)
  {
    name: "Knowledge Seeker",
    description: "Complete 5 different quizzes",
    image: "/badges/knowledge-seeker.png",
    category: "Achievement",
    rarity: "Common",
    xpValue: 25,
    triggerType: "manual",
    triggerValue: "5_quizzes_completed",
    prerequisites: []
  },
  {
    name: "Quiz Enthusiast",
    description: "Complete 10 different quizzes",
    image: "/badges/quiz-enthusiast.png",
    category: "Achievement",
    rarity: "Rare",
    xpValue: 50,
    triggerType: "manual",
    triggerValue: "10_quizzes_completed",
    prerequisites: []
  },
  {
    name: "Master Student",
    description: "Achieve Gold or Perfect mastery on 3 different quizzes",
    image: "/badges/master-student.png",
    category: "Achievement",
    rarity: "Epic",
    xpValue: 75,
    triggerType: "manual",
    triggerValue: "3_masteries_achieved",
    prerequisites: []
  },
  {
    name: "Perfectionist",
    description: "Achieve Perfect mastery on 5 different quizzes",
    image: "/badges/perfectionist.png",
    category: "Achievement",
    rarity: "Legendary",
    xpValue: 100,
    triggerType: "manual",
    triggerValue: "5_perfect_masteries",
    prerequisites: []
  },
  {
    name: "Quiz Legend",
    description: "Complete all available quizzes with Gold or Perfect mastery",
    image: "/badges/quiz-legend.png",
    category: "Achievement",
    rarity: "Legendary",
    xpValue: 150,
    triggerType: "manual",
    triggerValue: "all_quizzes_mastered",
    prerequisites: []
  }
];

async function seedQuizBadges() {
  console.log('Starting quiz badge seeding...');
  console.log('Note: This only seeds generic achievement badges.');
  console.log('Quiz-specific mastery badges are created via Admin UI.\n');

  try {
    for (const badgeData of quizBadges) {
      const existingBadge = await prisma.badge.findFirst({
        where: {
          name: badgeData.name
        }
      });

      if (!existingBadge) {
        const badge = await prisma.badge.create({
          data: badgeData
        });
        console.log(`✅ Created badge: ${badge.name} (${badge.rarity}, ${badge.xpValue} XP)`);
      } else {
        console.log(`⏭️  Badge already exists: ${badgeData.name}`);
      }
    }

    console.log('\n🎉 Quiz badge seeding completed successfully!');

    // Display some stats
    const totalBadges = await prisma.badge.count();
    const achievementBadges = await prisma.badge.count({
      where: { category: 'Achievement' }
    });
    const quizMasteryBadges = await prisma.badge.count({
      where: { triggerType: 'quiz_mastery' }
    });
    const parentMasteryBadges = await prisma.badge.count({
      where: { triggerType: 'parent_quiz_mastery' }
    });

    console.log('\n📊 Badge Statistics:');
    console.log(`   Total badges: ${totalBadges}`);
    console.log(`   Achievement badges: ${achievementBadges}`);
    console.log(`   Quiz mastery badges (Epic): ${quizMasteryBadges}`);
    console.log(`   Parent master badges (Legendary): ${parentMasteryBadges}`);

  } catch (error) {
    console.error('❌ Error seeding quiz badges:', error);
    throw error;
  }
}

async function main() {
  await seedQuizBadges();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });