// components/achievements/AchievementNotification.tsx
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
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ width: '90%', maxWidth: '600px' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Blue Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-white text-center text-xl font-bold tracking-wide uppercase">
              New Achievement Unlocked
            </h2>
          </div>

          {/* Content - Image LEFT, Text RIGHT */}
          <div className="p-8">
            <div className="flex items-center gap-8">
              {/* LEFT: Achievement Icon/Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 flex items-center justify-center relative">
                  {achievement.icon ? (
                    <Image
                      src={achievement.icon}
                      alt={achievement.name}
                      width={128}
                      height={128}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-6xl">🏆</span>
                    </div>
                  )}
                  
                  {/* Badge number overlay (optional) */}
                  <div className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
                    1
                  </div>
                </div>
              </div>

              {/* RIGHT: Text Content */}
              <div className="flex-1 text-left">
                {/* Achievement Name */}
                <h3 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  {achievement.name}
                </h3>

                {/* Achievement Description */}
                <p className="text-gray-500 text-lg mb-4 leading-relaxed">
                  {achievement.description}
                </p>

                {/* Category Badge */}
                <div className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium mb-3">
                  {achievement.category}
                </div>

                {/* XP Reward */}
                {achievement.xpReward > 0 && (
                  <div className="inline-block bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2 rounded-full text-xl font-bold shadow-md">
                    +{achievement.xpReward} XP
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================================
// GLOBAL NOTIFICATION PROVIDER
// ============================================================

import { createContext, useContext, ReactNode } from 'react';

interface AchievementNotificationContextType {
  showAchievement: (achievement: Achievement) => void;
}

const AchievementNotificationContext = createContext<AchievementNotificationContextType | null>(null);

export const useAchievementNotification = () => {
  const context = useContext(AchievementNotificationContext);
  if (!context) {
    throw new Error('useAchievementNotification must be used within AchievementNotificationProvider');
  }
  return context;
};

interface AchievementNotificationProviderProps {
  children: ReactNode;
}

export const AchievementNotificationProvider: React.FC<AchievementNotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Achievement[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);

  const showAchievement = (achievement: Achievement) => {
    setNotifications(prev => [...prev, achievement]);
  };

  // Show notifications one at a time
  useEffect(() => {
    if (!currentNotification && notifications.length > 0) {
      setCurrentNotification(notifications[0]);
    }
  }, [notifications, currentNotification]);

  const handleClose = () => {
    setNotifications(prev => prev.slice(1));
    setCurrentNotification(null);
  };

  return (
    <AchievementNotificationContext.Provider value={{ showAchievement }}>
      {children}
      
      {/* Render current notification */}
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          onClose={handleClose}
        />
      )}
    </AchievementNotificationContext.Provider>
  );
};

// ============================================================
// ACHIEVEMENT LISTENER COMPONENT
// ============================================================

export const AchievementListener: React.FC = () => {
  const { showAchievement } = useAchievementNotification();

  useEffect(() => {
    // Listen for achievement events from API calls
    const handleAchievementUnlocked = (event: CustomEvent<Achievement>) => {
      showAchievement(event.detail);
    };

    window.addEventListener('achievementUnlocked', handleAchievementUnlocked as EventListener);

    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievementUnlocked as EventListener);
    };
  }, [showAchievement]);

  return null;
};

// ============================================================
// UTILITY FUNCTION TO TRIGGER NOTIFICATIONS
// ============================================================

export const triggerAchievementNotification = (achievement: Achievement) => {
  const event = new CustomEvent('achievementUnlocked', { detail: achievement });
  window.dispatchEvent(event);
};