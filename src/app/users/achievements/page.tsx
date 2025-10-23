// app/users/achievements/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Loader2, Award, Camera, Star, User } from 'lucide-react';
import Image from 'next/image';
import { RANK_INFO } from '@/lib/rank-config';
import { PNPRank } from '@/types/rank';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string | React.ReactNode;
  type: 'rank' | 'special';
  category: string;
  isUnlocked: boolean;
  currentProgress: number;
  targetProgress: number;
  unlockedAt?: Date;
  rank?: PNPRank;
  level?: number;
}

// Extended user type for type safety
interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  rank?: string;
  totalXP?: number;
  badges?: Array<any>;
}

export default function AchievementsPage() {
  const { user: baseUser, isLoading } = useCurrentUser();
  const user = baseUser as ExtendedUser;
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Achievements');

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;

      const allAchievements: Achievement[] = [];
      const currentRank = (user.rank as PNPRank) || 'Cadet';
      const currentRankOrder = RANK_INFO[currentRank].order;

      let rankLevel = 1;
      // Add ALL rank achievements EXCEPT Cadet
      Object.entries(RANK_INFO).forEach(([rankCode, rankInfo]) => {
        // Skip Cadet as it's the default starting rank
        if (rankCode === 'Cadet') {
          return;
        }

        const isUnlocked = rankInfo.order <= currentRankOrder;
        allAchievements.push({
          id: `rank-${rankCode}`,
          name: `Promoted to ${rankInfo.shortName}`,
          description: `Reach ${rankInfo.name} rank`,
          icon: rankInfo.icon,
          type: 'rank',
          category: 'Rank Promotions',
          isUnlocked,
          currentProgress: isUnlocked ? (rankInfo as any).requiredXP : (user.totalXP || 0),
          targetProgress: (rankInfo as any).requiredXP,
          unlockedAt: isUnlocked ? new Date() : undefined,
          rank: rankCode as PNPRank,
          level: rankLevel++,
        });
      });

      // Add special achievements
      const hasUsername = user.name ? true : false;
      const hasProfilePicture = user.image ? true : false;
      const totalBadges = user.badges?.length || 0;
      
      // Username achievement
      allAchievements.push({
        id: 'set-username',
        name: 'Identity Established',
        description: 'Set your username',
        icon: <User className="w-8 h-8 text-white" />,
        type: 'special',
        category: 'Profile',
        isUnlocked: hasUsername,
        currentProgress: hasUsername ? 1 : 0,
        targetProgress: 1,
        unlockedAt: hasUsername ? new Date() : undefined,
        level: 1,
      });

      // Photogenic achievement
      allAchievements.push({
        id: 'photogenic',
        name: 'Photogenic',
        description: 'Add a profile picture',
        icon: <Camera className="w-8 h-8 text-white" />,
        type: 'special',
        category: 'Profile',
        isUnlocked: hasProfilePicture,
        currentProgress: hasProfilePicture ? 1 : 0,
        targetProgress: 1,
        unlockedAt: hasProfilePicture ? new Date() : undefined,
        level: 2,
      });

      // Badge collector achievements
      allAchievements.push({
        id: 'badge-collector-5',
        name: 'Badge Collector',
        description: 'Earn 5 badges',
        icon: <Award className="w-8 h-8 text-white" />,
        type: 'special',
        category: 'Badges',
        isUnlocked: totalBadges >= 5,
        currentProgress: totalBadges,
        targetProgress: 5,
        unlockedAt: totalBadges >= 5 ? new Date() : undefined,
        level: 1,
      });

      allAchievements.push({
        id: 'badge-collector-10',
        name: 'Badge Master',
        description: 'Earn 10 badges',
        icon: <Award className="w-8 h-8 text-white" />,
        type: 'special',
        category: 'Badges',
        isUnlocked: totalBadges >= 10,
        currentProgress: totalBadges,
        targetProgress: 10,
        unlockedAt: totalBadges >= 10 ? new Date() : undefined,
        level: 2,
      });

      allAchievements.push({
        id: 'badge-collector-all',
        name: 'Badge Legend',
        description: 'Earn all badges',
        icon: <Star className="w-8 h-8 text-white" />,
        type: 'special',
        category: 'Badges',
        isUnlocked: totalBadges >= 50,
        currentProgress: totalBadges,
        targetProgress: 50,
        unlockedAt: totalBadges >= 50 ? new Date() : undefined,
        level: 3,
      });

      setAchievements(allAchievements);
      setLoadingAchievements(false);
    };

    if (user) {
      fetchAchievements();
    }
  }, [user]);

  if (isLoading || loadingAchievements) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-4 md:px-20 py-6">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  const categories = ['All Achievements', ...new Set(achievements.map(a => a.category))];
  const filteredAchievements = selectedCategory === 'All Achievements' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Achievements
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unlockedCount} of {totalCount} unlocked ({completionPercentage}% complete)
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors text-sm ${
                selectedCategory === category
                  ? 'bg-yellow-500 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                achievement.isUnlocked
                  ? 'border-green-400 dark:border-green-600'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Lock/Unlock Badge - Top Right */}
              <div className="flex justify-end mb-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <Image
                    src={achievement.isUnlocked ? "/unlocked-badge.png" : "/locked-badge.png"}
                    alt={achievement.isUnlocked ? "Unlocked" : "Locked"}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Achievement Icon - Centered */}
              <div className="flex justify-center mb-4">
                {achievement.type === 'rank' ? (
                  <div className={`w-20 h-20 rounded-xl border-2 p-3 flex items-center justify-center overflow-hidden ${
                    achievement.isUnlocked 
                      ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="relative w-full h-full">
                      <Image
                        src={achievement.icon as string}
                        alt={achievement.name}
                        fill
                        className={`object-contain ${!achievement.isUnlocked ? 'opacity-40 grayscale' : ''}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center ${
                    achievement.isUnlocked
                      ? 'bg-gradient-to-br from-purple-400 to-pink-500 border-gray-200 dark:border-gray-600'
                      : 'bg-gray-300 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className={!achievement.isUnlocked ? 'opacity-40' : ''}>
                      {achievement.icon}
                    </div>
                  </div>
                )}
              </div>

              {/* Achievement Info */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {achievement.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No achievements found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}