//contexts/achievement-notification-context.tsx

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AchievementNotification, Achievement } from '@/app/users/components/notifications/AchievementNotification';

interface AchievementNotificationContextType {
  showAchievement: (achievement: Achievement) => void;
  queueAchievement: (achievement: Achievement) => void;
  isReady: boolean; // NEW: Track if provider is ready
}

const AchievementNotificationContext = createContext<AchievementNotificationContextType | undefined>(undefined);

export const useAchievementNotification = () => {
  const context = useContext(AchievementNotificationContext);
  if (!context) {
    throw new Error('useAchievementNotification must be used within AchievementNotificationProvider');
  }
  return context;
};

export const AchievementNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Achievement[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const pendingAchievements = useRef<Achievement[]>([]);

  // Mark provider as ready after mount
  useEffect(() => {
    setIsReady(true);
    
    // Process any pending achievements that came in before we were ready
    if (pendingAchievements.current.length > 0) {
      console.log('🔄 Processing', pendingAchievements.current.length, 'pending achievements');
      pendingAchievements.current.forEach(achievement => {
        queueAchievement(achievement);
      });
      pendingAchievements.current = [];
    }
  }, []);

  // Show the next notification in queue
  useEffect(() => {
    if (!currentNotification && notifications.length > 0) {
      setCurrentNotification(notifications[0]);
    }
  }, [notifications, currentNotification]);

  // Listen for custom achievement events
  useEffect(() => {
    const handleAchievementEvent = (event: CustomEvent<Achievement>) => {
      if (isReady) {
        queueAchievement(event.detail);
      } else {
        // Store for later if not ready yet
        pendingAchievements.current.push(event.detail);
      }
    };

    window.addEventListener('achievementUnlocked', handleAchievementEvent as EventListener);

    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievementEvent as EventListener);
    };
  }, [isReady]);

  const queueAchievement = useCallback((achievement: Achievement) => {
    console.log('🎉 Queuing achievement:', achievement.name);
    setNotifications(prev => {
      // Prevent duplicates
      if (prev.some(a => a.id === achievement.id)) {
        return prev;
      }
      return [...prev, achievement];
    });
  }, []);

  const showAchievement = useCallback((achievement: Achievement) => {
    setCurrentNotification(achievement);
  }, []);

  const handleClose = useCallback(() => {
    setNotifications(prev => prev.slice(1));
    setCurrentNotification(null);
  }, []);

  return (
    <AchievementNotificationContext.Provider value={{ showAchievement, queueAchievement, isReady }}>
      {children}
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          onClose={handleClose}
        />
      )}
    </AchievementNotificationContext.Provider>
  );
};