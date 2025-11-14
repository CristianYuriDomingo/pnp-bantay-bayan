// app/users/questMonday/page.tsx
'use client';

import React, { useState } from 'react';
import { X, Check, Star } from 'lucide-react';

interface Suspect {
  id: string;
  image: string;
  isCorrect: boolean;
}

interface Level {
  level: number;
  description: string;
  suspects: Suspect[];
}

const levels: Level[] = [
  {
    level: 1,
    description: "Wearing red cap, tattoo on right arm",
    suspects: [
      { id: '1', image: '/Quest/questFriday/suspect1.png', isCorrect: false },
      { id: '2', image: '/Quest/questFriday/suspect2.png', isCorrect: true },
      { id: '3', image: '/Quest/questFriday/suspect3.png', isCorrect: false },
      { id: '4', image: '/Quest/questFriday/suspect4.png', isCorrect: false },
    ]
  },
  {
    level: 2,
    description: "Wearing blue jacket, has glasses",
    suspects: [
      { id: '5', image: '/Quest/questFriday/suspect5.png', isCorrect: false },
      { id: '6', image: '/Quest/questFriday/suspect6.png', isCorrect: false },
      { id: '7', image: '/Quest/questFriday/suspect7.png', isCorrect: true },
      { id: '8', image: '/Quest/questFriday/suspect8.png', isCorrect: false },
    ]
  },
  {
    level: 3,
    description: "Wearing green shirt, has beard",
    suspects: [
      { id: '9', image: '/Quest/questFriday/suspect9.png', isCorrect: true },
      { id: '10', image: '/Quest/questFriday/suspect10.png', isCorrect: false },
      { id: '11', image: '/Quest/questFriday/suspect11.png', isCorrect: false },
      { id: '12', image: '/Quest/questFriday/suspect12.png', isCorrect: false },
    ]
  }
];

