//contexts/achievement-notification-context.tsx - INSTANT NOTIFICATIONS ⚡

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AchievementNotification, Achievement } from '@/app/users/components/notifications/AchievementNotification';

interface AchievementNotificationContextType {
  showAchievement: (achievement: Achievement) => void;
  queueAchievement: (achievement: Achievement) => void;
  isReady: boolean;
  clearQueue: () => void; // Clear all pending notifications
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
  const processedIds = useRef<Set<string>>(new Set()); // Prevent duplicate notifications

  // Mark provider as ready after mount
  useEffect(() => {
    console.log('🎯 Achievement notification provider ready');
    setIsReady(true);
    
    // Process any pending achievements that came in before we were ready
    if (pendingAchievements.current.length > 0) {
      console.log('🔄 Processing', pendingAchievements.current.length, 'pending achievements');
      pendingAchievements.current.forEach(achievement => {
        internalQueueAchievement(achievement);
      });
      pendingAchievements.current = [];
    }
  }, []);

  // Show the next notification in queue (with slight delay for smooth UX)
  useEffect(() => {
    if (!currentNotification && notifications.length > 0) {
      // Small delay between notifications for better UX
      const timer = setTimeout(() => {
        setCurrentNotification(notifications[0]);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [notifications, currentNotification]);

  // Internal queue function (without duplicate check for manual calls)
  const internalQueueAchievement = useCallback((achievement: Achievement) => {
    // Check if we've already shown this achievement in this session
    if (processedIds.current.has(achievement.id)) {
      console.log('⏭️ Skipping duplicate achievement:', achievement.name);
      return;
    }

    console.log('🎉 Queuing achievement notification:', achievement.name);
    processedIds.current.add(achievement.id);
    
    setNotifications(prev => {
      // Double-check for duplicates in queue
      if (prev.some(a => a.id === achievement.id)) {
        return prev;
      }
      return [...prev, achievement];
    });
  }, []);

  // Listen for achievement events from the system
  useEffect(() => {
    if (!isReady) return;

    const handleAchievementEvent = (event: CustomEvent<Achievement>) => {
      internalQueueAchievement(event.detail);
    };

    const handleBadgesAwarded = (event: CustomEvent) => {
      const detail = event.detail;
      
      // Handle multiple badges at once
      if (detail?.newBadges && Array.isArray(detail.newBadges)) {
        console.log(`🏅 ${detail.newBadges.length} new badges awarded - queueing notifications`);
        detail.newBadges.forEach((achievement: Achievement) => {
          internalQueueAchievement(achievement);
        });
      }
    };

    console.log('👂 Listening for achievement events...');
    window.addEventListener('achievementUnlocked', handleAchievementEvent as EventListener);
    window.addEventListener('badgesAwarded', handleBadgesAwarded as EventListener);

    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievementEvent as EventListener);
      window.removeEventListener('badgesAwarded', handleBadgesAwarded as EventListener);
    };
  }, [isReady, internalQueueAchievement]);

  const queueAchievement = useCallback((achievement: Achievement) => {
    if (!isReady) {
      console.log('⏳ Provider not ready, storing achievement:', achievement.name);
      pendingAchievements.current.push(achievement);
      return;
    }
    internalQueueAchievement(achievement);
  }, [isReady, internalQueueAchievement]);

  const showAchievement = useCallback((achievement: Achievement) => {
    console.log('📣 Showing achievement immediately:', achievement.name);
    setCurrentNotification(achievement);
  }, []);

  const handleClose = useCallback(() => {
    console.log('✅ Closing achievement notification');
    setNotifications(prev => prev.slice(1));
    setCurrentNotification(null);
  }, []);

  const clearQueue = useCallback(() => {
    console.log('🗑️ Clearing achievement queue');
    setNotifications([]);
    setCurrentNotification(null);
    processedIds.current.clear();
  }, []);

  return (
    <AchievementNotificationContext.Provider value={{ 
      showAchievement, 
      queueAchievement, 
      isReady,
      clearQueue 
    }}>
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