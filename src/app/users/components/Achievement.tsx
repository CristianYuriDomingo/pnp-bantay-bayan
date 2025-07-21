import React, { useState } from 'react';

interface Achievement {
  id: number;
  name: string;
  description: string;
  progress: number;
  total: number;
  level: number;
  imageSrc: string;
  category: string;
}

const AchievementsUI: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All Achievements');
  
  const achievements: Achievement[] = [
    {
      id: 1,
      name: 'Wildfire',
      description: 'Reach a 3 day streak',
      progress: 0,
      total: 3,
      level: 1,
      imageSrc: '/api/placeholder/64/64', // Replace with your image
      category: 'Learning'
    },
    {
      id: 2,
      name: 'Sage',
      description: 'Earn 100 XP',
      progress: 0,
      total: 100,
      level: 1,
      imageSrc: '/api/placeholder/64/64', // Replace with your image
      category: 'Learning'
    },
    {
      id: 3,
      name: 'Scholar',
      description: 'Learn 50 new words in a single course',
      progress: 0,
      total: 50,
      level: 1,
      imageSrc: '/api/placeholder/64/64', // Replace with your image
      category: 'Learning'
    },
    {
      id: 4,
      name: 'Champion',
      description: 'Complete 10 lessons without mistakes',
      progress: 3,
      total: 10,
      level: 2,
      imageSrc: '/api/placeholder/64/64', // Replace with your image
      category: 'Quests'
    },
    {
      id: 5,
      name: 'Lightning',
      description: 'Complete 5 timed challenges',
      progress: 5,
      total: 5,
      level: 3,
      imageSrc: '/api/placeholder/64/64', // Replace with your image
      category: 'Quizzes'
    },
    {
      id: 6,
      name: 'Guardian',
      description: 'Maintain streak for 30 days',
      progress: 15,
      total: 30,
      level: 1,
      imageSrc: '/api/placeholder/64/64', // Replace with your image
      category: 'Quests'
    }
  ];

  const tabs = ['All Achievements', 'Learning', 'Quizzes', 'Quests'];

  const filteredAchievements = activeTab === 'All Achievements' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === activeTab);

  const getProgressPercentage = (progress: number, total: number): number => {
    return Math.min((progress / total) * 100, 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
        <button className="text-blue-400 hover:text-blue-500 font-semibold text-sm uppercase tracking-wide">
          VIEW ALL
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors text-sm ${
              activeTab === tab
                ? 'bg-yellow-500 text-white shadow-sm'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Achievement Cards Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredAchievements.map((achievement, index) => {
          const progressPercentage = getProgressPercentage(achievement.progress, achievement.total);
          const isCompleted = achievement.progress >= achievement.total;
          
          return (
            <div key={achievement.id}>
              <div className="p-4 flex items-center gap-4">
                {/* Icon Container */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img 
                      src={achievement.imageSrc} 
                      alt={achievement.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to colored div if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const nextElement = target.nextSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 items-center justify-center text-white font-bold text-lg hidden">
                      {achievement.name[0]}
                    </div>
                  </div>
                  {/* Level Badge */}
                  <div className="absolute -bottom-1 -left-1 bg-white rounded-full w-7 h-7 flex items-center justify-center border-2 border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-gray-700">
                      {achievement.level}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 truncate">
                      {achievement.name}
                    </h3>
                    <span className="text-gray-400 font-medium text-sm ml-2 flex-shrink-0">
                      {achievement.progress}/{achievement.total}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="h-2 rounded-full transition-all duration-500 bg-gray-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-gray-500 text-sm">
                    {achievement.description}
                  </p>
                </div>
              </div>

              {/* Separator line (except for last item) */}
              {index < filteredAchievements.length - 1 && (
                <div className="border-b border-gray-200 mx-4"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-gray-500 text-lg">No achievements found in this category</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsUI;