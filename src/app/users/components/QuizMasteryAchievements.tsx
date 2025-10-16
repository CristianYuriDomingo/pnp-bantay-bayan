"use client";
import React from 'react';
import Image from 'next/image';

interface MasteryStats {
  perfect: number;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

interface MasteryAchievementsProps {
  masteryStats: MasteryStats;
}

const MasteryAchievements: React.FC<MasteryAchievementsProps> = ({ masteryStats }) => {
  const masteryItems = [
    {
      key: 'perfect',
      label: 'Perfect',
      count: masteryStats.perfect,
      image: '/QuizImage/mastery/perfect-badge.png',
      alt: 'Perfect',
      color: 'from-yellow-400 to-yellow-300',
    },
    {
      key: 'gold',
      label: 'Gold',
      count: masteryStats.gold,
      image: '/QuizImage/mastery/gold-badge.png',
      alt: 'Gold',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      key: 'silver',
      label: 'Silver',
      count: masteryStats.silver,
      image: '/QuizImage/mastery/silver-badge.png',
      alt: 'Silver',
      color: 'from-gray-300 to-gray-200',
    },
    {
      key: 'bronze',
      label: 'Bronze',
      count: masteryStats.bronze,
      image: '/QuizImage/mastery/bronze-badge.png',
      alt: 'Bronze',
      color: 'from-orange-400 to-orange-300',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-sm border border-blue-100">
      <h2 className="text-xl font-bold text-center text-blue-900 mb-6">Your Mastery Achievements</h2>

      {/* Mastery Level Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
        {masteryItems.map((item) => (
          <div
            key={item.key}
            className="flex flex-col items-center gap-3"
          >
            {/* Main Circle with Badge Counter */}
            <div className="relative group">
              {/* Count Badge - Left Side */}
              <div className="absolute -top-3 -left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center z-10 shadow-md ring-2 ring-white">
                {item.count}
              </div>

              {/* Circle Container */}
              <div className={`bg-gradient-to-br ${item.color} border-4 border-blue-300 rounded-full text-center shadow-lg flex items-center justify-center h-24 w-24 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 cursor-pointer`}>
                <div className="w-16 h-16 relative">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg">
                {item.label}
              </div>
            </div>

            {/* Label Below */}
            <p className="text-sm font-bold text-gray-700">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent mb-4"></div>

      {/* Total Masteries Summary */}
      <div className="text-center">
        <p className="text-gray-600 text-sm font-semibold mb-1">Total Masteries Earned</p>
        <p className="text-blue-900 text-3xl font-bold">{masteryStats.total}</p>
      </div>
    </div>
  );
};

export default MasteryAchievements;