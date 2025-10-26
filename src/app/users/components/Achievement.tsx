'use client';

import React from 'react';
import { useUserAchievements } from '@/hooks/use-user-achievements';
import { Loader2, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const AchievementsUI = () => {
  const { achievements, loading, error } = useUserAchievements();

  // 🔹 Group achievements by category, then take 1 per category
  const achievementsByCategory = Object.values(
    achievements.reduce((acc: any, curr: any) => {
      // Handle "Learning Badges" and "Quiz Badges" separately
      let categoryKey = curr.category;
      if (curr.category === 'Learning Badges' && curr.criteriaData) {
        if (curr.criteriaData.badgeType === 'quiz') categoryKey = 'Quiz Badges';
        else categoryKey = 'Learning Badges';
      }

      if (!acc[categoryKey]) acc[categoryKey] = curr; // Keep first achievement found per category
      return acc;
    }, {})
  );

  // If no achievements found, show empty state
  const displayAchievements = achievementsByCategory;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 text-center">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load achievements
        </p>
      </div>
    );
  }

  const renderIcon = (achievement: any) => {
    if (achievement.icon && typeof achievement.icon === 'string') {
      if (achievement.icon.startsWith('http') || achievement.icon.startsWith('/')) {
        return (
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 flex items-center justify-center">
            <Image
              src={achievement.icon}
              alt={achievement.name}
              width={48}
              height={48}
              className={`object-contain ${!achievement.isUnlocked ? 'grayscale opacity-50' : ''}`}
            />
          </div>
        );
      } else {
        return (
          <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center ${
            achievement.isUnlocked 
              ? achievement.category === 'Profile'
                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                : achievement.category === 'Rank Promotions'
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                : achievement.category === 'Learning Badges' || achievement.category === 'Quiz Badges'
                ? 'bg-gradient-to-br from-blue-400 to-cyan-500'
                : 'bg-gradient-to-br from-purple-400 to-pink-500'
              : 'bg-gray-300 dark:bg-gray-700'
          }`}>
            <span className={`text-3xl ${!achievement.isUnlocked ? 'opacity-50 grayscale' : ''}`}>
              {achievement.icon}
            </span>
          </div>
        );
      }
    }

    return (
      <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center ${
        achievement.isUnlocked 
          ? 'bg-gradient-to-br from-purple-400 to-pink-500' 
          : 'bg-gray-300 dark:bg-gray-700'
      }`}>
        <Trophy className={`w-8 h-8 text-white ${!achievement.isUnlocked ? 'opacity-50' : ''}`} />
      </div>
    );
  };

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
        {displayAchievements.map((achievement: any, index: number) => (
          <div key={achievement.id}>
            <div className="p-4 flex items-start gap-4">
              {/* Achievement Icon */}
              <div className="relative flex-shrink-0">
                {renderIcon(achievement)}
              </div>

              {/* Achievement Details */}
              <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {achievement.description}
                  </p>
                  
                  {achievement.xpReward > 0 && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                      +{achievement.xpReward} XP
                    </p>
                  )}

                  {achievement.isUnlocked && achievement.earnedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Unlocked {new Date(achievement.earnedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>

                {/* Lock/Unlock Badge */}
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

            {/* Separator line */}
            {index < displayAchievements.length - 1 && (
              <div className="border-b border-gray-200 dark:border-gray-700 mx-4"></div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayAchievements.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🎉</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No achievements yet. Start learning to unlock achievements!
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementsUI;
