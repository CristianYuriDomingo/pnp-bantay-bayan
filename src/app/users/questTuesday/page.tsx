// app/users/questTuesday/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, Lock } from 'lucide-react';
import { useSoundContext } from '../../../contexts/sound-context';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  questionNumber: number;
  question: string;
}

interface QuestData {
  id: string;
  title: string;
  lives: number;
  totalQuestions: number;
  questions: Question[];
  userProgress: {
    currentQuestion: number;
    completedQuestions: number[];
    livesRemaining: number;
    score: number;
    isCompleted: boolean;
    isFailed: boolean;
  } | null;
}

export default function QuestTuesday() {
  const router = useRouter();
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const { play, preload } = useSoundContext();

  // Fetch quest data on mount
  useEffect(() => {
    fetchQuestData();
  }, []);

  // Preload common sounds once quest data is available
  useEffect(() => {
    if (questData) {
      preload(['click', 'correct', 'wrong', 'win', 'lose', 'notification']);
    }
  }, [questData, preload]);

  const fetchQuestData = async () => {
    try {
      setLoading(true);
      setError(null);
      setAccessError(null);

      const response = await fetch('/api/users/quest/tuesday');

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

          // Find current question index
          const currentIndex = data.data.questions.findIndex(
            (q: Question) => q.questionNumber === progress.currentQuestion
          );
          setCurrentQuestionIndex(currentIndex >= 0 ? currentIndex : 0);

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

    try {
      play('click');

      setSubmitting(true);
      setSelectedAnswer(answer);

      const currentQuestion = questData.questions[currentQuestionIndex];

      const response = await fetch('/api/users/quest/tuesday/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questTuesdayId: questData.id,
          questionId: currentQuestion.id,
          selectedAnswer: answer
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

      play(correct ? 'correct' : 'wrong');

      // Update lives and score
      setLives(data.data.livesRemaining);
      setScore(data.data.score);

      // Check game state
      if (data.data.isFailed) {
        setTimeout(() => {
          setGameOver(true);
          play('lose');
        }, 1500);
      } else if (data.data.isCompleted) {
        setTimeout(() => {
          setGameWon(true);
          play('win');
        }, 1500);
      }

    } catch (err) {
      console.error('Error submitting answer:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit answer');
      setSelectedAnswer(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!questData) return;

    if (currentQuestionIndex < questData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
      setSelectedAnswer(null);
      setIsCorrect(false);
      setExplanation('');
      setCorrectAnswer(null);
    }
  };

  const handleRestart = async () => {
    if (!questData) return;

    try {
      play('click');
      const response = await fetch('/api/users/quest/tuesday/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questTuesdayId: questData.id
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
      setCurrentQuestionIndex(0);
      setLives(questData.lives);
      setScore(0);
      setShowFeedback(false);
      setSelectedAnswer(null);
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
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Quest</h2>
          <p className="text-gray-600 mb-6">{error || 'No quest available'}</p>
          <div className="space-y-3">
            <button
              onClick={fetchQuestData}
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

  const progress = ((currentQuestionIndex + 1) / questData.totalQuestions) * 100;
  const currentQuestion = questData.questions[currentQuestionIndex];

  // Game Over Screen
  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-400 to-red-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6">
              <img
                src="/Quest/questTuesday/jail.png"
                alt="Jail"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ef4444" width="100" height="100" rx="10"/><text x="50" y="65" font-size="60" text-anchor="middle" fill="white">✕</text></svg>';
                }}
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">Pibi goes to jail.</h1>
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
                src="/Quest/questTuesday/free.png"
                alt="Free"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2322c55e" width="100" height="100" rx="10"/><text x="50" y="70" font-size="60" text-anchor="middle" fill="white">✓</text></svg>';
                }}
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">Pibi stays free</h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8">You passed the safety test!</p>
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
                  src="/Quest/questTuesday/bullet.png"
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
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 flex flex-col items-center justify-center min-h-[calc(100vh-220px)] sm:min-h-[calc(100vh-300px)] md:min-h-[calc(100vh-340px)]">
        {!showFeedback ? (
          <div className="w-full flex flex-col items-center justify-center">
            {/* Question */}
            <div className="mb-8 sm:mb-12 md:mb-16 lg:mb-24 w-full">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 text-center px-3 sm:px-4 leading-tight">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Buttons - Always in same line */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-12 w-full px-3 sm:px-4">
              <div className="flex-1 max-w-[140px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[260px]">
                <img
                  src="/Quest/questTuesday/true.png"
                  alt="True"
                  onClick={() => !submitting && handleAnswer(true)}
                  className={`w-full h-auto select-none ${
                    submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform active:scale-95'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect fill="%2322c55e" width="200" height="100" rx="10"/><text x="100" y="65" font-size="40" text-anchor="middle" fill="white" font-weight="bold">TRUE</text></svg>';
                  }}
                />
              </div>

              <div className="flex-1 max-w-[140px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[260px]">
                <img
                  src="/Quest/questTuesday/false.png"
                  alt="False"
                  onClick={() => !submitting && handleAnswer(false)}
                  className={`w-full h-auto select-none ${
                    submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform active:scale-95'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect fill="%23ef4444" width="200" height="100" rx="10"/><text x="100" y="65" font-size="40" text-anchor="middle" fill="white" font-weight="bold">FALSE</text></svg>';
                  }}
                />
              </div>
            </div>

            {/* Submitting Indicator */}
            {submitting && (
              <div className="mt-8 flex items-center gap-3 text-gray-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-medium">Checking answer...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl px-3 sm:px-4">
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
                {currentQuestionIndex < questData.questions.length - 1 ? 'CONTINUE' : 'FINISH'}
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
              <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">How to Play: Free or Jail</h3>
              <ul className="text-gray-700 space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li>• <strong>Answer Questions:</strong> Click TRUE or FALSE for each safety question</li>
                <li>• <strong>Lives:</strong> You have {questData.lives} {questData.lives === 1 ? 'life' : 'lives'} - lose one for each wrong answer</li>
                <li>• <strong>Goal:</strong> Answer all questions before running out of lives</li>
                <li>• <strong>Win:</strong> Keep Pibi free by making smart, safe choices!</li>
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