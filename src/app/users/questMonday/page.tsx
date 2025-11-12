// app/users/questMonday/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, RotateCcw } from 'lucide-react';

export default function QuestMonday() {
  const router = useRouter();
  const correctNumber = ['0', '9', '5', '5', '9', '6', '2', '7', '3', '3', '1'];
  const [shuffledDigits] = useState(['5', '5', '9', '6', '2', '7', '3', '3', '1']);
  const [userAnswer, setUserAnswer] = useState<(string | null)[]>(Array(11).fill(null));
  const [selectedDigit, setSelectedDigit] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (userAnswer.every(digit => digit !== null)) {
      setIsComplete(true);
    } else {
      setIsComplete(false);
      setIsCorrect(false);
      setShowFeedback(false);
    }
  }, [userAnswer]);

  const handleCheckAnswer = () => {
    if (isComplete) {
      const correct = userAnswer.every((digit, index) => digit === correctNumber[index]);
      setIsCorrect(correct);
      setShowFeedback(true);
      if (!correct) {
        setAttempts(attempts + 1);
      }
    }
  };

  const handleContinue = () => {
    // Navigate to the next quest or back to quest page
    router.push('/users/quest');
  };

  const handleDigitClick = (digit: string, index: number) => {
    setSelectedDigit(digit);
    setSelectedIndex(index);
  };

  const handleSlotClick = (slotIndex: number) => {
    if (selectedDigit !== null && userAnswer[slotIndex] === null) {
      const newAnswer = [...userAnswer];
      newAnswer[slotIndex] = selectedDigit;
      setUserAnswer(newAnswer);
      setSelectedDigit(null);
      setSelectedIndex(null);
    }
  };

  const handleSlotRemove = (slotIndex: number) => {
    const newAnswer = [...userAnswer];
    newAnswer[slotIndex] = null;
    setUserAnswer(newAnswer);
  };

  const handleReset = () => {
    setUserAnswer(Array(11).fill(null));
    setSelectedDigit(null);
    setSelectedIndex(null);
    setIsComplete(false);
    setIsCorrect(false);
    setShowFeedback(false);
  };

  const isDigitUsed = (digit: string, index: number) => {
    return userAnswer.includes(digit) && 
           userAnswer.indexOf(digit) !== -1 && 
           shuffledDigits.slice(0, index).filter((d: string) => d === digit).length < 
           userAnswer.filter((d: string | null) => d === digit).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[900px]">
        {/* Header */}
        <button
          onClick={() => router.push('/users/quest')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 md:mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="md:w-6 md:h-6" />
          <span className="font-medium text-base md:text-lg">Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border-2 border-gray-100 p-6 md:p-12 mb-6">
          {/* Title */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-3">
              Code the Call
            </h1>
            <p className="text-base md:text-xl text-gray-500">
              Arrange the digits to form a valid PNP mobile number
            </p>
          </div>

          {/* Answer Slots */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-lg md:text-xl font-bold text-gray-700 mb-4 md:mb-6">Build Your Number</h2>
            <div className="flex justify-center gap-1.5 md:gap-3 mb-6 md:mb-8 flex-wrap">
              {userAnswer.map((digit, index) => (
                <div
                  key={index}
                  onClick={() => digit === null && handleSlotClick(index)}
                  className={`
                    relative w-10 h-12 md:w-16 md:h-20 rounded-lg md:rounded-xl flex items-center justify-center text-xl md:text-3xl font-bold
                    transition-all
                    ${digit === null 
                      ? 'bg-gray-100 border-2 border-b-4 border-gray-300 cursor-pointer hover:border-gray-400' 
                      : showFeedback && isCorrect
                      ? 'bg-green-400 border-2 border-b-4 border-green-600 text-white'
                      : showFeedback && !isCorrect
                      ? 'bg-red-400 border-2 border-b-4 border-red-600 text-white'
                      : 'bg-blue-400 border-2 border-b-4 border-blue-600 text-white cursor-pointer hover:bg-blue-500'
                    }
                    ${index === 0 || index === 1 ? 'bg-gray-200 border-gray-400 text-gray-600 cursor-default' : ''}
                  `}
                >
                  {index === 0 ? '0' : index === 1 ? '9' : digit || ''}
                  {digit !== null && index > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlotRemove(index);
                      }}
                      className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold shadow-md"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Shuffled Digits */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-lg md:text-xl font-bold text-gray-700 mb-4 md:mb-6">Shuffled Digits</h2>
            <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
              {shuffledDigits.map((digit, index) => {
                const used = isDigitUsed(digit, index);
                return (
                  <button
                    key={index}
                    onClick={() => !used && handleDigitClick(digit, index)}
                    disabled={used}
                    className={`
                      w-12 h-14 md:w-16 md:h-20 rounded-lg md:rounded-xl text-2xl md:text-3xl font-bold
                      transition-all border-2 border-b-4
                      ${used 
                        ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed' 
                        : selectedIndex === index
                        ? 'bg-yellow-300 border-yellow-500 text-gray-800 -translate-y-1'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:-translate-y-0.5 active:translate-y-0'
                      }
                    `}
                  >
                    {digit}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Message */}
          {showFeedback && isCorrect && (
            <div className="mb-6 md:mb-8 p-4 md:p-6 rounded-xl md:rounded-2xl bg-green-50 border-2 border-green-200">
              <div className="flex items-center justify-center gap-2 md:gap-3 text-green-700 font-bold text-base md:text-xl">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-400 flex items-center justify-center">
                  <Check size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <span>Excellent! You got it right!</span>
              </div>
            </div>
          )}
          
          {showFeedback && !isCorrect && (
            <div className="mb-6 md:mb-8 p-4 md:p-6 rounded-xl md:rounded-2xl bg-red-50 border-2 border-red-200">
              <div className="flex items-center justify-center gap-2 md:gap-3 text-red-700 font-bold text-base md:text-xl">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-400 flex items-center justify-center">
                  <X size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <span>Not quite. Try again!</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 md:gap-4">
            {!isCorrect && (
              <>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 md:px-8 md:py-5 bg-white hover:bg-gray-50 border-2 border-b-4 border-gray-300 text-gray-700 rounded-xl font-bold text-base md:text-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Reset
                </button>
                
                <button
                  onClick={handleCheckAnswer}
                  disabled={!isComplete}
                  className={`flex-1 px-4 py-3 md:px-8 md:py-5 rounded-xl font-bold text-base md:text-lg transition-all border-2 border-b-4
                    ${isComplete 
                      ? 'bg-green-400 hover:bg-green-500 border-green-600 text-white cursor-pointer hover:-translate-y-0.5 active:translate-y-0' 
                      : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  CHECK
                </button>
              </>
            )}
            
            {isCorrect && (
              <button
                onClick={handleContinue}
                className="w-full px-4 py-3 md:px-8 md:py-5 bg-green-400 hover:bg-green-500 border-2 border-b-4 border-green-600 text-white rounded-xl font-bold text-base md:text-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                CONTINUE
              </button>
            )}
          </div>

          {/* Instructions Section with Mascot */}
          <div className="mt-8 md:mt-12 bg-blue-50 rounded-xl md:rounded-2xl border-2 border-blue-200 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center sm:items-start">
              {/* Mascot Image */}
              <div className="flex-shrink-0">
                <img 
                  src="/Quest/think.png" 
                  alt="Bantay Mascot" 
                  className="w-20 h-20 md:w-32 md:h-32 object-contain"
                />
              </div>

              {/* Instructions Text */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-2 md:mb-3 text-base md:text-lg text-center sm:text-left">How to Play:</h3>
                <ul className="text-gray-700 space-y-1.5 md:space-y-2 text-sm md:text-base">
                  <li>1. Click a digit from the "Shuffled Digits" section</li>
                  <li>2. Click an empty slot in "Build Your Number" to place it</li>
                  <li>3. Click the × button on a slot to remove a digit</li>
                  <li>4. Complete all slots and click "CHECK" to verify your answer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {attempts > 0 && (
          <div className="text-center text-sm md:text-base text-gray-500">
            {attempts} attempt{attempts !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}