import React, { useState, useEffect } from 'react';
import { Star, Lock, Trophy, Flame, Target, Zap, Crown, Shield, Sparkles, Ticket, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';

interface QuestStatus {
  day: string;
  canAccess: boolean;
  reason: string;
  isMissed: boolean;
  needsDutyPass: boolean;
}

interface WeeklyQuestData {
  weekReset: boolean;
  weekStartDate: string;
  currentDay: string;
  isWeekend: boolean;
  currentStreak: number;
  longestStreak: number;
  streakBroken: boolean;
  streakMessage: string;
  dutyPasses: number;
  canClaimDutyPass: boolean;
  lastDutyPassClaim: string | null;
  weeklyProgress: {
    completedDays: string[];
    totalQuestsCompleted: number;
    rewardClaimed: boolean;
    rewardXP: number;
    claimedAt: string | null;
  };
  quests: QuestStatus[];
  rewardChest: {
    isLocked: boolean;
    isReady: boolean;
    isClaimed: boolean;
    potentialXP: number;
    canClaim: boolean;
    requiresCompletion: number;
  };
}

interface Level {
  id: number;
  title: string;
  day: string;
  type: string;
  icon: React.ElementType;
  color: string;
  points: number;
  route: string;
  iconImage: string; // Added for static images
}

interface QuestPathProps {
  onNavigate?: (route: string) => void;
}

export default function QuestPath({ onNavigate }: QuestPathProps) {
  const [questData, setQuestData] = useState<WeeklyQuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pressedLevel, setPressedLevel] = useState<number | null>(null);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [showDutyPassPopup, setShowDutyPassPopup] = useState(false);
  const [showMissedQuestModal, setShowMissedQuestModal] = useState(false);
  const [selectedMissedQuest, setSelectedMissedQuest] = useState<{ day: string; index: number } | null>(null);
  const [usingDutyPass, setUsingDutyPass] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [claimingReward, setClaimingReward] = useState(false);
  const [claimingDutyPass, setClaimingDutyPass] = useState(false);

  const levels: Level[] = [
    { 
      id: 0, 
      title: "Monday Quest", 
      day: "monday", 
      type: "daily", 
      icon: Star, 
      color: "from-blue-400 to-blue-600", 
      points: 10, 
      route: "/users/questMonday",
      iconImage: "/Quest/QuestPath/MondayIcon.png" 
    },
    { 
      id: 1, 
      title: "Tuesday Quest", 
      day: "tuesday", 
      type: "daily", 
      icon: Target, 
      color: "from-cyan-400 to-cyan-600", 
      points: 15, 
      route: "/users/questTuesday",
      iconImage: "/Quest/QuestPath/TuesdayIcon.png" 
    },
    { 
      id: 2, 
      title: "Wednesday Quest", 
      day: "wednesday", 
      type: "daily", 
      icon: Sparkles, 
      color: "from-purple-400 to-purple-600", 
      points: 20, 
      route: "/users/questWednesday",
      iconImage: "/Quest/QuestPath/WednesdayIcon.png" 
    },
    { 
      id: 3, 
      title: "Thursday Quest", 
      day: "thursday", 
      type: "daily", 
      icon: Flame, 
      color: "from-orange-400 to-red-500", 
      points: 25, 
      route: "/users/questThursday",
      iconImage: "/Quest/QuestPath/ThursdayIcon.png" 
    },
    { 
      id: 4, 
      title: "Friday Quest", 
      day: "friday", 
      type: "daily", 
      icon: Shield, 
      color: "from-indigo-400 to-indigo-600", 
      points: 30, 
      route: "/users/questFriday",
      iconImage: "/Quest/QuestPath/FridayIcon.png" 
    },
  ];

  useEffect(() => {
    fetchWeeklyStatus();
  }, []);

  const fetchWeeklyStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/users/weekly-quest/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch weekly quest status');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setQuestData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load quest data');
      }
    } catch (err: any) {
      console.error('Error fetching weekly quest status:', err);
      setError(err.message || 'Failed to load quest data');
    } finally {
      setLoading(false);
    }
  };

  const handleLevelClick = (level: Level, questStatus: QuestStatus) => {
    // If quest is missed, show duty pass modal
    if (questStatus.isMissed && questStatus.needsDutyPass) {
      setSelectedMissedQuest({ day: level.day, index: level.id });
      setShowMissedQuestModal(true);
      return;
    }

    // If quest can be accessed, navigate to it
    if (questStatus.canAccess) {
      if (onNavigate) {
        onNavigate(level.route);
      } else {
        window.location.href = level.route;
      }
    }
  };

  const handleUseDutyPass = async () => {
    if (!selectedMissedQuest || !questData) return;

    try {
      setUsingDutyPass(true);
      const response = await fetch('/api/users/weekly-quest/use-duty-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questDay: selectedMissedQuest.day }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to use duty pass');
      }

      // Refresh quest status
      await fetchWeeklyStatus();
      
      // Close modal
      setShowMissedQuestModal(false);
      setSelectedMissedQuest(null);

      // Navigate to unlocked quest
      const level = levels[selectedMissedQuest.index];
      if (onNavigate) {
        onNavigate(level.route);
      } else {
        window.location.href = level.route;
      }
    } catch (err: any) {
      console.error('Error using duty pass:', err);
      alert(err.message || 'Failed to use duty pass');
    } finally {
      setUsingDutyPass(false);
    }
  };

  const handleClaimReward = async () => {
    if (!questData?.rewardChest.canClaim) return;

    try {
      setClaimingReward(true);
      const response = await fetch('/api/users/weekly-quest/claim-reward', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to claim reward');
      }

      // Show success modal
      setShowRewardModal(true);

      // Refresh quest status
      await fetchWeeklyStatus();
    } catch (err: any) {
      console.error('Error claiming reward:', err);
      alert(err.message || 'Failed to claim reward');
    } finally {
      setClaimingReward(false);
    }
  };

  const handleClaimDutyPass = async () => {
    if (!questData?.canClaimDutyPass) return;

    try {
      setClaimingDutyPass(true);
      const response = await fetch('/api/users/duty-pass/claim', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to claim duty pass');
      }

      // Refresh quest status
      await fetchWeeklyStatus();
      
      // Show success message (you could add a toast notification here)
      alert(result.message);
    } catch (err: any) {
      console.error('Error claiming duty pass:', err);
      alert(err.message || 'Failed to claim duty pass');
    } finally {
      setClaimingDutyPass(false);
    }
  };

  const getQuestState = (level: Level): 'locked' | 'available' | 'completed' | 'missed' => {
    if (!questData) return 'locked';

    const questStatus = questData.quests.find(q => q.day === level.day);
    if (!questStatus) return 'locked';

    const isCompleted = questData.weeklyProgress.completedDays.includes(level.day);
    
    if (isCompleted) return 'completed';
    
    // If quest can be accessed (either current day OR unlocked with duty pass), show as available
    if (questStatus.canAccess) return 'available';
    
    // If quest is missed AND needs duty pass, show as missed
    if (questStatus.isMissed && questStatus.needsDutyPass) return 'missed';
    
    // Default to locked
    return 'locked';
  };

  const getPathPosition = (index: number) => {
    const baseY = index * 120;
    const curve = Math.sin(index * 0.8) * 40;
    return { x: curve, y: baseY };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading your quest progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchWeeklyStatus}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!questData) return null;

  const totalPoints = questData.weeklyProgress.totalQuestsCompleted * 50;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg sticky top-0 z-50 rounded-b-3xl">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Weekly Quest</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                {questData.currentDay.charAt(0).toUpperCase() + questData.currentDay.slice(1)}
                {questData.isWeekend && " - Weekend!"}
              </p>
            </div>
            
            {/* Stats Container */}
            <div className="flex items-center gap-3">
              {/* Duty Pass Counter */}
              <div 
                className="bg-white rounded-2xl px-5 py-3 shadow-md cursor-pointer relative"
                onMouseEnter={() => setShowDutyPassPopup(true)}
                onMouseLeave={() => setShowDutyPassPopup(false)}
              >
                <div className="flex items-center gap-2">
                  <Ticket size={20} className="text-blue-500" />
                  <span className="text-gray-800 text-lg font-bold">
                    {questData.dutyPasses}
                  </span>
                </div>

                {/* Duty Pass Popup */}
                {showDutyPassPopup && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-200 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-l border-t border-blue-200 transform rotate-45"></div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-2 rounded-xl shadow-md">
                        <Ticket size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-blue-600">
                          {questData.dutyPasses} Duty {questData.dutyPasses === 1 ? 'Pass' : 'Passes'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {questData.dutyPasses === 0 
                            ? "Claim one every Sunday!" 
                            : "Use to unlock missed quests"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm mb-3">
                      <h4 className="font-semibold text-gray-800 mb-2">How it works:</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>Click on missed quests to unlock them</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>Claim a new pass every Sunday</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>Protects your streak when used</span>
                        </li>
                      </ul>
                    </div>

                    {/* Claim Button */}
                    {questData.canClaimDutyPass && (
                      <button
                        onClick={handleClaimDutyPass}
                        disabled={claimingDutyPass}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {claimingDutyPass ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Ticket size={16} />
                            Claim Sunday Pass
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Streak Counter */}
              <div 
                className="bg-white rounded-2xl px-5 py-3 shadow-md cursor-pointer relative"
                onMouseEnter={() => setShowStreakPopup(true)}
                onMouseLeave={() => setShowStreakPopup(false)}
              >
                <div className="flex items-center gap-2">
                  <Flame size={20} className="text-orange-500" />
                  <span className="text-gray-800 text-lg font-bold">
                    {questData.currentStreak || 0}
                  </span>
                </div>

                {/* Streak Popup */}
                {showStreakPopup && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl border border-amber-200 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-gradient-to-br from-amber-50 to-orange-50 border-l border-t border-amber-200 transform rotate-45"></div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-2 rounded-xl shadow-md">
                        <Flame size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-amber-600">
                          {questData.currentStreak} day streak
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Longest: {questData.longestStreak} days
                        </p>
                      </div>
                    </div>

                    {/* Week Days */}
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        {['M', 'T', 'W', 'T', 'F'].map((day, index) => {
                          const dayName = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'][index];
                          const isCompleted = questData.weeklyProgress.completedDays.includes(dayName);
                          
                          return (
                            <div key={index} className="flex flex-col items-center gap-2">
                              <span className={`text-xs font-semibold ${
                                isCompleted 
                                  ? 'text-orange-500' 
                                  : 'text-gray-400'
                              }`}>
                                {day}
                              </span>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-md'
                                  : 'bg-gray-200'
                              }`}>
                                {isCompleted ? (
                                  <Flame size={18} className="text-white" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-white/50"></div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
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
            const questStatus = questData.quests.find(q => q.day === level.day);
            const state = getQuestState(level);
            const locked = state === 'locked';
            const completed = state === 'completed';
            const missed = state === 'missed';
            const active = state === 'available';
            const pressed = pressedLevel === level.id;
            const pathPos = getPathPosition(index);

            return (
              <div key={level.id} style={{ marginTop: index > 0 ? '60px' : '0' }}>
                <div 
                  className="relative flex items-center"
                  style={{ 
                    transform: `translateX(${pathPos.x}px)`,
                    transition: 'transform 0.5s ease-out'
                  }}
                >
                  {index % 2 === 0 ? (
                    <>
                      <div className={`flex-1 pr-8 text-right transition-all ${locked ? 'opacity-40' : 'opacity-100'}`}>
                        <div className="inline-block bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
                          <h3 className={`font-bold text-base mb-0.5 ${
                            completed ? 'text-blue-600' : missed ? 'text-red-500' : 'text-gray-800'
                          }`}>
                            {level.title}
                          </h3>
                          <span className={`text-xs capitalize font-medium ${
                            missed ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {missed ? 'MISSED' : level.type}
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10">
                        {active && !completed && questStatus?.canAccess && level.day === questData.currentDay && (
                          <div className="relative">
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-br from-green-400 to-green-500 text-white px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap shadow-lg">
                              START
                            </div>
                            {/* Speech bubble tail - simple triangle */}
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-green-500" />
                          </div>
                        )}

                        <button
                          onClick={() => questStatus && handleLevelClick(level, questStatus)}
                          onMouseDown={() => handleMouseDown(level.id)}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          disabled={locked}
                          className={`relative w-20 h-20 rounded-full transition-all duration-100 ${
                            locked
                              ? 'bg-gray-200 cursor-not-allowed'
                              : completed
                              ? 'bg-gradient-to-br from-blue-400 to-blue-500 cursor-pointer'
                              : missed
                              ? 'bg-gradient-to-br from-red-400 to-red-500 cursor-pointer'
                              : `bg-gradient-to-br ${level.color} cursor-pointer hover:scale-105`
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
                              <img 
                                src={level.iconImage} 
                                alt={level.title}
                                className="w-10 h-10 object-contain drop-shadow-md"
                              />
                            )}
                          </div>

                          {completed && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center border-3 border-white shadow-md z-10">
                              <CheckCircle size={20} className="text-white" />
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
                        {active && !completed && questStatus?.canAccess && level.day === questData.currentDay && (
                          <div className="relative">
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-br from-green-400 to-green-500 text-white px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap shadow-lg">
                              START
                            </div>
                            {/* Speech bubble tail - simple triangle */}
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-green-500" />
                          </div>
                        )}

                        <button
                          onClick={() => questStatus && handleLevelClick(level, questStatus)}
                          onMouseDown={() => handleMouseDown(level.id)}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          disabled={locked}
                          className={`relative w-20 h-20 rounded-full transition-all duration-100 ${
                            locked
                              ? 'bg-gray-200 cursor-not-allowed'
                              : completed
                              ? 'bg-gradient-to-br from-blue-400 to-blue-500 cursor-pointer'
                              : missed
                              ? 'bg-gradient-to-br from-red-400 to-red-500 cursor-pointer'
                              : `bg-gradient-to-br ${level.color} cursor-pointer hover:scale-105`
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
                              <img 
                                src={level.iconImage} 
                                alt={level.title}
                                className="w-10 h-10 object-contain drop-shadow-md"
                              />
                            )}
                          </div>

                          {completed && (
                            <div className="absolute -bottom-1 -left-1 bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center border-3 border-white shadow-md z-10">
                              <CheckCircle size={20} className="text-white" />
                            </div>
                          )}
                        </button>
                      </div>

                      <div className={`flex-1 pl-8 text-left transition-all ${locked ? 'opacity-40' : 'opacity-100'}`}>
                        <div className="inline-block bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
                          <h3 className={`font-bold text-base mb-0.5 ${
                            completed ? 'text-blue-600' : missed ? 'text-red-500' : 'text-gray-800'
                          }`}>
                            {level.title}
                          </h3>
                          <span className={`text-xs capitalize font-medium ${
                            missed ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {missed ? 'MISSED' : level.type}
                          </span>
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
                  onClick={handleClaimReward}
                  className={`relative w-28 h-28 flex items-center justify-center transition-all duration-300 ${
                    questData.rewardChest.canClaim ? 'cursor-pointer hover:scale-110' : questData.rewardChest.isClaimed ? 'opacity-70' : 'opacity-40'
                  }`}
                >
                  {/* Chest SVG */}
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                    {/* Chest base */}
                    <rect x="20" y="45" width="60" height="40" rx="5" fill={questData.rewardChest.isClaimed ? "#94a3b8" : questData.rewardChest.isReady ? "#fbbf24" : "#9ca3af"} />
                    <rect x="20" y="45" width="60" height="40" rx="5" fill="url(#chestGradient)" opacity="0.8" />
                    
                    {/* Chest lid */}
                    <ellipse cx="50" cy="45" rx="30" ry="12" fill={questData.rewardChest.isClaimed ? "#94a3b8" : questData.rewardChest.isReady ? "#f59e0b" : "#9ca3af"} />
                    <path d="M 20 45 Q 20 35, 50 30 Q 80 35, 80 45" fill={questData.rewardChest.isClaimed ? "#cbd5e1" : questData.rewardChest.isReady ? "#fbbf24" : "#d1d5db"} />
                    
                    {/* Lock */}
                    <circle cx="50" cy="55" r="8" fill={questData.rewardChest.isClaimed ? "#64748b" : questData.rewardChest.isReady ? "#92400e" : "#6b7280"} />
                    <rect x="47" y="55" width="6" height="12" rx="1" fill={questData.rewardChest.isClaimed ? "#64748b" : questData.rewardChest.isReady ? "#92400e" : "#6b7280"} />
                    
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="chestGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    
                    {/* Sparkles when unlocked */}
                    {questData.rewardChest.isReady && !questData.rewardChest.isClaimed && (
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
                  {questData.rewardChest.isClaimed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                        <CheckCircle size={32} className="text-white" />
                      </div>
                    </div>
                  )}

                  {/* Claiming spinner */}
                  {claimingReward && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="animate-spin text-amber-500" size={32} />
                    </div>
                  )}
                </div>

                {/* Chest label */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                  <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
                    <h3 className={`font-bold text-base ${questData.rewardChest.isClaimed ? 'text-gray-400' : questData.rewardChest.isReady ? 'text-amber-600' : 'text-gray-400'}`}>
                      {questData.rewardChest.isClaimed ? 'Claimed!' : 'Reward Chest'}
                    </h3>
                    <span className="text-gray-400 text-xs font-medium">
                      {questData.rewardChest.isClaimed 
                        ? 'Come back next week' 
                        : questData.rewardChest.isReady 
                        ? `${questData.rewardChest.potentialXP} XP ready!` 
                        : `${questData.rewardChest.requiresCompletion} more quest${questData.rewardChest.requiresCompletion !== 1 ? 's' : ''}`}
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
            <span className="text-gray-600 font-semibold text-base">Weekly Progress</span>
            <span className="text-blue-600 font-bold text-xl">
              {questData.weeklyProgress.totalQuestsCompleted}/5 Complete
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 rounded-full"
              style={{ width: `${(questData.weeklyProgress.totalQuestsCompleted / 5) * 100}%` }}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              {questData.weeklyProgress.totalQuestsCompleted === 5 
                ? 'Perfect week! Claim your reward!' 
                : `Complete ${5 - questData.weeklyProgress.totalQuestsCompleted} more quest${5 - questData.weeklyProgress.totalQuestsCompleted !== 1 ? 's' : ''} to unlock the reward chest`}
            </p>
          </div>
        </div>
      </div>

      {/* Missed Quest Modal */}
      {showMissedQuestModal && selectedMissedQuest && (
        <>
          {/* Full Page Backdrop with Blur */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-40 transition-opacity"
            onClick={() => {
              setShowMissedQuestModal(false);
              setSelectedMissedQuest(null);
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="bg-gradient-to-br from-red-50 via-orange-50 to-red-100 rounded-3xl shadow-2xl max-w-md w-full transform transition-all relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Header */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-t-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative text-center">
               
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Missed Quest!
                  </h2>
                  <p className="text-red-100 text-sm">
                    Use a Duty Pass to continue
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-700 text-center mb-6 leading-relaxed">
                  You missed{' '}
                  <span className="font-bold text-red-600">
                    {selectedMissedQuest.day.charAt(0).toUpperCase() + selectedMissedQuest.day.slice(1)}'s
                  </span>{' '}
                  quest. Use <span className="font-bold">1 Duty Pass</span> to unlock and maintain your streak?
                </p>

                {/* Duty Pass Counter */}
                <div className="bg-white bg-opacity-70 rounded-xl p-4 mb-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700">
                      <img 
                        src="/Quest/QuestPath/DutyPass.png" 
                        alt="Duty Pass" 
                        className="w-5 h-5 object-contain mr-2"
                      />
                      <span className="font-medium">Duty Passes:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-xl">{questData.dutyPasses}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-bold text-blue-600 text-xl">{questData.dutyPasses - 1}</span>
                    </div>
                  </div>
                </div>

                {/* Warning for no passes */}
                {questData.dutyPasses <= 0 && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-6 flex items-start">
                    <AlertCircle size={20} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700">
                      <p className="font-semibold">No Duty Passes available!</p>
                      <p className="text-xs mt-1">Claim one on Sunday or maintain your daily streak.</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowMissedQuestModal(false);
                      setSelectedMissedQuest(null);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    disabled={usingDutyPass}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleUseDutyPass}
                    disabled={usingDutyPass || questData.dutyPasses <= 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {usingDutyPass ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Using Pass...</span>
                      </>
                    ) : (
                      <>
                        <img 
                          src="/Quest/QuestPath/DutyPass.png" 
                          alt="Duty Pass" 
                          className="w-5 h-5 object-contain"
                        />
                        <span>Use Duty Pass</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reward Claim Success Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Trophy size={40} className="text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                 Congratulations!
              </h2>
              
              <p className="text-gray-600 mb-4">
                You've completed all weekly quests!
              </p>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 mb-6">
                <div className="text-5xl font-bold text-amber-600 mb-2">
                  +{questData.rewardChest.potentialXP} XP
                </div>
                <p className="text-amber-700 font-semibold">
                  {questData.weeklyProgress.totalQuestsCompleted === 5 ? 'Perfect Week Bonus!' : 'Weekly Reward'}
                </p>
              </div>

              <button
                onClick={() => setShowRewardModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handleMouseDown(levelId: number) {
    setPressedLevel(levelId);
  }

  function handleMouseUp() {
    setPressedLevel(null);
  }
}