export default function QuestFriday() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameFailed, setGameFailed] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  const currentLevelData = levels[currentLevel];

  const handleSuspectClick = (suspectImage: string) => {
    if (showFeedback) return;
    setSelectedSuspect(suspectImage);
  };

  const handleAccuse = () => {
    if (!selectedSuspect || showFeedback) return;

    const suspect = currentLevelData.suspects.find(s => s.image === selectedSuspect);
    const correct = suspect?.isCorrect || false;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const newCompletedLevels = [...completedLevels, currentLevel + 1];
      setCompletedLevels(newCompletedLevels);

      setTimeout(() => {
        if (currentLevel < levels.length - 1) {
          // Move to next level
          setCurrentLevel(currentLevel + 1);
          setSelectedSuspect(null);
          setShowFeedback(false);
          setIsCorrect(false);
        } else {
          // All levels completed
          setGameWon(true);
        }
      }, 1500);
    } else {
      // Wrong answer - show failed modal after delay
      setTimeout(() => {
        setGameFailed(true);
      }, 1500);
    }
  };

  const handleRestart = () => {
    setCurrentLevel(0);
    setSelectedSuspect(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setGameWon(false);
    setGameFailed(false);
    setCompletedLevels([]);
  };

  // Game Failed Screen
  if (gameFailed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-400 to-red-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6">
              <img 
                src="/Quest/questFriday/jailed.png" 
                alt="Jailed" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ef4444" width="100" height="100" rx="10"/><text x="50" y="65" font-size="60" text-anchor="middle" fill="white">✕</text></svg>';
                }}
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">You're Jailed!</h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              False accusation detected!
            </p>
            <button
              onClick={handleRestart}
              className="w-full py-4 bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-transform active:scale-95"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Won Screen
  if (gameWon) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6">
              <img 
                src="/Quest/questFriday/detained.png" 
                alt="Suspect Detained" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2322c55e" width="100" height="100" rx="10"/><text x="50" y="70" font-size="60" text-anchor="middle" fill="white">✓</text></svg>';
                }}
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">Congrats!</h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8">Suspects detained successfully!</p>
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
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
              onClick={() => window.history.back()}
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
            >
              <X size={28} className="text-gray-600 sm:w-8 sm:h-8" />
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              Suspect Line-Up
            </h1>
            {/* Level Progress */}
            <div className="flex gap-2">
              {levels.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all ${
                    completedLevels.includes(index + 1)
                      ? 'bg-green-500 text-white'
                      : index === currentLevel
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {completedLevels.includes(index + 1) ? (
                    <Check size={20} className="sm:w-6 sm:h-6" />
                  ) : (
                    index + 1
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full">
          {/* Level Badge */}
          <div className="text-center mb-4">
            <span className="inline-block px-6 py-2 bg-blue-500 text-white rounded-full font-bold text-lg">
              Level {currentLevel + 1} of {levels.length}
            </span>
          </div>

          {/* Description Box */}
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 bg-gray-100 rounded-2xl p-4 sm:p-6 border-2 border-gray-300">
            <p className="text-base sm:text-lg md:text-xl text-gray-800 text-center font-medium">
              <strong>Suspect Description:</strong> {currentLevelData.description}
            </p>
          </div>

          {/* Suspects Line-Up */}
          {/* Mobile: 2x2 Grid, Desktop: Horizontal Line with Height Chart */}
          <div className="mb-8 sm:mb-12">
            {/* Mobile Grid Layout */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:hidden">
              {currentLevelData.suspects.map((suspect, index) => (
                <div
                  key={suspect.id}
                  onClick={() => handleSuspectClick(suspect.image)}
                  className={`
                    relative flex flex-col items-center justify-center cursor-pointer transition-all
                    ${!showFeedback && 'hover:scale-105 active:scale-95'}
                    ${showFeedback && selectedSuspect === suspect.image && isCorrect && 'scale-105'}
                    ${showFeedback && selectedSuspect === suspect.image && !isCorrect && 'opacity-50'}
                    ${showFeedback ? 'cursor-default' : ''}
                  `}
                >
                  {/* Character Image with Border when Selected */}
                  <div className={`
                    relative rounded-2xl transition-all w-full
                    ${selectedSuspect === suspect.image && !showFeedback
                      ? 'ring-4 ring-blue-500 bg-blue-50 p-2'
                      : 'bg-white p-2'
                    }
                  `}>
                    <img
                      src={suspect.image}
                      alt={`Suspect ${index + 1}`}
                      className="w-full h-auto aspect-[3/4] object-contain select-none"
                      draggable={false}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect fill="%23f3f4f6" width="200" height="300"/><circle cx="100" cy="90" r="35" fill="%239ca3af"/><ellipse cx="100" cy="200" rx="60" ry="90" fill="%239ca3af"/></svg>';
                      }}
                    />

                    {/* Correct Indicator */}
                    {selectedSuspect === suspect.image && showFeedback && isCorrect && (
                      <div className="absolute -right-2 -top-2 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-xl animate-pulse z-10">
                        <Check size={24} className="text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Wrong Indicator */}
                    {selectedSuspect === suspect.image && showFeedback && !isCorrect && (
                      <div className="absolute -right-2 -top-2 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-xl z-10">
                        <X size={24} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Suspect Number Label */}
                  <div className="mt-2 text-sm font-bold text-gray-600">
                    Suspect {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Horizontal Layout with Height Chart */}
            <div className="hidden md:block relative px-4 py-8 lg:py-12 bg-gray-50 rounded-2xl overflow-hidden" style={{ minHeight: '400px' }}>
              {/* Height Chart Background Lines */}
              <div className="absolute inset-0 flex flex-col justify-around py-12 pointer-events-none">
                {['6ft', '5ft', '4ft', '3ft'].map((height, index) => (
                  <div key={height} className="flex items-center w-full px-6 lg:px-8">
                    <span className="text-base lg:text-lg font-semibold text-gray-600 w-16">{height}</span>
                    <div className="flex-1" style={{
                      height: index % 2 === 0 ? '3px' : '1.5px',
                      backgroundColor: index % 2 === 0 ? '#000' : '#d1d5db'
                    }}></div>
                  </div>
                ))}
              </div>

              {/* Suspects */}
              <div className="relative flex justify-center items-end gap-8 lg:gap-12 z-10">
                {currentLevelData.suspects.map((suspect, index) => (
                  <div
                    key={suspect.id}
                    onClick={() => handleSuspectClick(suspect.image)}
                    className={`
                      relative flex flex-col items-center justify-end cursor-pointer transition-all
                      ${!showFeedback && 'hover:scale-105'}
                      ${showFeedback && selectedSuspect === suspect.image && isCorrect && 'scale-110'}
                      ${showFeedback && selectedSuspect === suspect.image && !isCorrect && 'opacity-50'}
                      ${showFeedback ? 'cursor-default' : ''}
                    `}
                    style={{ 
                      minHeight: '350px',
                      flex: '1 1 0',
                      maxWidth: '200px'
                    }}
                  >
                    {/* Character Image with Border when Selected */}
                    <div className={`
                      relative rounded-2xl transition-all w-full
                      ${selectedSuspect === suspect.image && !showFeedback
                        ? 'ring-4 ring-blue-500 bg-blue-50 p-2'
                        : ''
                      }
                    `}>
                      <img
                        src={suspect.image}
                        alt={`Suspect ${index + 1}`}
                        className="w-full h-auto max-h-[350px] lg:max-h-[400px] object-contain object-bottom select-none"
                        draggable={false}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect fill="%23f3f4f6" width="200" height="300"/><circle cx="100" cy="90" r="35" fill="%239ca3af"/><ellipse cx="100" cy="200" rx="60" ry="90" fill="%239ca3af"/></svg>';
                        }}
                      />

                      {/* Correct Indicator */}
                      {selectedSuspect === suspect.image && showFeedback && isCorrect && (
                        <div className="absolute -right-2 -top-2 w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-xl animate-pulse">
                          <Check size={32} className="text-white" strokeWidth={3} />
                        </div>
                      )}

                      {/* Wrong Indicator */}
                      {selectedSuspect === suspect.image && showFeedback && !isCorrect && (
                        <div className="absolute -right-2 -top-2 w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-xl">
                          <X size={32} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accuse Button */}
          {!showFeedback && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <button
                onClick={handleAccuse}
                disabled={!selectedSuspect}
                className={`
                  px-12 sm:px-16 py-4 sm:py-5 text-white rounded-full font-bold text-lg sm:text-xl md:text-2xl shadow-xl transition-all active:scale-95
                  ${selectedSuspect
                    ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                    : 'bg-gray-400 cursor-not-allowed opacity-50'
                  }
                `}
              >
                ACCUSE NOW
              </button>
            </div>
          )}

          {/* Feedback Message */}
          {showFeedback && !isCorrect && (
            <div className="mb-6 p-4 md:p-6 rounded-xl md:rounded-2xl bg-red-50 border-2 border-red-200 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 md:gap-3 text-red-700 font-bold text-base md:text-xl">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-400 flex items-center justify-center">
                  <X size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <span>Wrong suspect! You'll be jailed for false accusation!</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {showFeedback && isCorrect && (
            <div className="mb-6 p-4 md:p-6 rounded-xl md:rounded-2xl bg-green-50 border-2 border-green-200 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 md:gap-3 text-green-700 font-bold text-base md:text-xl">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-400 flex items-center justify-center">
                  <Check size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <span>
                  {currentLevel < levels.length - 1 
                    ? 'Correct! Moving to next suspect...' 
                    : 'Correct! All suspects detained!'}
                </span>
              </div>
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
              <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">How to Play: Catch the Right Suspects!</h3>
              <ul className="text-gray-700 space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li>• <strong>Read:</strong> Check the suspect description carefully</li>
                <li>• <strong>Select:</strong> Click on the suspect that matches the description</li>
                <li>• <strong>Accuse:</strong> Press the "ACCUSE NOW" button to confirm your choice</li>
                <li>• <strong>Warning:</strong> One wrong accusation and you'll be jailed!</li>
                <li>• <strong>Levels:</strong> Complete all 3 levels to win the game</li>
                <li>• <strong>Goal:</strong> Identify all correct suspects without mistakes</li>
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