//lib/achievement-notifier.ts - CLIENT-SIDE HELPER

'use client';

import { Achievement } from '@/app/users/components/notifications/AchievementNotification';

/**
 * Trigger an achievement notification from anywhere in your app
 */
export function notifyAchievement(achievement: Achievement) {
  if (typeof window === 'undefined') {
    console.warn('⚠️ notifyAchievement called on server side');
    return;
  }
  
  console.log('📢 Broadcasting achievement:', achievement.name);
  const event = new CustomEvent('achievementUnlocked', {
    detail: achievement
  });
  window.dispatchEvent(event);
}

/**
 * Check for new achievements and show notifications
 * Now waits for notification system to be ready
 */
export async function checkAndNotifyNewAchievements() {
  // Ensure we're in the browser
  if (typeof window === 'undefined') {
    console.warn('⚠️ checkAndNotifyNewAchievements called on server side');
    return;
  }

  try {
    console.log('🔍 Checking for new achievements...');
    
    const response = await fetch('/api/achievements/check-new', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Don't log errors for expected cases
      if (response.status === 401) {
        console.log('ℹ️ Not authenticated');
        return;
      }
      if (response.status === 404) {
        console.log('ℹ️ Achievement check endpoint not found');
        return;
      }
      console.error('❌ Achievement check failed:', response.status, response.statusText);
      return;
    }

    const data = await response.json();

    if (data.success && data.newAchievements && data.newAchievements.length > 0) {
      console.log('✅ Found', data.newAchievements.length, 'new achievements');
      
      // Show each new achievement with a slight delay between them
      data.newAchievements.forEach((achievement: Achievement, index: number) => {
        setTimeout(() => {
          notifyAchievement(achievement);
        }, index * 100); // 100ms delay between notifications
      });
    } else {
      console.log('ℹ️ No new achievements found');
    }
  } catch (error) {
    // Handle network errors gracefully
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('⚠️ Network error while checking achievements (this is normal during navigation)');
    } else {
      console.error('❌ Error checking for new achievements:', error);
    }
  }
}