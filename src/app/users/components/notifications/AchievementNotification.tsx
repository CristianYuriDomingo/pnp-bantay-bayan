// components/notifications/AchievementNotification.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useSoundContext } from '@/contexts/sound-context';

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  xpReward: number;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  achievement, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { play } = useSoundContext();

  useEffect(() => {
    // Play notification sound when achievement appears
    play('notification');

    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    play('click');
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[9998] ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal - Fixed size container */}
      <div
        className={`fixed top-4 right-4 z-[9999] transform transition-all duration-300 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{ width: '90%', maxWidth: '400px' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Blue Header - Fixed height */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 relative flex items-center justify-center h-14">
            <button
              onClick={handleClose}
              className="absolute right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-white text-lg font-bold tracking-wide uppercase">
              New Achievement Unlocked
            </h2>
          </div>

          {/* Content - Fixed height with scroll */}
          <div className="p-6 relative h-48 flex flex-col">
            {/* TOP RIGHT: Mascot Image (smaller) - Absolute positioned */}
            <div className="absolute top-4 right-4 flex-shrink-0">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {!imageError ? (
                  <Image 
                    src="/achievements/notification.png"
                    alt="Achievement Mascot"
                    fill
                    sizes="96px"
                    className="object-contain"
                    priority
                    onError={() => setImageError(true)}
                  />
                ) : (
                  // Fallback if image fails to load
                  <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🎉</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Text Content */}
            <div className="pr-28 flex-1 overflow-y-auto">
              {/* Achievement Name - Limit to 2 lines */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                {achievement.name}
              </h3>

              {/* Achievement Description - Scrollable if too long */}
              <p className="text-gray-500 text-base mb-4 leading-relaxed">
                {achievement.description}
              </p>
            </div>

            {/* XP Reward - Fixed at bottom */}
            {achievement.xpReward > 0 && (
              <div className="pt-2 pr-28 flex-shrink-0">
                <div className="inline-block bg-gradient-to-r from-blue-400 to-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                  +{achievement.xpReward} XP
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};