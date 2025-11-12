import React, { useState } from 'react';

export default function DutyPass() {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // FOR PREVIEW: Set to true to simulate Sunday
  // Change this to check real day: const isSunday = new Date().getDay() === 0;
  const isSunday = true; // PREVIEW MODE - Always Sunday
  const canClaim = isSunday && !isClaimed;

  const handleClaim = () => {
    if (canClaim) {
      setIsClaimed(true);
    }
  };

  const getButtonText = () => {
    if (isClaimed) return 'CLAIMED';
    if (!isSunday) return 'AVAILABLE ON SUNDAY';
    return 'CLAIM';
  };

  return (
    <div className="p-6">
      {/* Inner card with rounded corners and border - matching QuestCard */}
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        <div className="flex items-center gap-4">
          {/* Duty Pass Image */}
          <div 
            className="flex-shrink-0 transition-transform duration-200"
            style={{
              transform: isHovered && canClaim ? 'scale(1.05)' : 'scale(1)',
              opacity: canClaim ? 1 : 0.6
            }}
          >
            <img
              src="/Quest/DutyPass.png"
              alt="Duty Pass"
              className="w-20 h-20 object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
              Duty Pass
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
              Duty Pass allows your streak to remain in place for one full day of inactivity.
            </p>

            {/* Claim Button */}
            <button
              onClick={handleClaim}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={!canClaim}
              className={`w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                !canClaim
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg active:scale-95'
              }`}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}