// app/users/questWednesday/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface QuestData {
  id: string;
  title: string;
  description: string;
  networkName: string;
  shuffledDigits: string[];
  userProgress: {
    isCompleted: boolean;
    attempts: number;
    completedAt: Date | null;
  } | null;
}

export default function QuestWednesday() {
  const router = useRouter();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questData, setQuestData] = useState<QuestData | null>(null);
  
  // Game state
  const [shuffledDigits, setShuffledDigits] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<(string | null)[]>(Array(11).fill(null));
  const [selectedDigit, setSelectedDigit] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  // Fetch quest data on mount
  useEffect(() => {
    fetchQuestData();
  }, []);

  const fetchQuestData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users/quest/wednesday');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch quest');
      }

      if (result.success && result.data) {
        setQuestData(result.data);
        setShuffledDigits(result.data.shuffledDigits);
        
        // Set attempts from progress
        if (result.data.userProgress) {
          setAttempts(result.data.userProgress.attempts);
          
          // If already completed, show success state
          if (result.data.userProgress.isCompleted) {
            setIsCorrect(true);
            setShowFeedback(true);
            setIsComplete(true);
          }
        }
        
        // Initialize answer slots with first two digits (0 and 9)
        const initialAnswer = Array(11).fill(null);
        initialAnswer[0] = '0';
        initialAnswer[1] = '9';
        setUserAnswer(initialAnswer);
      }

    } catch (err) {
      console.error('Error fetching quest:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quest');
    } finally {
      setLoading(false);
    }
  };

  // Check if all slots are filled
  useEffect(() => {
    if (userAnswer.every(digit => digit !== null)) {
      setIsComplete(true);
    } else {
      setIsComplete(false);
      setIsCorrect(false);
      setShowFeedback(false);
    }
  }, [userAnswer]);

  const handleCheckAnswer = async () => {
    if (!isComplete || !questData) return;

    try {
      setSubmitting(true);
      
      // Extract the 9 digits after "09"
      const userNineDigits = userAnswer.slice(2);
      
      const response = await fetch('/api/users/quest/wednesday/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questWednesdayId: questData.id,
          userAnswer: userNineDigits
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit answer');
      }

      if (result.success) {
        setIsCorrect(result.data.correct);
        setShowFeedback(true);
        
        if (result.data.correct) {
          // Success!
          console.log('Quest completed!');
        } else {
          // Wrong answer
          setAttempts(result.data.attempts);
        }
      }

    } catch (err) {
      console.error('Error submitting answer:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
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
    const resetAnswer = Array(11).fill(null);
    resetAnswer[0] = '0';
    resetAnswer[1] = '9';
    setUserAnswer(resetAnswer);
    setSelectedDigit(null);
    setSelectedIndex(null);
    setIsComplete(false);
    setIsCorrect(false);
    setShowFeedback(false);
  };

  const handlePlayAgain = async () => {
    if (!questData) return;

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/users/quest/wednesday/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questWednesdayId: questData.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset progress');
      }

      // Reset all game state
      handleReset();
      setAttempts(0);
      setIsCorrect(false);
      setShowFeedback(false);
      
      // Refresh quest data
      await fetchQuestData();

    } catch (err) {
      console.error('Error resetting progress:', err);
      alert(err instanceof Error ? err.message : 'Failed to reset progress');
    } finally {
      setSubmitting(false);
    }
  };

  // FIXED: Check if a digit from shuffled digits is already used in user answer
  // Only count digits from positions 2+ (skip the fixed "0" and "9")
  const isDigitUsed = (digit: string, digitIndex: number) => {
    // Get only the user-placed digits (positions 2-10)
    const userPlacedDigits = userAnswer.slice(2);
    
    // Count how many times this digit appears in shuffled digits up to this index
    const availableCount = shuffledDigits.slice(0, digitIndex + 1).filter(d => d === digit).length;
    
    // Count how many times this digit has been used in user answer
    const usedCount = userPlacedDigits.filter(d => d === digit).length;
    
    // Digit is used if all available instances have been placed
    return usedCount >= availableCount;
  };

  // Loading state
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

  // Error state
  if (error || !questData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Quest</h2>
          <p className="text-gray-600 mb-6">{error || 'Quest not found'}</p>
          <button
            onClick={() => router.push('/users/quest')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Quests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/users/quest')}
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
            >
              <X size={24} className="text-gray-600 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
              {questData.title}
            </h1>
            <div className="w-9 sm:w-10 md:w-14"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10">
        {/* Subtitle */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <p className="text-sm sm:text-base md:text-xl text-gray-500 px-2">
            Arrange the digits to form a valid <strong>{questData.description}</strong> mobile number
          </p>
        </div>

        {/* Answer Slots */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-700 mb-3 sm:mb-4 md:mb-6 px-1">Build Your Number</h2>
          <div className="flex justify-center gap-1 sm:gap-1.5 md:gap-3 mb-4 sm:mb-6 md:mb-8 flex-wrap px-1">
            {userAnswer.map((digit, index) => (
              <div
                key={index}
                onClick={() => digit === null && handleSlotClick(index)}
                className={`
                  relative w-8 h-11 sm:w-10 sm:h-12 md:w-16 md:h-20 rounded-md sm:rounded-lg md:rounded-xl 
                  flex items-center justify-center text-lg sm:text-xl md:text-3xl font-bold
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
                {digit || ''}
                {digit !== null && index > 1 && !showFeedback && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlotRemove(index);
                    }}
                    className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 md:-top-2 md:-right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center text-xs sm:text-sm font-bold shadow-md"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shuffled Digits with Network Label */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6 px-1">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-700">Shuffled Digits</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Network:</span>
              <span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-green-100 text-green-700 rounded-md sm:rounded-lg font-bold text-xs sm:text-sm md:text-base border border-green-300">
                {questData.networkName}
              </span>
            </div>
          </div>
          <div className="flex justify-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap px-1">
            {shuffledDigits.map((digit, index) => {
              const used = isDigitUsed(digit, index);
              return (
                <button
                  key={index}
                  onClick={() => !used && !showFeedback && handleDigitClick(digit, index)}
                  disabled={used || showFeedback}
                  className={`
                    w-10 h-12 sm:w-12 sm:h-14 md:w-16 md:h-20 rounded-md sm:rounded-lg md:rounded-xl 
                    text-xl sm:text-2xl md:text-3xl font-bold
                    transition-all border-2 border-b-4
                    ${used || showFeedback
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
          <div className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl bg-green-50 border-2 border-green-200">
            <div className="flex items-center justify-center gap-2 md:gap-3 text-green-700 font-bold text-sm sm:text-base md:text-xl">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">✓</span>
              </div>
              <span>Excellent! You got it right!</span>
            </div>
          </div>
        )}
        
        {showFeedback && !isCorrect && (
          <div className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl bg-red-50 border-2 border-red-200">
            <div className="flex items-center justify-center gap-2 md:gap-3 text-red-700 font-bold text-sm sm:text-base md:text-xl">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0">
                <X size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span>Not quite. Try again!</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-12 px-1">
          {!isCorrect && (
            <>
              <button
                onClick={handleReset}
                disabled={submitting}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 md:px-8 md:py-5 bg-white hover:bg-gray-50 border-2 border-b-4 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              
              <button
                onClick={handleCheckAnswer}
                disabled={!isComplete || submitting}
                className={`flex-1 px-3 py-2.5 sm:px-4 sm:py-3 md:px-8 md:py-5 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all border-2 border-b-4
                  ${isComplete && !submitting
                    ? 'bg-green-400 hover:bg-green-500 border-green-600 text-white cursor-pointer hover:-translate-y-0.5 active:translate-y-0' 
                    : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </span>
                ) : (
                  'CHECK'
                )}
              </button>
            </>
          )}
          
          {isCorrect && (
            <div className="w-full flex gap-2 sm:gap-3">
              <button
                onClick={handlePlayAgain}
                disabled={submitting}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 md:px-8 md:py-5 bg-blue-400 hover:bg-blue-500 border-2 border-b-4 border-blue-600 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </span>
                ) : (
                  'PLAY AGAIN'
                )}
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 md:px-8 md:py-5 bg-green-400 hover:bg-green-500 border-2 border-b-4 border-green-600 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                CONTINUE
              </button>
            </div>
          )}
        </div>

        {/* Instructions Section with Mascot */}
        <div className="bg-blue-50 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-blue-200 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 items-center sm:items-start">
            {/* Mascot Image */}
            <div className="flex-shrink-0 hidden xs:block">
              <img 
                src="/Quest/think.png" 
                alt="Bantay Mascot" 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 object-contain"
              />
            </div>

            {/* Instructions Text */}
            <div className="flex-1 w-full">
              <h3 className="font-bold text-gray-800 mb-2 sm:mb-2 md:mb-3 text-sm sm:text-base md:text-lg text-center sm:text-left">How to Play:</h3>
              <ul className="text-gray-700 space-y-1 sm:space-y-1.5 md:space-y-2 text-xs sm:text-sm md:text-base">
                <li>• <strong>Click a digit</strong> from the "Shuffled Digits" section</li>
                <li>• <strong>Click an empty slot</strong> in "Build Your Number" to place it</li>
                <li>• <strong>Remove digits</strong> by clicking the × button on a slot</li>
                <li>• <strong>Complete all slots</strong> and click "CHECK" to verify your answer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {attempts > 0 && !isCorrect && (
          <div className="text-center text-xs sm:text-sm md:text-base text-gray-500 mt-4 sm:mt-6">
            {attempts} attempt{attempts !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-16 sm:h-20" />
    </div>
  );
}