// components/notifications/AchievementNotification.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

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

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
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

      {/* Modal */}
      <div
        className={`fixed top-4 right-4 z-[9999] transform transition-all duration-300 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{ width: '90%', maxWidth: '400px' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Blue Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-white text-center text-lg font-bold tracking-wide uppercase">
              New Achievement Unlocked
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 relative">
            {/* TOP RIGHT: Mascot Image (smaller) */}
            <div className="absolute top-4 right-4">
              <div className="w-24 h-24 flex items-center justify-center">
                <img 
                  src="/achievements/notification.png"
                  alt="Achievement Mascot"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Text Content (with right padding to avoid image overlap) */}
            <div className="pr-28">
              {/* Achievement Name */}
              <h3 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {achievement.name}
              </h3>

              {/* Achievement Description */}
              <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                {achievement.description}
              </p>

              {/* XP Reward */}
              {achievement.xpReward > 0 && (
                <div className="inline-block bg-gradient-to-r from-blue-400 to-blue-500 text-white px-5 py-2 rounded-full text-xl font-bold shadow-md">
                  +{achievement.xpReward} XP
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};