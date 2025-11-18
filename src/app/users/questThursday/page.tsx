// app/users/questThursday/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, AlertCircle, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSound } from '@/hooks/use-sound';

interface Item {
  id: string;   
  itemName: string;
  itemImage: string;
}

interface QuestData {
  id: string;
  title: string;
  lives: number;
  totalItems: number;
  items: Item[];
  userProgress: {
    currentItem: number;
    completedItems: string[];
    livesRemaining: number;
    score: number;
    isCompleted: boolean;
    isFailed: boolean;
  } | null;
}

export default function ConfiscatedAllowedGame() {
  const router = useRouter();
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Sound hook
  const { play } = useSound();

  // Fetch quest data on mount
  useEffect(() => {
    fetchQuestData();
  }, []);

  const fetchQuestData = async () => {
    try {
      setLoading(true);
      setError(null);
      setAccessError(null);

      const response = await fetch('/api/users/quest/thursday');

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response. Please check if you are logged in.');
      }

      const data = await response.json();

      // ========================================
      // HANDLE ACCESS DENIED
      // ========================================
      if (!response.ok) {
        if (response.status === 403) {
          // Access forbidden - show error and redirect
          setAccessError(data.error || 'You cannot access this quest right now');
          
          setTimeout(() => {
            if (data.redirectTo) {
              router.push(data.redirectTo);
            } else {
              router.push('/users/quest');
            }
          }, 2000);
          return;
        }

        if (response.status === 401) {
          router.push('/auth/signin');
          return;
        }

        throw new Error(data.error || 'Failed to fetch quest data');
      }

      if (data.success && data.data) {
        setQuestData(data.data);

        // Restore user progress if exists
        if (data.data.userProgress) {
          const progress = data.data.userProgress;
          setLives(progress.livesRemaining);
          setScore(progress.score);

          // Find current item index
          const currentIndex = progress.completedItems.length;
          setCurrentItemIndex(currentIndex >= 0 ? currentIndex : 0);

          if (progress.isCompleted) {
            setGameWon(true);
          } else if (progress.isFailed) {
            setGameOver(true);
          }
        } else {
          // New game - set initial lives from quest config
          setLives(data.data.lives);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching quest data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quest data');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: boolean) => {
    if (showFeedback || !questData) return;

    // Play click sound when button is pressed
    play('click');

    try {
      setSubmitting(true);

      const currentItem = questData.items[currentItemIndex];

      const response = await fetch('/api/users/quest/thursday/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questThursdayId: questData.id,
          itemId: currentItem.id,
          selectedDecision: answer
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response. Please try again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit answer');
      }

      const correct = data.data.correct;
      setIsCorrect(correct);
      setExplanation(data.data.explanation);
      setCorrectAnswer(data.data.correctAnswer);
      setShowFeedback(true);

      // Play correct or wrong sound
      if (correct) {
        play('correct');
      } else {
        play('wrong');
      }

      // Update lives and score
      setLives(data.data.livesRemaining);
      setScore(data.data.score);

      // Check game state
      if (data.data.isFailed) {
        setTimeout(() => {
          play('lose'); // Play lose sound when game is lost
          setGameOver(true);
        }, 1500);
      } else if (data.data.isCompleted) {
        setTimeout(() => {
          play('win'); // Play win sound when game is won
          setGameWon(true);
        }, 1500);
      }

    } catch (err) {
      console.error('Error submitting answer:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!questData) return;

    // Play click sound
    play('click');

    if (currentItemIndex < questData.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setShowFeedback(false);
      setIsCorrect(false);
      setExplanation('');
      setCorrectAnswer(null);
    }
  };

  const handleRestart = async () => {
    if (!questData) return;

    // Play click sound
    play('click');

    try {
      const response = await fetch('/api/users/quest/thursday/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questThursdayId: questData.id
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset progress');
      }

      // Reset all state
      setCurrentItemIndex(0);
      setLives(questData.lives);
      setScore(0);
      setShowFeedback(false);
      setIsCorrect(false);
      setExplanation('');
      setCorrectAnswer(null);
      setGameOver(false);
      setGameWon(false);

    } catch (err) {
      console.error('Error resetting progress:', err);
      alert(err instanceof Error ? err.message : 'Failed to reset progress');
    }
  };

  // ========================================
  // ACCESS DENIED SCREEN
  // ========================================
  if (accessError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={40} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 mb-4">Access Denied</h1>
            <p className="text-lg text-gray-600 mb-6">{accessError}</p>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Redirecting...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Quest</h2>
          <p className="text-gray-600 mb-6">{error || 'No quest available'}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                play('click');
                fetchQuestData();
              }}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                play('click');
                router.push('/users/quest');
              }}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentItemIndex + 1) / questData.totalItems) * 100;
  const currentItem = questData.items[currentItemIndex];

  // Game Over Screen
  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-400 to-red-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6">
              <img 
                src="/Quest/questThursday/kickedoff.png" 
                alt="Kicked Off" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ef4444" width="100" height="100" rx="10"/><text x="50" y="65" font-size="60" text-anchor="middle" fill="white">✕</text></svg>';
                }}
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">General kicked you off.</h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              All bullets are gone!
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
                src="/Quest/questThursday/promoted.png" 
                alt="Promoted" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2322c55e" width="100" height="100" rx="10"/><text x="50" y="70" font-size="60" text-anchor="middle" fill="white">✓</text></svg>';
                }}
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">General promoting you</h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8">You passed the inspection!</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  play('click');
                  router.push('/users/quest');
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
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <button
              onClick={() => {
                play('click');
                router.push('/users/quest');
              }}
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <X size={24} className="text-gray-600 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="h-4 sm:h-5 md:h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              {[...Array(questData.lives)].map((_, i) => (
                <img
                  key={i}
                  src="/Quest/questThursday/bullet.png"
                  alt="Life"
                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 object-contain ${i < lives ? "opacity-100" : "opacity-30 grayscale"}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="%23fbbf24"/></svg>';
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10">
        {!showFeedback ? (
          <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-240px)] sm:min-h-[calc(100vh-300px)] md:min-h-[calc(100vh-340px)]">
            {/* Speech Bubble - Above mascot, properly spaced */}
            <div className="relative mb-4 sm:mb-6 z-10">
              <div className="bg-white rounded-2xl shadow-xl px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-200 min-w-[160px] sm:min-w-[200px]">
                <div className="text-center">
                  <img 
                    src={currentItem.itemImage} 
                    alt={currentItem.itemName}
                    className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-2 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100" rx="10"/><text x="50" y="60" font-size="40" text-anchor="middle" fill="%236b7280">?</text></svg>';
                    }}
                  />
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{currentItem.itemName}</p>
                </div>
                {/* Speech bubble tail */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-b-2 border-r-2 border-gray-200 transform rotate-45"></div>
              </div>
            </div>

            {/* Mascot - Properly sized for all screens */}
            <div className="mb-6 sm:mb-8 md:mb-12">
              <img 
                src="/Quest/questThursday/mascot.png" 
                alt="Police Mascot"
                className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%233b82f6" width="200" height="200" rx="20"/><circle cx="100" cy="100" r="60" fill="white"/></svg>';
                }}
              />
            </div>

            {/* Answer Buttons - Responsive layout */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full max-w-2xl px-3 sm:px-4">
              <button
                onClick={() => !submitting && handleAnswer(false)}
                disabled={submitting}
                className="w-full sm:flex-1 max-w-[320px] sm:max-w-[280px] py-4 sm:py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-lg sm:text-xl md:text-2xl shadow-lg transition-all active:scale-95"
              >
                {submitting ? 'CHECKING...' : 'CONFISCATE'}
              </button>
              
              <p className="text-base sm:text-lg md:text-xl font-medium text-gray-400 hidden sm:block">or</p>

              <button
                onClick={() => !submitting && handleAnswer(true)}
                disabled={submitting}
                className="w-full sm:flex-1 max-w-[320px] sm:max-w-[280px] py-4 sm:py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-lg sm:text-xl md:text-2xl shadow-lg transition-all active:scale-95"
              >
                {submitting ? 'CHECKING...' : 'ALLOW'}
              </button>
            </div>

            {/* Submitting Indicator */}
            {submitting && (
              <div className="mt-8 flex items-center gap-3 text-gray-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-medium">Checking decision...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 min-h-[calc(100vh-240px)] sm:min-h-[calc(100vh-300px)] flex flex-col justify-center">
            {/* Feedback Screen */}
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center ${
                isCorrect ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isCorrect ? (
                  <Check size={40} className="sm:w-12 sm:h-12 md:w-16 md:h-16 text-green-500" />
                ) : (
                  <X size={40} className="sm:w-12 sm:h-12 md:w-16 md:h-16 text-red-500" />
                )}
              </div>
              
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 ${
                isCorrect ? 'text-green-500' : 'text-red-500'
              }`}>
                {isCorrect ? 'Awesome!' : 'Not quite!'}
              </h2>

              <div className={`max-w-xl mx-auto p-4 sm:p-5 md:p-6 rounded-2xl ${
                isCorrect ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className={`text-sm sm:text-base md:text-lg font-medium ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {explanation}
                </p>
              </div>
            </div>

            {/* Continue Button */}
            <div className="w-full">
              <button
                onClick={handleNext}
                disabled={gameOver || gameWon}
                className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg md:text-xl text-white shadow-lg transition-transform active:scale-95 ${
                  isCorrect 
                    ? 'bg-gradient-to-b from-green-400 to-green-500 hover:from-green-500 hover:to-green-600' 
                    : 'bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600'
                }`}
              >
                {currentItemIndex < questData.items.length - 1 ? 'CONTINUE' : 'FINISH'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-6 sm:pb-8">
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-4 sm:p-6">
          <div className="flex gap-3 sm:gap-4 md:gap-6 items-start">
            <div className="flex-shrink-0 hidden sm:block">
              <img 
                src="/Quest/think.png" 
                alt="Bantay Mascot" 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">How to Play: Avoid Angering the General</h3>
              <ul className="text-gray-700 space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li>• <strong>Inspect Items:</strong> The general is watching inspect item in right way</li>
                <li>• <strong>Make a Decision:</strong> Choose CONFISCATE or ALLOW for each item</li>
                <li>• <strong>Lives:</strong> You have {questData.lives} {questData.lives === 1 ? 'life' : 'lives'} - lose one for each wrong answer</li>
                <li>• <strong>Goal:</strong> Pass the inspection by correctly identifying all items</li>
                <li>• <strong>Win:</strong> Get promoted by the general for your excellent work!</li>
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