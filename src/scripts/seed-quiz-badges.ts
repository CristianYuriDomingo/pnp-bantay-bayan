// FILE 6: scripts/seed-quiz-badges.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const quizBadges = [
  // Generic quiz mastery badges
  {
    name: "Quiz Novice",
    description: "Complete your first quiz with Bronze mastery",
    image: "/badges/quiz-novice.png",
    category: "Quiz Mastery",
    rarity: "Common",
    triggerType: "quiz_mastery_bronze",
    triggerValue: "any", // This would apply to any quiz
    prerequisites: []
  },
  {
    name: "Silver Scholar",
    description: "Achieve Silver mastery on any quiz",
    image: "/badges/silver-scholar.png",
    category: "Quiz Mastery",
    rarity: "Rare",
    triggerType: "quiz_mastery_silver",
    triggerValue: "any",
    prerequisites: []
  },
  {
    name: "Gold Champion",
    description: "Achieve Gold mastery on any quiz",
    image: "/badges/gold-champion.png",
    category: "Quiz Mastery",
    rarity: "Epic",
    triggerType: "quiz_mastery_gold",
    triggerValue: "any",
    prerequisites: []
  },
  {
    name: "Perfect Master",
    description: "Achieve Perfect mastery on any quiz",
    image: "/badges/perfect-master.png",
    category: "Quiz Mastery",
    rarity: "Legendary",
    triggerType: "quiz_perfect",
    triggerValue: "any",
    prerequisites: []
  },

  // Subject-specific badges (you'll need to replace quiz IDs with actual ones)
  {
    name: "Cyber Security Expert",
    description: "Master the Cyber Security quiz with Gold level",
    image: "/badges/cyber-security-expert.png",
    category: "Cyber Security",
    rarity: "Epic",
    triggerType: "quiz_mastery_gold",
    triggerValue: "CYBER_SECURITY_QUIZ_ID", // Replace with actual quiz ID
    prerequisites: []
  },
  {
    name: "Crime Prevention Specialist",
    description: "Achieve Perfect mastery in Crime Prevention",
    image: "/badges/crime-prevention-specialist.png",
    category: "Crime Prevention",
    rarity: "Legendary",
    triggerType: "quiz_perfect",
    triggerValue: "CRIME_PREVENTION_QUIZ_ID", // Replace with actual quiz ID
    prerequisites: []
  },
  {
    name: "Emergency Response Hero",
    description: "Master Emergency Preparedness with Silver level",
    image: "/badges/emergency-hero.png",
    category: "Emergency Preparedness",
    rarity: "Rare",
    triggerType: "quiz_mastery_silver",
    triggerValue: "EMERGENCY_QUIZ_ID", // Replace with actual quiz ID
    prerequisites: []
  },

  // Achievement progression badges
  {
    name: "Knowledge Seeker",
    description: "Complete 5 different quizzes",
    image: "/badges/knowledge-seeker.png",
    category: "Achievement",
    rarity: "Common",
    triggerType: "manual", // This would be triggered by custom logic
    triggerValue: "5_quizzes_completed",
    prerequisites: []
  },
  {
    name: "Quiz Master",
    description: "Achieve mastery on 3 different quizzes",
    image: "/badges/quiz-master.png",
    category: "Achievement",
    rarity: "Epic",
    triggerType: "manual",
    triggerValue: "3_masteries_achieved",
    prerequisites: []
  },
  {
    name: "Perfectionist",
    description: "Achieve Perfect mastery on 2 different quizzes",
    image: "/badges/perfectionist.png",
    category: "Achievement",
    rarity: "Legendary",
    triggerType: "manual",
    triggerValue: "2_perfect_masteries",
    prerequisites: []
  }
];

async function seedQuizBadges() {
  console.log('Starting quiz badge seeding...');

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
        console.log(`✅ Created badge: ${badge.name}`);
      } else {
        console.log(`⏭️  Badge already exists: ${badgeData.name}`);
      }
    }

    console.log('🎉 Quiz badge seeding completed successfully!');

    // Display some stats
    const totalBadges = await prisma.badge.count();
    const quizBadgeCount = await prisma.badge.count({
      where: {
        OR: [
          { category: 'Quiz Mastery' },
          { category: 'Achievement' },
          { triggerType: { contains: 'quiz_' } }
        ]
      }
    });

    console.log(`📊 Total badges in system: ${totalBadges}`);
    console.log(`🎯 Quiz-related badges: ${quizBadgeCount}`);

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

