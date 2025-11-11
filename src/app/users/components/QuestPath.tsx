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

  const levels: Level[] = [
    { id: 0, title: "Monday Quest", type: "daily", icon: Star, color: "from-blue-400 to-blue-600", points: 10 },
    { id: 1, title: "Tuesday Quest", type: "daily", icon: Target, color: "from-cyan-400 to-cyan-600", points: 15 },
    { id: 2, title: "Wednesday Quest", type: "daily", icon: Sparkles, color: "from-purple-400 to-purple-600", points: 20 },
    { id: 3, title: "Thursday Quest", type: "daily", icon: Flame, color: "from-orange-400 to-red-500", points: 25 },
    { id: 4, title: "Friday Quest", type: "daily", icon: Shield, color: "from-indigo-400 to-indigo-600", points: 30 },
    { id: 5, title: "Saturday Quest", type: "weekend", icon: Trophy, color: "from-pink-400 to-rose-500", points: 40 },
    { id: 6, title: "Sunday Quest", type: "weekend", icon: Crown, color: "from-yellow-400 to-amber-500", points: 50 },
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
              <p className="text-blue-100 text-sm mt-0.5">Complete all challenges this week</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white rounded-2xl px-5 py-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Flame size={20} className="text-orange-500" />
                  <span className="text-gray-800 text-lg font-bold">{completedLevels.length}</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl px-5 py-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-500" />
                  <span className="text-gray-800 text-lg font-bold">{totalPoints}</span>
                </div>
              </div>
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
                              ? '0 2px 0 0 rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.08)'
                              : locked 
                              ? '0 6px 0 0 rgb(209, 213, 219), 0 2px 8px rgba(0,0,0,0.08)' 
                              : '0 8px 0 0 rgba(0,0,0,0.15), 0 2px 12px rgba(0,0,0,0.1)'
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
                              ? '0 2px 0 0 rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.08)'
                              : locked 
                              ? '0 6px 0 0 rgb(209, 213, 219), 0 2px 8px rgba(0,0,0,0.08)' 
                              : '0 8px 0 0 rgba(0,0,0,0.15), 0 2px 12px rgba(0,0,0,0.1)'
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
            {completedLevels.length === levels.length ? (
              <p className="text-blue-600 font-bold text-lg">🎉 Quest Complete! You&apos;re a champion!</p>
            ) : (
              <p className="text-gray-500 text-sm">Complete <span className="text-gray-800 font-semibold">{levels[currentLevel]?.title}</span> to unlock the next level</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}