// app/users/questMonday/page.tsx
'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface RankOption {
  id: string;
  label: string;
  isCorrect: boolean;
  image: string;
}

const rankOptions: RankOption[] = [
  { id: '1', label: 'POLICE MASTER SERGEANT', isCorrect: false, image: '/Quest/insignia-1.png' },
  { id: '2', label: 'POLICE CORPORAL', isCorrect: true, image: '/Quest/insignia-2.png' },
  { id: '3', label: 'PATROLMAN', isCorrect: false, image: '/Quest/insignia-3.png' },
];

export default function GuessTheRank() {
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
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

  const handleAnswer = (optionId: string) => {
    if (showFeedback) return;

    setSelectedOption(optionId);
    const option = rankOptions.find(opt => opt.id === optionId);
    const correct = option?.isCorrect || false;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    setAttempts(attempts + 1);

    if (correct) {
      setGameWon(true);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setDraggedOver(null);
  };

  const handleRestart = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setAttempts(0);
    setGameWon(false);
    setDraggedOver(null);
  };

  if (gameWon) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <h1 className="text-4xl font-black text-gray-800 mb-2">Perfect!</h1>
            <p className="text-xl text-gray-600 mb-8">You identified the rank correctly!</p>
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
      {/* Top Bar - Matching Tuesday/Wednesday/Thursday style */}
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
              Guess The Rank
            </h1>
            <div className="w-10 sm:w-14"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] sm:min-h-[calc(100vh-160px)]">
        <div className="w-full">
          {/* Game Area */}
          <div className="flex flex-col items-center mb-12 relative">
            {/* Top Insignia Options Row */}
            <div className="flex justify-center gap-12 md:gap-20 mb-12 relative z-10">
              {rankOptions.map((option, index) => (
                <div key={option.id} className="flex flex-col items-center relative">
                  <div
                    onDragOver={(e) => handleDragOver(e, option.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, option.id)}
                    onClick={() => !showFeedback && handleAnswer(option.id)}
                    className={`
                      relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl border-4 
                      flex items-center justify-center p-4
                      transition-all cursor-pointer shadow-md
                      ${draggedOver === option.id && !showFeedback
                        ? 'scale-110 shadow-2xl border-blue-400'
                        : selectedOption === option.id && showFeedback
                        ? isCorrect
                          ? 'border-green-500 shadow-xl'
                          : 'border-red-500 shadow-xl'
                        : 'border-gray-300 hover:scale-105 hover:border-blue-300'
                      }
                      ${showFeedback ? 'cursor-default' : ''}
                    `}
                  >
                    {/* Insignia images */}
                    <img 
                      src={option.image}
                      alt={option.label}
                      className="w-full h-full object-contain select-none"
                      draggable={false}
                    />
                    
                    {/* Check Icon for correct answer */}
                    {selectedOption === option.id && showFeedback && isCorrect && (
                      <div className="absolute -right-3 -top-3 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                        <Check size={28} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  
                  {/* Diagonal dotted line */}
                  <svg 
                    className="absolute top-full left-1/2 pointer-events-none"
                    style={{
                      width: index === 0 ? '180px' : index === 1 ? '120px' : '180px',
                      height: '180px',
                      transform: index === 0 
                        ? 'translateX(-50%) translateY(-10px)' 
                        : index === 2 
                        ? 'translateX(-50%) translateY(-10px)' 
                        : 'translateX(-50%) translateY(-10px)'
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
                </div>
              ))}
            </div>

            {/* Pibi Character */}
            <div 
              className={`mb-8 relative z-20 ${
                showFeedback ? 'opacity-50 cursor-not-allowed' : 'cursor-move hover:scale-105 transition-transform'
              }`}
              draggable={!showFeedback}
              onDragStart={handleDragStart}
            >
              <img 
                src="/Quest/questWednesday/pibiBack.png"
                alt="Pibi Character"
                className="w-40 h-40 md:w-52 md:h-52 object-contain select-none"
                draggable={false}
              />
            </div>

            <p className="text-xl md:text-2xl text-gray-900 font-medium text-center">
              Drag Pibi to the Police Corporal Rank
            </p>
          </div>

          {/* Feedback Message */}
          {showFeedback && !isCorrect && (
            <div className="mb-6 p-4 md:p-6 rounded-xl md:rounded-2xl bg-red-50 border-2 border-red-200">
              <div className="flex items-center justify-center gap-2 md:gap-3 text-red-700 font-bold text-base md:text-xl">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-400 flex items-center justify-center">
                  <X size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <span>Not quite right. Try again!</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {showFeedback && !isCorrect && (
            <button
              onClick={handleReset}
              className="w-full px-8 py-5 bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-transform active:scale-95"
            >
              TRY AGAIN
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6">
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <img 
                src="/Quest/think.png" 
                alt="Bantay Mascot" 
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-3 text-lg">How to Play:</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• <strong>Drag & Drop:</strong> Drag Pibi to one of the rank insignia</li>
                <li>• <strong>Click:</strong> Or simply click on a rank insignia to select it</li>
                <li>• <strong>Goal:</strong> Match Pibi with the correct Police Corporal rank</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-20" />
    </div>
  );
}