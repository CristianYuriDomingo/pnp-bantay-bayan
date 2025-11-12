import React, { useState } from 'react';
import { Star, Lock, Trophy, Flame, Target, Zap, Crown, Shield, Sparkles } from 'lucide-react';

interface Level {
  id: number;
  title: string;
  type: string;
  icon: React.ElementType;
  color: string;
  points: number;
}

interface QuestPathProps {
  initialLevel?: number;
  initialCompleted?: number[];
}

export default function QuestPath({ initialLevel = 0, initialCompleted = [] }: QuestPathProps) {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [completedLevels, setCompletedLevels] = useState<number[]>(initialCompleted);
  const [pressedLevel, setPressedLevel] = useState<number | null>(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);

  const levels: Level[] = [
    { id: 0, title: "Monday Quest", type: "daily", icon: Star, color: "from-blue-400 to-blue-600", points: 10 },
    { id: 1, title: "Tuesday Quest", type: "daily", icon: Target, color: "from-cyan-400 to-cyan-600", points: 15 },
    { id: 2, title: "Wednesday Quest", type: "daily", icon: Sparkles, color: "from-purple-400 to-purple-600", points: 20 },
    { id: 3, title: "Thursday Quest", type: "daily", icon: Flame, color: "from-orange-400 to-red-500", points: 25 },
    { id: 4, title: "Friday Quest", type: "daily", icon: Shield, color: "from-indigo-400 to-indigo-600", points: 30 },
  ];

  const handleLevelClick = (level: Level) => {
    if (level.id <= currentLevel) {
      if (!completedLevels.includes(level.id)) {
        setCompletedLevels([...completedLevels, level.id]);
        if (level.id === currentLevel && level.id < levels.length - 1) {
          setCurrentLevel(currentLevel + 1);
        }
      }
    }
  };

  const handleMouseDown = (levelId: number) => {
    setPressedLevel(levelId);
  };

  const handleMouseUp = () => {
    setPressedLevel(null);
  };

  const isUnlocked = (levelId: number) => levelId <= currentLevel;
  const isCompleted = (levelId: number) => completedLevels.includes(levelId);
  const isActive = (levelId: number) => levelId === currentLevel && !isCompleted(levelId);

  const totalPoints = completedLevels.reduce((sum, id) => {
    const level = levels.find(l => l.id === id);
    return sum + (level?.points || 0);
  }, 0);

  const allQuestsComplete = completedLevels.length === levels.length;
  const canClaimReward = allQuestsComplete && !rewardClaimed;

  const handleChestClick = () => {
    if (canClaimReward) {
      setRewardClaimed(true);
    }
  };

  // Generate curved path positions
  const getPathPosition = (index: number) => {
    const baseY = index * 120;
    const curve = Math.sin(index * 0.8) * 40;
    return { x: curve, y: baseY };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg sticky top-0 z-50 rounded-b-3xl">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Weekly Quest</h1>
              <p className="text-blue-100 text-sm mt-0.5">Complete all daily challenges</p>
            </div>
            <div 
              className="bg-white rounded-2xl px-5 py-3 shadow-md cursor-pointer relative"
              onMouseEnter={() => setShowStreakPopup(true)}
              onMouseLeave={() => setShowStreakPopup(false)}
            >
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-orange-500" />
                <span className="text-gray-800 text-lg font-bold">{completedLevels.length}</span>
              </div>

              {/* Streak Popup */}
              {showStreakPopup && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl border border-amber-200 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Arrow */}
                  <div className="absolute -top-2 right-6 w-4 h-4 bg-gradient-to-br from-amber-50 to-orange-50 border-l border-t border-amber-200 transform rotate-45"></div>
                  
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-2 rounded-xl shadow-md">
                      <Flame size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-amber-600">{completedLevels.length} day streak</h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {completedLevels.length === 0 
                          ? "Do a lesson today to start a new streak!" 
                          : completedLevels.length === levels.length 
                          ? "Amazing! You've completed all quests!" 
                          : "Keep going! Complete today's quest!"}
                      </p>
                    </div>
                  </div>

                  {/* Week Days */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      {['M', 'T', 'W', 'T', 'F'].map((day, index) => (
                        <div key={index} className="flex flex-col items-center gap-2">
                          <span className={`text-xs font-semibold ${
                            completedLevels.includes(index) 
                              ? 'text-orange-500' 
                              : index === currentLevel 
                              ? 'text-orange-400' 
                              : 'text-gray-400'
                          }`}>
                            {day}
                          </span>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            completedLevels.includes(index)
                              ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-md'
                              : index === currentLevel
                              ? 'bg-gradient-to-br from-orange-200 to-orange-300'
                              : 'bg-gray-200'
                          }`}>
                            {completedLevels.includes(index) ? (
                              <Flame size={18} className="text-white" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-white/50"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Path Container */}
      <div className="max-w-2xl mx-auto px-6 py-12 relative">
        {/* SVG Curved Path */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0E7FF" />
              <stop offset="100%" stopColor="#DBEAFE" />
            </linearGradient>
          </defs>
          <path
            d={levels.map((_, i) => {
              const pos = getPathPosition(i);
              const nextPos = i < levels.length - 1 ? getPathPosition(i + 1) : pos;
              const midY = (pos.y + nextPos.y) / 2;
              const controlX = (pos.x + nextPos.x) / 2;
              
              if (i === 0) {
                return `M ${pos.x + 400} ${pos.y + 100}`;
              }
              return `Q ${controlX + 400} ${midY + 100}, ${nextPos.x + 400} ${nextPos.y + 100}`;
            }).join(' ')}
            stroke="url(#pathGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Levels */}
        <div className="space-y-12 relative" style={{ paddingTop: '50px' }}>
          {levels.map((level, index) => {
            const Icon = level.icon;
            const locked = !isUnlocked(level.id);
            const completed = isCompleted(level.id);
            const active = isActive(level.id);
            const pressed = pressedLevel === level.id;
            const pathPos = getPathPosition(index);

            return (
              <div key={level.id} style={{ marginTop: index > 0 ? '60px' : '0' }}>
                {/* Level Node */}
                <div 
                  className="relative flex items-center"
                  style={{ 
                    transform: `translateX(${pathPos.x}px)`,
                    transition: 'transform 0.5s ease-out'
                  }}
                >
                  {/* Left Info (alternating sides) */}
                  {index % 2 === 0 ? (
                    <>
                      <div className={`flex-1 pr-8 text-right transition-all ${locked ? 'opacity-40' : 'opacity-100'}`}>
                        <div className="inline-block bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
                          <h3 className={`font-bold text-base mb-0.5 ${completed ? 'text-blue-600' : 'text-gray-800'}`}>
                            {level.title}
                          </h3>
                          <span className="text-gray-400 text-xs capitalize font-medium">{level.type}</span>
                        </div>
                      </div>

                      {/* Center Button */}
                      <div className="relative z-10">
                        {/* START label for active level */}
                        {active && !completed && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-green-600 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-md border-2 border-green-500">
                            {level.id === 0 ? 'START' : 'CONTINUE'}
                          </div>
                        )}

                        <button
                          onClick={() => handleLevelClick(level)}
                          onMouseDown={() => handleMouseDown(level.id)}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          disabled={locked}
                          className={`relative w-20 h-20 rounded-full transition-all duration-100 ${
                            locked
                              ? 'bg-gray-200 cursor-not-allowed'
                              : completed
                              ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                              : `bg-gradient-to-br ${level.color}`
                          }`}
                          style={{
                            border: '5px solid white',
                            borderRadius: (pressed && !locked) || completed ? '50%' : '50% 50% 45% 45%',
                            transform: (pressed && !locked) || completed ? 'translateY(6px) scale(0.96)' : 'translateY(0) scale(1)',
                            boxShadow: (pressed && !locked) || completed
                              ? '0 2px 0 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15)'
                              : locked 
                              ? '0 6px 0 0 rgb(209, 213, 219), 0 2px 8px rgba(0,0,0,0.08)' 
                              : '0 8px 0 0 rgba(0,0,0,0.3), 0 2px 12px rgba(0,0,0,0.2)'
                          }}
                        >
                          <div className="flex items-center justify-center h-full">
                            {locked ? (
                              <Lock size={32} className="text-gray-400" />
                            ) : (
                              <Icon size={32} className="text-white drop-shadow-md" />
                            )}
                          </div>

                          {completed && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center border-3 border-white shadow-md z-10">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      </div>

                      <div className="flex-1 pl-8"></div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 pr-8"></div>

                      <div className="relative z-10">
                        {/* START label for active level */}
                        {active && !completed && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-green-600 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-md border-2 border-green-500">
                            {level.id === 0 ? 'START' : 'CONTINUE'}
                          </div>
                        )}

                        <button
                          onClick={() => handleLevelClick(level)}
                          onMouseDown={() => handleMouseDown(level.id)}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          disabled={locked}
                          className={`relative w-20 h-20 rounded-full transition-all duration-100 ${
                            locked
                              ? 'bg-gray-200 cursor-not-allowed'
                              : completed
                              ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                              : `bg-gradient-to-br ${level.color}`
                          }`}
                          style={{
                            border: '5px solid white',
                            borderRadius: (pressed && !locked) || completed ? '50%' : '50% 50% 45% 45%',
                            transform: (pressed && !locked) || completed ? 'translateY(6px) scale(0.96)' : 'translateY(0) scale(1)',
                            boxShadow: (pressed && !locked) || completed
                              ? '0 2px 0 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15)'
                              : locked 
                              ? '0 6px 0 0 rgb(209, 213, 219), 0 2px 8px rgba(0,0,0,0.08)' 
                              : '0 8px 0 0 rgba(0,0,0,0.3), 0 2px 12px rgba(0,0,0,0.2)'
                          }}
                        >
                          <div className="flex items-center justify-center h-full">
                            {locked ? (
                              <Lock size={32} className="text-gray-400" />
                            ) : (
                              <Icon size={32} className="text-white drop-shadow-md" />
                            )}
                          </div>

                          {completed && (
                            <div className="absolute -bottom-1 -left-1 bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center border-3 border-white shadow-md z-10">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      </div>

                      <div className={`flex-1 pl-8 text-left transition-all ${locked ? 'opacity-40' : 'opacity-100'}`}>
                        <div className="inline-block bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
                          <h3 className={`font-bold text-base mb-0.5 ${completed ? 'text-blue-600' : 'text-gray-800'}`}>
                            {level.title}
                          </h3>
                          <span className="text-gray-400 text-xs capitalize font-medium">{level.type}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Treasure Chest */}
          <div style={{ marginTop: '60px', marginBottom: '120px' }}>
            <div 
              className="relative flex items-center justify-center"
              style={{ 
                transform: `translateX(${getPathPosition(levels.length).x}px)`,
                transition: 'transform 0.5s ease-out'
              }}
            >
              <div className="relative z-10">
                <div
                  onClick={handleChestClick}
                  className={`relative w-28 h-28 flex items-center justify-center transition-all duration-300 ${
                    canClaimReward ? 'cursor-pointer hover:scale-110' : allQuestsComplete ? 'opacity-70' : 'opacity-40'
                  }`}
                >
                  {/* Chest SVG */}
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                    {/* Chest base */}
                    <rect x="20" y="45" width="60" height="40" rx="5" fill={rewardClaimed ? "#94a3b8" : allQuestsComplete ? "#fbbf24" : "#9ca3af"} />
                    <rect x="20" y="45" width="60" height="40" rx="5" fill="url(#chestGradient)" opacity="0.8" />
                    
                    {/* Chest lid */}
                    <ellipse cx="50" cy="45" rx="30" ry="12" fill={rewardClaimed ? "#94a3b8" : allQuestsComplete ? "#f59e0b" : "#9ca3af"} />
                    <path d="M 20 45 Q 20 35, 50 30 Q 80 35, 80 45" fill={rewardClaimed ? "#cbd5e1" : allQuestsComplete ? "#fbbf24" : "#d1d5db"} />
                    
                    {/* Lock */}
                    <circle cx="50" cy="55" r="8" fill={rewardClaimed ? "#64748b" : allQuestsComplete ? "#92400e" : "#6b7280"} />
                    <rect x="47" y="55" width="6" height="12" rx="1" fill={rewardClaimed ? "#64748b" : allQuestsComplete ? "#92400e" : "#6b7280"} />
                    
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="chestGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    
                    {/* Sparkles when unlocked */}
                    {allQuestsComplete && !rewardClaimed && (
                      <>
                        <circle cx="15" cy="30" r="2" fill="#fbbf24" opacity="0.8">
                          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="85" cy="35" r="2" fill="#fbbf24" opacity="0.6">
                          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="50" cy="20" r="2" fill="#fbbf24" opacity="0.7">
                          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}
                  </svg>

                  {/* Claimed checkmark */}
                  {rewardClaimed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chest label */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                  <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
                    <h3 className={`font-bold text-base ${rewardClaimed ? 'text-gray-400' : allQuestsComplete ? 'text-amber-600' : 'text-gray-400'}`}>
                      {rewardClaimed ? 'Claimed!' : 'Reward Chest'}
                    </h3>
                    <span className="text-gray-400 text-xs font-medium">
                      {rewardClaimed ? 'Come back next week' : allQuestsComplete ? 'Ready to claim' : 'Complete all quests'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="max-w-3xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 font-semibold text-base">Overall Progress</span>
            <span className="text-blue-600 font-bold text-xl">{Math.round((completedLevels.length / levels.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 rounded-full"
              style={{ width: `${(completedLevels.length / levels.length) * 100}%` }}
            >
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">Complete <span className="text-gray-800 font-semibold">{levels[currentLevel]?.title || 'all quests'}</span> to unlock the next level</p>
          </div>
        </div>
      </div>
    </div>
  );
}