// app/users/achievements/page.tsx - WITH AUTOMATIC VERIFICATION

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useUserAchievements } from '@/hooks/use-user-achievements';
import { Loader2, Trophy, ChevronDown, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function AchievementsPage() {
  const { achievements, loading, error, refetch } = useUserAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string>('All Achievements');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredAchievementId, setHoveredAchievementId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 🔥 AUTOMATIC VERIFICATION ON PAGE LOAD
  useEffect(() => {
    let isMounted = true;

    const verifyAchievements = async () => {
      try {
        setIsVerifying(true);
        console.log('🔍 Auto-verifying achievements...');

        const response = await fetch('/api/achievements/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Verification failed');
        }

        const data = await response.json();

        if (isMounted && data.success) {
          console.log(`✅ Verification complete. Unlocked: ${data.rankAchievementsUnlocked}`);
          
          // Show toast if new achievements were unlocked
          if (data.rankAchievementsUnlocked > 0) {
            setToastMessage(`🎉 ${data.rankAchievementsUnlocked} new achievement${data.rankAchievementsUnlocked > 1 ? 's' : ''} unlocked!`);
            setShowToast(true);
            setTimeout(() => {
              if (isMounted) setShowToast(false);
            }, 4000);
          }

          // Refresh achievements list
          await refetch();
        }
      } catch (error) {
        console.error('❌ Auto-verification error:', error);
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    // Run verification after a short delay
    const timer = setTimeout(() => {
      verifyAchievements();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []); // Run once on mount

  // Get unique categories
  const categories = useMemo(() => {
    const achievementCategories = achievements.map(a => {
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
      if (selectedCategory === 'Learning Badges' && a.category === 'Learning Badges') {
        return (a as any).criteriaData?.badgeType === 'learning';
      }
      if (selectedCategory === 'Quiz Badges' && a.category === 'Learning Badges') {
        return (a as any).criteriaData?.badgeType === 'quiz';
      }
      
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
    if (achievement.icon && typeof achievement.icon === 'string') {
      if (achievement.icon.startsWith('http') || achievement.icon.startsWith('/')) {
        return (
          <div className={`w-20 h-20 rounded-xl border-2 p-3 flex items-center justify-center overflow-hidden ${
            achievement.isUnlocked
              ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="relative w-full h-full">
              <Image
                src={achievement.icon}
                alt={achievement.name}
                fill
                className={`object-contain ${!achievement.isUnlocked ? 'opacity-20 grayscale' : ''}`}
              />
            </div>
          </div>
        );
      } else {
        return (
          <div className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center ${
            achievement.isUnlocked
              ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}>
            <span className={`text-4xl ${!achievement.isUnlocked ? 'opacity-20 grayscale' : ''}`}>
              {achievement.icon}
            </span>
          </div>
        );
      }
    }
    
    return (
      <div className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center ${
        achievement.isUnlocked
          ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <Trophy className={`w-10 h-10 ${achievement.isUnlocked ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600 opacity-30'}`} />
      </div>
    );
  };

  if (loading && !isVerifying) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="px-4 md:px-20 py-6">
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center border-2 border-gray-200 dark:border-gray-700">
            <Trophy className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              Failed to Load Achievements
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Verification Loading Overlay */}
      {isVerifying && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Checking for new achievements...
            </span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Achievements
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">
              {statistics.unlockedCount} of {statistics.totalCount} unlocked
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="font-medium">{statistics.completionPercentage}% complete</span>
            {statistics.totalXPEarned > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  {statistics.totalXPEarned} XP earned
                </span>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {statistics.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${statistics.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Category Filter Dropdown */}
        <div className="mb-6 relative w-full sm:w-64">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-2.5 rounded-lg font-medium text-sm bg-blue-500 text-white hover:bg-blue-600 transition-all flex items-center justify-between"
          >
            <span className="truncate">{selectedCategory}</span>
            <ChevronDown 
              className={`w-5 h-5 ml-2 transition-transform flex-shrink-0 ${
                isDropdownOpen ? 'transform rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              {categories.map((category) => {
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
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category}</span>
                      <span className="text-xs opacity-75">
                        {categoryUnlocked}/{categoryCount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const extendedAchievement = achievement as any;
            const hasProgress = extendedAchievement.progress;
            const unlockedDate = achievement.isUnlocked && achievement.earnedAt 
              ? new Date(achievement.earnedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : null;
            
            return (
              <div
                key={achievement.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 transition-all relative group ${
                  achievement.isUnlocked
                    ? 'border-gray-300 dark:border-gray-600 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                onMouseEnter={() => setHoveredAchievementId(achievement.id)}
                onMouseLeave={() => setHoveredAchievementId(null)}
              >
                {/* Achievement Icon */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    {renderIcon(achievement)}
                    <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 bg-white dark:bg-gray-700">
                      <Image
                        src={achievement.isUnlocked ? "/achievements/unlocked.png" : "/achievements/locked.png"}
                        alt={achievement.isUnlocked ? "Unlocked" : "Locked"}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Achievement Info */}
                <div className="text-center">
                  <h3 className={`text-lg font-bold mb-1 ${
                    achievement.isUnlocked
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    achievement.isUnlocked
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {hasProgress && !achievement.isUnlocked && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-gray-500">Progress</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-400">
                          {extendedAchievement.progress.current}/{extendedAchievement.progress.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full transition-all duration-300"
                          style={{ width: `${Math.min(extendedAchievement.progress.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* XP Reward */}
                  {achievement.xpReward > 0 && (
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full mb-2 ${
                      achievement.isUnlocked
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}>
                      <span className={`text-sm font-semibold ${
                        achievement.isUnlocked
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        +{achievement.xpReward} XP
                      </span>
                    </div>
                  )}
                </div>

                {/* Tooltip */}
                {unlockedDate && (
                  <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-950 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none transition-opacity duration-200 ${
                    hoveredAchievementId === achievement.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    ✓ Unlocked {unlockedDate}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-950 rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              No achievements found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}