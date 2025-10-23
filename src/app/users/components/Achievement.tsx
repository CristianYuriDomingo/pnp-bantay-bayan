// app/users/components/Achievement.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Loader2, Camera, Award, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { RANK_INFO, getNextRank } from '@/lib/rank-config';
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

const AchievementsUI = () => {
  const { user: baseUser, isLoading } = useCurrentUser();
  const user = baseUser as ExtendedUser;
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;

      const allAchievements: Achievement[] = [];

      // 1. Get ONE next rank achievement
      const currentRank = (user.rank as PNPRank) || 'Cadet';
      let nextRank = getNextRank(currentRank);
      
      // Skip Cadet if it's the next rank
      if (nextRank === 'Cadet') {
        nextRank = getNextRank(nextRank);
      }
      
      if (nextRank) {
        const rankInfo = RANK_INFO[nextRank];
        allAchievements.push({
          id: `rank-${rankInfo.code}`,
          name: `Promoted to ${rankInfo.shortName}`,
          description: `Reach ${rankInfo.name} rank`,
          icon: rankInfo.icon,
          type: 'rank',
          category: 'Rank Promotions',
          isUnlocked: false,
          currentProgress: user.totalXP || 0,
          targetProgress: (rankInfo as any).requiredXP,
          rank: nextRank,
          level: 1,
        });
      }

      // 2. Get ONE profile achievement (prioritize uncompleted ones)
      const hasUsername = user.name ? true : false;
      const hasProfilePicture = user.image ? true : false;
      
      // Always show at least one profile achievement
      if (!hasUsername) {
        allAchievements.push({
          id: 'set-username',
          name: 'Identity Established',
          description: 'Set your username',
          icon: <User className="w-8 h-8 text-white" />,
          type: 'special',
          category: 'Profile',
          isUnlocked: false,
          currentProgress: 0,
          targetProgress: 1,
          level: 1,
        });
      } else if (!hasProfilePicture) {
        allAchievements.push({
          id: 'photogenic',
          name: 'Photogenic',
          description: 'Add a profile picture',
          icon: <Camera className="w-8 h-8 text-white" />,
          type: 'special',
          category: 'Profile',
          isUnlocked: false,
          currentProgress: 0,
          targetProgress: 1,
          level: 1,
        });
      } else {
        // Both completed, show the username achievement as completed
        allAchievements.push({
          id: 'set-username',
          name: 'Identity Established',
          description: 'Set your username',
          icon: <User className="w-8 h-8 text-white" />,
          type: 'special',
          category: 'Profile',
          isUnlocked: true,
          currentProgress: 1,
          targetProgress: 1,
          level: 1,
        });
      }

      // 3. Get ONE badge achievement (show the next uncompleted one)
      const totalBadges = user.badges?.length || 0;
      
      if (totalBadges < 5) {
        allAchievements.push({
          id: 'badge-collector-5',
          name: 'Badge Collector',
          description: 'Earn 5 badges',
          icon: <Award className="w-8 h-8 text-white" />,
          type: 'special',
          category: 'Badges',
          isUnlocked: false,
          currentProgress: totalBadges,
          targetProgress: 5,
          level: 1,
        });
      } else if (totalBadges < 10) {
        allAchievements.push({
          id: 'badge-collector-10',
          name: 'Badge Master',
          description: 'Earn 10 badges',
          icon: <Award className="w-8 h-8 text-white" />,
          type: 'special',
          category: 'Badges',
          isUnlocked: false,
          currentProgress: totalBadges,
          targetProgress: 10,
          level: 2,
        });
      } else if (totalBadges < 50) {
        allAchievements.push({
          id: 'badge-collector-all',
          name: 'Badge Legend',
          description: 'Earn all badges',
          icon: <Award className="w-8 h-8 text-white" />,
          type: 'special',
          category: 'Badges',
          isUnlocked: false,
          currentProgress: totalBadges,
          targetProgress: 50,
          level: 3,
        });
      }

      setAchievements(allAchievements);
      setLoadingAchievements(false);
    };

    if (user) {
      fetchAchievements();
    }
  }, [user]);

  if (isLoading || loadingAchievements) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Achievements
        </h2>
        <Link 
          href="/users/achievements"
          className="text-sm font-semibold text-blue-400 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors uppercase tracking-wide"
        >
          View All
        </Link>
      </div>

      {/* Achievements List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {achievements.map((achievement, index) => (
          <div key={achievement.id}>
            <div className="p-4 flex items-start gap-4">
              {/* Achievement Icon */}
              <div className="relative flex-shrink-0">
                {achievement.type === 'rank' ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 flex items-center justify-center">
                    <Image
                      src={achievement.icon as string}
                      alt={achievement.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    {achievement.icon}
                  </div>
                )}
              </div>

              {/* Achievement Details - Now with flex layout */}
              <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {achievement.description}
                  </p>
                </div>

                {/* Achievement Image - Moved to top right, smaller size */}
                <div className="flex-shrink-0">
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
              </div>
            </div>

            {/* Separator line (except for last item) */}
            {index < achievements.length - 1 && (
              <div className="border-b border-gray-200 dark:border-gray-700 mx-4"></div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🎉</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            All caught up! Check back later for more achievements.
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementsUI;