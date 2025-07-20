import React from 'react';
import Image from 'next/image';

const LearnCard2: React.FC = () => {
  return (
    <div className="max-w-full lg:max-w-[90%] mx-auto w-full lg:w-[400px] rounded-2xl border-2 border-gray-400 dark:border-gray-600">
      <div className="p-5 sm:p-4">
        {/* Header */}
        <h2 className="text-sm font-medium text-gray-400 dark:text-gray-300 uppercase mb-3 text-center">
          WHAT ARE LEARNING MODULES?
        </h2>

        {/* Main content */}
        <div className="flex flex-col items-center lg:items-start lg:flex-row">
          {/* Character image */}
          <div className="w-22 h-22 lg:w-24 lg:h-24 relative mb-4 lg:mb-0 lg:mr-4">
            <Image
              src="/MainImage/PibiTeach.png"
              alt="Leaderboard mascot"
              fill
              sizes="110px"
              className="object-contain"
              priority
            />
          </div>

          {/* Text Content */}
          <div className="text-center lg:text-left flex-1">
            {/* Bold statement */}
            <h3 className="text-lg sm:text-base lg:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
              Read lesson. Finish. <br />
              Earn Badge.
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-xs">
              Earn Badge through lessons, different lessons will give you different badges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnCard2;