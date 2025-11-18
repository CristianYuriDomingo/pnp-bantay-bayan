// app/users/questFriday/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { useSoundContext } from '@/contexts/sound-context';

interface RankOption {
  id: string;
  rankImage: string;
  orderIndex: number;
}

interface QuestData {
  id: string;
  title: string;
  instruction: string;
  rankOptions: RankOption[];
  userProgress: {
    isCompleted: boolean;
    isCorrect: boolean;
    attempts: number;
    selectedRank: string | null;
  } | null;
}

export default function GuessTheRank() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const { play } = useSoundContext();

  useEffect(() => {
    fetchQuestData();
  }, []);

  const fetchQuestData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/quest/friday');
      const data = await response.json();

      if (data.success && data.data) {
        setQuestData(data.data);
        
        // If user already completed, show win screen
        if (data.data.userProgress?.isCompleted && data.data.userProgress?.isCorrect) {
          setGameWon(true);
        }
      } else {
        console.error('Failed to fetch quest:', data.error);
        alert('Failed to load quest. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching quest:', error);
      alert('Failed to load quest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    play('click');
  };

  const handleDragOver = (e: React.DragEvent, optionId: string) => {
    e.preventDefault();
    setDraggedOver(optionId);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, optionId: string) => {
    e.preventDefault();
    setDraggedOver(null);
    handleAnswer(optionId);
  };

  const handleAnswer = async (optionId: string) => {
    if (showFeedback || submitting || !questData) return;

    play('click');
    setSelectedOption(optionId);
    setSubmitting(true);

    try {
      const response = await fetch('/api/users/quest/friday/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questFridayId: questData.id,
          selectedRankId: optionId
        })
      });

      const data = await response.json();

      if (data.success) {
        const correct = data.data.correct;
        setIsCorrect(correct);
        setShowFeedback(true);

        if (correct) {
          play('correct');
          setTimeout(() => {
            setGameWon(true);
            play('win');
          }, 500);
        } else {
          play('wrong');
        }
      } else {
        alert('Failed to submit answer. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    play('click');
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setDraggedOver(null);
  };

  const handleRestart = async () => {
    if (!questData) return;

    play('click');

    try {
      const response = await fetch('/api/users/quest/friday/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questFridayId: questData.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setSelectedOption(null);
        setShowFeedback(false);
        setIsCorrect(false);
        setGameWon(false);
        setDraggedOver(null);
        
        // Refresh quest data
        await fetchQuestData();
      } else {
        alert('Failed to reset progress. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting progress:', error);
      alert('Failed to reset progress. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Quest...</p>
        </div>
      </div>
    );
  }

  if (!questData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-xl text-gray-800 mb-4">No active quest available</p>
          <button
            onClick={() => {
              play('click');
              window.history.back();
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (gameWon) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <h1 className="text-4xl font-black text-gray-800 mb-2">Perfect!</h1>
            <p className="text-xl text-gray-600 mb-8">You identified the rank correctly!</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  play('click');
                  window.history.back();
                }}
                className="w-full py-4 bg-gradient-to-b from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-transform active:scale-95"
              >
                CONTINUE
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-4 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-2xl font-bold text-lg transition-transform active:scale-95"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                play('click');
                window.history.back();
              }}
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
            >
              <X size={28} className="text-gray-600 sm:w-8 sm:h-8" />
            </button>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800">
              {questData.title}
            </h1>
            <div className="w-10 sm:w-14"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-6 sm:py-10 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] sm:min-h-[calc(100vh-160px)]">
        <div className="w-full">
          {/* Game Area */}
          <div className="flex flex-col items-center mb-8 sm:mb-12 relative">
            {/* Top Insignia Options Row */}
            <div className="flex justify-center gap-4 sm:gap-8 md:gap-20 mb-8 sm:mb-10 md:mb-12 relative z-10 px-2">
              {questData.rankOptions.map((option, index) => (
                <div key={option.id} className="flex flex-col items-center relative">
                  <div
                    onDragOver={(e) => handleDragOver(e, option.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, option.id)}
                    onClick={() => !showFeedback && !submitting && handleAnswer(option.id)}
                    className={`
                      relative w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40
                      bg-white rounded-xl sm:rounded-2xl border-3 sm:border-4 
                      flex items-center justify-center p-2 sm:p-3 md:p-4
                      transition-all shadow-md
                      ${submitting ? 'cursor-wait opacity-50' : 'cursor-pointer'}
                      ${draggedOver === option.id && !showFeedback && !submitting
                        ? 'scale-110 shadow-2xl border-blue-400'
                        : selectedOption === option.id && showFeedback
                        ? isCorrect
                          ? 'border-green-500 shadow-xl'
                          : 'border-red-500 shadow-xl'
                        : 'border-gray-300 hover:scale-105 hover:border-blue-300'
                      }
                      ${showFeedback || submitting ? 'pointer-events-none' : ''}
                    `}
                  >
                    <img 
                      src={option.rankImage}
                      alt={`Rank option ${index + 1}`}
                      className="w-full h-full object-contain select-none"
                      draggable={false}
                    />
                    
                    {/* Check Icon for correct answer */}
                    {selectedOption === option.id && showFeedback && isCorrect && (
                      <div className="absolute -right-2 -top-2 sm:-right-3 sm:-top-3 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                        <Check size={20} className="sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Loading spinner */}
                    {submitting && selectedOption === option.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-xl">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                  
                  {/* Diagonal dotted line - Desktop/Tablet */}
                  <svg 
                    className="absolute top-full left-1/2 pointer-events-none hidden sm:block"
                    style={{
                      width: index === 0 ? '180px' : index === 1 ? '120px' : '180px',
                      height: '180px',
                      transform: 'translateX(-50%) translateY(-10px)'
                    }}
                  >
                    <line
                      x1={index === 0 ? "50%" : index === 1 ? "50%" : "50%"}
                      y1="0"
                      x2={index === 0 ? "100%" : index === 1 ? "50%" : "0%"}
                      y2="160"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="6,6"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Mobile diagonal lines - smaller */}
                  <svg 
                    className="absolute top-full left-1/2 pointer-events-none block sm:hidden"
                    style={{
                      width: index === 0 ? '80px' : index === 1 ? '50px' : '80px',
                      height: '100px',
                      transform: 'translateX(-50%) translateY(-5px)'
                    }}
                  >
                    <line
                      x1={index === 0 ? "50%" : index === 1 ? "50%" : "50%"}
                      y1="0"
                      x2={index === 0 ? "100%" : index === 1 ? "50%" : "0%"}
                      y2="85"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              ))}
            </div>

            {/* Pibi Character - Responsive sizing */}
            <div 
              className={`mb-6 sm:mb-8 relative z-20 ${
                showFeedback || submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-move hover:scale-105 transition-transform active:scale-95'
              }`}
              draggable={!showFeedback && !submitting}
              onDragStart={handleDragStart}
            >
              <img 
                src="/Quest/questWednesday/pibiBack.png"
                alt="Pibi Character"
                className="w-28 h-28 sm:w-36 sm:h-36 md:w-52 md:h-52 object-contain select-none"
                draggable={false}
              />
            </div>

            {/* Instruction text - Responsive sizing */}
            <p className="text-base sm:text-lg md:text-2xl text-gray-900 font-medium text-center px-4">
              Drag Pibi to the {questData.instruction} Rank
            </p>
          </div>

          {/* Feedback Message */}
          {showFeedback && !isCorrect && (
            <div className="mb-6 p-4 md:p-6 rounded-xl md:rounded-2xl bg-red-50 border-2 border-red-200 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 md:gap-3 text-red-700 font-bold text-sm sm:text-base md:text-xl">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0">
                  <X size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span>Not quite right. Try again!</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {showFeedback && !isCorrect && (
            <div className="max-w-md mx-auto px-4">
              <button
                onClick={handleReset}
                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold text-base sm:text-lg shadow-lg transition-transform active:scale-95"
              >
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-4 sm:p-6">
          <div className="flex gap-4 sm:gap-6 items-start">
            <div className="flex-shrink-0 hidden sm:block">
              <img 
                src="/Quest/think.png" 
                alt="Bantay Mascot" 
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">How to Play:</h3>
              <ul className="text-gray-700 space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li>• <strong>Drag & Drop:</strong> Drag Pibi to one of the rank insignia</li>
                <li>• <strong>Click:</strong> Or simply click on a rank insignia to select it</li>
                <li>• <strong>Goal:</strong> Match Pibi with the correct {questData.instruction} rank</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-16 sm:h-20" />
    </div>
  );
}