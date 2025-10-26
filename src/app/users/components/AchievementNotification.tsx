// components/AchievementNotification.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, X, Zap } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  rarity: string;
  xpReward: number;
}

interface AchievementNotificationProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'Common': return 'from-gray-400 to-gray-600';
    case 'Rare': return 'from-blue-400 to-blue-600';
    case 'Epic': return 'from-purple-400 to-purple-600';
    case 'Legendary': return 'from-yellow-400 to-yellow-600';
    default: return 'from-gray-400 to-gray-600';
  }
};

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  achievements, 
  onDismiss 
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (achievements.length > 0) {
      setVisible(true);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievements, currentIndex]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setVisible(true);
      } else {
        onDismiss();
      }
    }, 300);
  };

  if (!mounted || achievements.length === 0 || !visible) return null;

  const achievement = achievements[currentIndex];

  return createPortal(
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-2xl shadow-2xl p-6 max-w-sm border-4 border-white transform transition-all duration-300 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
            <Trophy className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Achievement Unlocked!</h3>
            <p className="text-white text-opacity-90 text-xs">
              {achievements.length > 1 && `${currentIndex + 1} of ${achievements.length}`}
            </p>
          </div>
        </div>

        {/* Achievement Icon */}
        {achievement.icon && (
          <div className="flex justify-center mb-3">
            <div className="text-6xl">{achievement.icon}</div>
          </div>
        )}

        {/* Achievement Details */}
        <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
          <h4 className="text-white font-bold text-xl mb-2">{achievement.name}</h4>
          <p className="text-white text-opacity-90 text-sm mb-3">{achievement.description}</p>
          
          {/* Rarity & XP */}
          <div className="flex justify-between items-center">
            <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-white text-xs font-semibold">
              {achievement.rarity}
            </span>
            {achievement.xpReward > 0 && (
              <div className="flex items-center gap-1 text-white font-bold">
                <Zap size={16} className="text-yellow-300" />
                <span>+{achievement.xpReward} XP</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress indicator for multiple achievements */}
        {achievements.length > 1 && (
          <div className="flex gap-1 mt-3 justify-center">
            {achievements.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white bg-opacity-40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AchievementNotification;