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
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
      <h2 className="text-lg font-bold text-center text-black dark:text-black mb-3">Your Mastery</h2>
      
      {/* Mastery Level Breakdown */}
      <div className="flex justify-center gap-3 mb-4">
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-2 text-center text-black shadow-sm flex flex-col items-center justify-center h-20 w-20">
          <div className="w-5 h-5 mb-1 relative">
            <Image
              src="/QuizImage/perfect-badge.png"
              alt="Perfect"
              fill
              sizes="20px"
              className="object-contain"
            />
          </div>
          <div className="text-xs font-bold leading-tight">{masteryStats.perfect}</div>
          <div className="text-xs font-semibold leading-tight">Perfect</div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-2 text-center text-black shadow-sm flex flex-col items-center justify-center h-20 w-20">
          <div className="w-5 h-5 mb-1 relative">
            <Image
              src="/QuizImage/gold-badge.png"
              alt="Gold"
              fill
              sizes="20px"
              className="object-contain"
            />
          </div>
          <div className="text-xs font-bold leading-tight">{masteryStats.gold}</div>
          <div className="text-xs font-semibold leading-tight">Gold</div>
        </div>

        <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-2 text-center text-black shadow-sm flex flex-col items-center justify-center h-20 w-20">
          <div className="w-5 h-5 mb-1 relative">
            <Image
              src="/QuizImage/silver-badge.png"
              alt="Silver"
              fill
              sizes="20px"
              className="object-contain"
            />
          </div>
          <div className="text-xs font-bold leading-tight">{masteryStats.silver}</div>
          <div className="text-xs font-semibold leading-tight">Silver</div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-2 text-center text-black shadow-sm flex flex-col items-center justify-center h-20 w-20">
          <div className="w-5 h-5 mb-1 relative">
            <Image
              src="/QuizImage/bronze-badge.png"
              alt="Bronze"
              fill
              sizes="20px"
              className="object-contain"
            />
          </div>
          <div className="text-xs font-bold leading-tight">{masteryStats.bronze}</div>
          <div className="text-xs font-semibold leading-tight">Bronze</div>
        </div>
      </div>

      {/* Total Masteries Summary */}
      <div className="mt-3 text-center">
        <p className="text-sm font-bold text-center text-black dark:text-black">
          Total Mastery: {masteryStats.total}
        </p>
      </div>
    </div>
  );
};

export default MasteryAchievements;