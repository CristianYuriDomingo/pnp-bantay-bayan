// app/users/components/QuestCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';

const QuestCard: React.FC = () => {
  return (
    <div className="p-6">
      {/* Inner card with rounded corners and border */}
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        {/* Character image - Centered at top */}
        <div className="mb-4 flex justify-center">
          <div className="w-20 h-20 relative">
            <Image
              src="/Quest/QuestCard.png"
              alt="Quest mascot"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Header with Welcome Message */}
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Ready for Today's Quest?
          </h2>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-center">
          Tap unlocked quests to complete them and progress along your path. Finish all 5 daily quests this week to unlock and claim the treasure chest reward!
        </p>
      </div>
    </div>
  );
};

export default QuestCard;