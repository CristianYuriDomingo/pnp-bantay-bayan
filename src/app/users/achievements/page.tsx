// app/users/achievements/page.tsx - WITH REAL BADGE PROGRESS

'use client';

import React, { useState, useMemo } from 'react';
import { useUserAchievements } from '@/hooks/use-user-achievements';
import { Loader2, Trophy } from 'lucide-react';
import Image from 'next/image';

export default function AchievementsPage() {
  const { achievements, loading, error } = useUserAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string>('All Achievements');

  // Get unique categories - map "Learning Badges" to separate categories
  const categories = useMemo(() => {
    const achievementCategories = achievements.map(a => {
      // Check if it's a badge milestone achievement and separate by type
      if (a.category === 'Learning Badges' && (a as any).criteriaData) {
        const badgeType = (a as any).criteriaData.badgeType;
        if (badgeType === 'learning') {
          return 'Learning Badges';
        } else if (badgeType === 'quiz') {
          return 'Quiz Badges';
        }
      }
      return a.category;
    });
    
    const uniqueCategories = ['All Achievements', ...new Set(achievementCategories)];
    return uniqueCategories;
  }, [achievements]);

  // Filter achievements by category
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'All Achievements') {
      return achievements;
    }
    
    return achievements.filter(a => {
      // Handle Learning Badges and Quiz Badges separation
      if (selectedCategory === 'Learning Badges' && a.category === 'Learning Badges') {
        return (a as any).criteriaData?.badgeType === 'learning';
      }
      if (selectedCategory === 'Quiz Badges' && a.category === 'Learning Badges') {
        return (a as any).criteriaData?.badgeType === 'quiz';
      }
      
      // For other categories, just match normally
      return a.category === selectedCategory;
    });
  }, [achievements, selectedCategory]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const unlockedCount = achievements.filter(a => a.isUnlocked).length;
    const totalCount = achievements.length;
    const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
    const totalXPEarned = achievements
      .filter(a => a.isUnlocked)
      .reduce((sum, a) => sum + (a.xpAwarded || 0), 0);

    return {
      unlockedCount,
      totalCount,
      completionPercentage,
      totalXPEarned
    };
  }, [achievements]);

  const renderIcon = (achievement: any) => {
    // If it's an emoji icon (stored as string)
    if (achievement.icon && typeof achievement.icon === 'string') {
      if (achievement.icon.startsWith('http') || achievement.icon.startsWith('/')) {
        // It's an image URL (rank icons)
        return (
          <div className={`w-20 h-20 rounded-xl border-2 p-3 flex items-center justify-center overflow-hidden ${
            achievement.isUnlocked
              ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
          }`}>
            <div className="relative w-full h-full">
              <Image
                src={achievement.icon}
                alt={achievement.name}
                fill
                className={`object-contain ${!achievement.isUnlocked ? 'opacity-40 grayscale' : ''}`}
              />
            </div>
          </div>
        );
      } else {
        // It's an emoji or text icon
        return (
          <div className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center ${
            achievement.isUnlocked
              ? achievement.category === 'Learning Badges'
                ? 'bg-gradient-to-br from-blue-400 to-cyan-500 border-gray-200 dark:border-gray-600'
                : achievement.category === 'Rank Promotions'
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-gray-200 dark:border-gray-600'
                : achievement.category === 'Profile'
                ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-gray-200 dark:border-gray-600'
                : 'bg-gradient-to-br from-purple-400 to-pink-500 border-gray-200 dark:border-gray-600'
              : 'bg-gray-300 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
          }`}>
            <span className={`text-4xl ${!achievement.isUnlocked ? 'opacity-40 grayscale' : ''}`}>
              {achievement.icon}
            </span>
          </div>
        );
      }
    }
    
    // Default trophy icon
    return (
      <div className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center ${
        achievement.isUnlocked
          ? 'bg-gradient-to-br from-purple-400 to-pink-500 border-gray-200 dark:border-gray-600'
          : 'bg-gray-300 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
      }`}>
        <Trophy className={`w-10 h-10 text-white ${!achievement.isUnlocked ? 'opacity-40' : ''}`} />
      </div>
    );
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 text-center">
            <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Failed to Load Achievements
            </h2>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Achievements
          </h1>
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <span>
              {statistics.unlockedCount} of {statistics.totalCount} unlocked
            </span>
            <span className="text-gray-400">•</span>
            <span>{statistics.completionPercentage}% complete</span>
            {statistics.totalXPEarned > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  {statistics.totalXPEarned} XP earned
                </span>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {statistics.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${statistics.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => {
            // Calculate counts based on the separated categories
            let categoryCount = 0;
            let categoryUnlocked = 0;

            if (category === 'All Achievements') {
              categoryCount = achievements.length;
              categoryUnlocked = statistics.unlockedCount;
            } else if (category === 'Learning Badges') {
              const learningAchievements = achievements.filter(
                a => a.category === 'Learning Badges' && (a as any).criteriaData?.badgeType === 'learning'
              );
              categoryCount = learningAchievements.length;
              categoryUnlocked = learningAchievements.filter(a => a.isUnlocked).length;
            } else if (category === 'Quiz Badges') {
              const quizAchievements = achievements.filter(
                a => a.category === 'Learning Badges' && (a as any).criteriaData?.badgeType === 'quiz'
              );
              categoryCount = quizAchievements.length;
              categoryUnlocked = quizAchievements.filter(a => a.isUnlocked).length;
            } else {
              const categoryAchievements = achievements.filter(a => a.category === category);
              categoryCount = categoryAchievements.length;
              categoryUnlocked = categoryAchievements.filter(a => a.isUnlocked).length;
            }

            return (
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
                <span className="ml-2 text-xs opacity-75">
                  ({categoryUnlocked}/{categoryCount})
                </span>
              </button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const extendedAchievement = achievement as any;
            const hasProgress = extendedAchievement.progress;
            
            return (
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
                  {renderIcon(achievement)}
                </div>

                {/* Achievement Info */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {achievement.description}
                  </p>

                  {/* Progress Bar for Badge Milestones */}
                  {hasProgress && !achievement.isUnlocked && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {extendedAchievement.progress.current}/{extendedAchievement.progress.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                          style={{ width: `${Math.min(extendedAchievement.progress.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* XP Reward - Only show if greater than 0 */}
                  {achievement.xpReward > 0 && (
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                      +{achievement.xpReward} XP
                    </p>
                  )}

                  {/* Unlock Date */}
                  {achievement.isUnlocked && achievement.earnedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Unlocked {new Date(achievement.earnedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
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