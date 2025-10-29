import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

// Achievement notification data structure
interface Achievement {
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

// Single notification component - Exact Duolingo layout
const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
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

  // Get number badge color based on category
  const getBadgeColor = () => {
    switch (achievement.category) {
      case 'Profile':
        return 'bg-red-500';
      case 'Rank Promotions':
        return 'bg-purple-500';
      case 'Learning Badges':
        return 'bg-green-500';
      default:
        return 'bg-orange-500';
    }
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
              New Achievement Unlock
            </h2>
          </div>

          {/* Content - Image LEFT, Text RIGHT */}
          <div className="p-8">
            <div className="flex items-center gap-8">
              {/* LEFT: Mascot Image with Badge - STATIC FROM PUBLIC FOLDER */}
              <div className="flex-shrink-0">
                <div className="w-56 h-56 flex items-center justify-center">
                  {/* 
                    This is your STATIC mascot image with badge already included
                    Replace with your actual image path like:
                    /images/mascot-achievement.png
                    /images/police-mascot-badge.png
                  */}
                  <img 
                    src="/images/achievement-mascot.png"
                    alt="Achievement Mascot"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback: Show demo image if your file doesn't exist yet
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=250&h=250&fit=crop";
                    }}
                  />
                </div>
              </div>

              {/* RIGHT: Text Content */}
              <div className="flex-1 text-left">
                {/* Achievement Name */}
                <h3 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  {achievement.name}
                </h3>

                {/* Achievement Description */}
                <p className="text-gray-500 text-xl mb-6 leading-relaxed">
                  {achievement.description}
                </p>

                {/* XP Reward */}
                {achievement.xpReward > 0 && (
                  <div className="inline-block bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2 rounded-full text-2xl font-bold shadow-md">
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

// Queue manager for multiple notifications
const AchievementNotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Achievement[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);

  // Simulate achievements
  const simulateAchievement = (type: 'profile' | 'badge' | 'rank') => {
    const mockAchievements = {
      profile: {
        id: '1',
        code: 'identity-established',
        name: 'Identity Established',
        description: 'Set your username',
        icon: '/achievements/identity-established.png',
        category: 'Profile',
        xpReward: 100,
      },
      badge: {
        id: '2',
        code: 'learning-starter',
        name: 'Learning Starter',
        description: 'Earn your first learning badge',
        icon: '/achievements/learning-starter.png',
        category: 'Learning Badges',
        xpReward: 0,
      },
      rank: {
        id: '3',
        code: 'rank-pcpl',
        name: 'Police Corporal',
        description: 'Reach Police Corporal rank',
        icon: '/ranks/PCpl.png',
        category: 'Rank Promotions',
        xpReward: 100,
      },
    };

    const newAchievement = mockAchievements[type];
    setNotifications(prev => [...prev, newAchievement]);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Achievement Notification Demo</h1>
        
        {/* Demo Buttons */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Trigger Achievements:</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => simulateAchievement('profile')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md"
            >
              Profile Achievement
            </button>
            <button
              onClick={() => simulateAchievement('badge')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md"
            >
              Badge Achievement
            </button>
            <button
              onClick={() => simulateAchievement('rank')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md"
            >
              Rank Achievement
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Layout:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>✅ Image on LEFT side (mascot)</li>
            <li>✅ Text on RIGHT side (achievement details)</li>
            <li>✅ Number badge (1) attached to mascot image</li>
            <li>✅ XP shown below description</li>
            <li>✅ Exact Duolingo-style layout</li>
          </ul>
        </div>
      </div>

      {/* Render current notification */}
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default AchievementNotificationManager;