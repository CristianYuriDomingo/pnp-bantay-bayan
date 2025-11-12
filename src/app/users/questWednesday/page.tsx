// app/users/questWednesday/page.tsx
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, X, Trophy, RotateCcw } from 'lucide-react';

interface RankOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

const rankOptions: RankOption[] = [
  { id: '1', label: 'PATROLMAN', isCorrect: false },
  { id: '2', label: 'POLICE OFFICER III', isCorrect: false },
  { id: '3', label: 'SENIOR POLICE OFFICER I', isCorrect: true },
  { id: '4', label: 'SENIOR POLICE OFFICER III', isCorrect: false },
  { id: '5', label: 'POLICE MASTER SERGEANT', isCorrect: false },
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-yellow-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 flex items-center justify-center animate-bounce">
              <Trophy size={64} className="text-yellow-600" />
            </div>
            <h1 className="text-4xl font-black text-gray-800 mb-2">Perfect!</h1>
            <p className="text-xl text-gray-600 mb-2">You identified the rank correctly!</p>
            <p className="text-lg text-gray-500 mb-8">Attempts: {attempts}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium text-lg">Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 p-6 md:p-12">
          {/* Title */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              GUESS THE RANK
            </h1>
            <p className="text-lg md:text-xl text-gray-500">
              Drag the insignia to the correct rank
            </p>
          </div>

          {/* Game Area */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-8">
            {/* Left Side - Insignia */}
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-xl font-bold text-gray-700 mb-6">What rank is this?</h2>
              <div 
                className={`bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 border-4 border-blue-300 ${
                  showFeedback ? 'opacity-50 cursor-not-allowed' : 'cursor-move hover:shadow-lg transition-shadow'
                }`}
                draggable={!showFeedback}
                onDragStart={handleDragStart}
              >
                {/* Insignia Image - Replace with your actual image */}
                <div className="w-48 h-48 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Simple chevron insignia representation */}
                    <polygon points="100,40 160,80 140,80 100,60 60,80 40,80" fill="#1e40af" />
                    <polygon points="100,70 160,110 140,110 100,90 60,110 40,110" fill="#1e40af" />
                    <polygon points="100,100 160,140 140,140 100,120 60,140 40,140" fill="#1e40af" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 italic">
                {showFeedback ? '✓ Dropped' : '👆 Drag me to an option'}
              </p>
            </div>

            {/* Right Side - Options */}
            <div className="flex flex-col justify-center gap-3">
              {rankOptions.map((option) => (
                <div
                  key={option.id}
                  onDragOver={(e) => handleDragOver(e, option.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, option.id)}
                  onClick={() => !showFeedback && handleAnswer(option.id)}
                  className={`
                    relative p-4 md:p-5 rounded-xl font-bold text-base md:text-lg text-center
                    transition-all cursor-pointer border-2 border-b-4
                    ${draggedOver === option.id && !showFeedback
                      ? 'bg-yellow-100 border-yellow-400 scale-105 shadow-lg'
                      : selectedOption === option.id && showFeedback
                      ? isCorrect
                        ? 'bg-green-400 border-green-600 text-white'
                        : 'bg-red-400 border-red-600 text-white'
                      : 'bg-blue-50 border-blue-300 text-gray-700 hover:bg-blue-100 hover:scale-102'
                    }
                    ${showFeedback ? 'cursor-default' : ''}
                  `}
                >
                  {option.label}
                  
                  {/* Check/X Icon for selected answer */}
                  {selectedOption === option.id && showFeedback && (
                    <div className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                      {isCorrect ? (
                        <Check size={20} className="text-green-500" />
                      ) : (
                        <X size={20} className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Message */}
          {showFeedback && isCorrect && (
            <div className="mb-6 p-6 rounded-2xl bg-green-50 border-2 border-green-200">
              <div className="flex items-center justify-center gap-3 text-green-700 font-bold text-xl">
                <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center">
                  <Check size={24} className="text-white" />
                </div>
                <span>Excellent! That's the correct rank!</span>
              </div>
            </div>
          )}
          
          {showFeedback && !isCorrect && (
            <div className="mb-6 p-6 rounded-2xl bg-red-50 border-2 border-red-200">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 text-red-700 font-bold text-xl">
                  <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center">
                    <X size={24} className="text-white" />
                  </div>
                  <span>Not quite right. Try again!</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {showFeedback && !isCorrect && (
            <button
              onClick={handleReset}
              className="w-full px-8 py-5 bg-blue-400 hover:bg-blue-500 border-2 border-b-4 border-blue-600 text-white rounded-xl font-bold text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <RotateCcw size={24} />
              TRY AGAIN
            </button>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-2xl border-2 border-blue-200 p-6">
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
                  <li>• <strong>Drag & Drop:</strong> Drag the insignia to one of the rank options</li>
                  <li>• <strong>Click:</strong> Or simply click on a rank option to select it</li>
                  <li>• <strong>Goal:</strong> Match the insignia with its correct rank name</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {attempts > 0 && (
          <div className="text-center text-base text-gray-500 mt-4">
            Attempts: {attempts}
          </div>
        )}
      </div>
    </div>
  );
}