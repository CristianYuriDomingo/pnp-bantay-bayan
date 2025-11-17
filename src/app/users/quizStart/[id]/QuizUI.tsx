// FILE: app/users/quizStart/[id]/QuizUI.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useUserRank } from '@/hooks/use-rank';

// Confetti animation component
const Confetti = () => {
  const [pieces, setPieces] = useState<Array<{id: number, left: number, delay: number}>>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 animate-bounce"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            animation: `fall ${2 + Math.random() * 1}s linear ${piece.delay}s forwards`,
            backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA502', '#95E1D3'][Math.floor(Math.random() * 5)],
            borderRadius: '50%'
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotateZ(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Exit Confirmation Modal
const ExitConfirmation = ({ onConfirm, onCancel }: {
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const [isConfirmActive, setIsConfirmActive] = useState(false);
  const [isCancelActive, setIsCancelActive] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full mx-auto p-6 bg-white shadow-2xl rounded-2xl border border-red-100">
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-200 to-red-100 rounded-lg blur opacity-30"></div>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
          Exit <span className="text-red-600">Quiz?</span>
        </h2>

        <p className="text-gray-700 text-center text-base mb-6">
          Are you sure you want to leave? Your progress will be <strong className="text-red-600">lost</strong> and this quiz attempt will not be saved.
        </p>

        <div className="flex gap-3">
          <button
            className={`flex-1 relative px-6 py-3 text-base font-bold text-gray-700 bg-gray-200 rounded-xl transition-all duration-150 ease-out ${
              isCancelActive ? 'translate-y-1 shadow-none' : 'shadow-[0_4px_0_0_#9ca3af]'
            }`}
            onMouseDown={() => setIsCancelActive(true)}
            onMouseUp={() => {
              setIsCancelActive(false);
              onCancel();
            }}
            onMouseLeave={() => setIsCancelActive(false)}
          >
            Continue Quiz
          </button>
          <button
            className={`flex-1 relative px-6 py-3 text-base font-bold text-white bg-red-500 rounded-xl transition-all duration-150 ease-out ${
              isConfirmActive ? 'translate-y-1 shadow-none' : 'shadow-[0_4px_0_0_#dc2626]'
            }`}
            onMouseDown={() => setIsConfirmActive(true)}
            onMouseUp={() => {
              setIsConfirmActive(false);
              onConfirm();
            }}
            onMouseLeave={() => setIsConfirmActive(false)}
          >
            Exit Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

const QuizInstructions = ({ topic, onStartQuiz, onClose }: {
  topic: string;
  onStartQuiz: () => void;
  onClose: () => void;
}) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full mx-auto p-6 bg-white shadow-2xl rounded-2xl border border-blue-100">
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close instructions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-blue-100 rounded-lg blur opacity-30"></div>
            <div className="w-60 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 relative overflow-hidden">
              <img
                src="/QuizImage/QuizRules.png"
                alt="Quiz Rules"
                className="w-full h-full object-contain"
                style={{ maxHeight: '96px' }}
              />
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
          {topic} <span className="text-blue-600">Quiz</span>
        </h2>

        <p className="text-gray-700 text-center text-base mb-4">
          Welcome to the <strong className="text-blue-600">{topic}</strong> quiz! Here's how it works:
        </p>
        
        <div className="bg-blue-50 rounded-xl p-4 mb-5">
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>You will have multiple-choice questions.</span>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Choose the correct answer before the time runs out.</span>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span>You can't go back to previous questions.</span>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Good luck!</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            className={`relative px-6 py-2 text-base font-medium text-white bg-[#2d87ff] rounded-xl transition-all duration-150 ease-out ${
              isActive ? 'translate-y-1 shadow-none' : 'shadow-[0_4px_0_0_#2563eb]'
            }`}
            onMouseDown={() => setIsActive(true)}
            onMouseUp={() => {
              setIsActive(false);
              onStartQuiz();
            }}
            onMouseLeave={() => setIsActive(false)}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex justify-center items-center z-50 bg-white/80 backdrop-blur-sm">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4 mx-auto"></div>
      <p className="text-blue-600 text-lg font-medium">Loading Quiz...</p>
    </div>
  </div>
);

const QuizComplete = ({ 
  score, 
  totalQuestions, 
  quizTitle, 
  masteryData,
  userRank,
  userName,
  onRetakeQuiz, 
  onClose 
}: {
  score: number;
  totalQuestions: number;
  quizTitle: string;
  masteryData?: any;
  userRank?: string;
  userName?: string;
  onRetakeQuiz: () => void;
  onClose: () => void;
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const [showConfetti, setShowConfetti] = useState(true);
  const [randomQuote] = useState(() => {
    const quotes = [
      "Every expert was once a beginner.",
      "Success is a journey, not a destination.",
      "Keep learning, keep growing!",
      "Your effort today shapes your tomorrow.",
      "Progress is progress, no matter how small.",
      "Believe in yourself and your abilities.",
      "The only way to fail is to stop trying.",
      "Great things take practice and dedication."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  });
  
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  
  const getMasteryColor = (level: string | null) => {
    switch (level) {
      case 'Perfect': return 'text-purple-600';
      case 'Gold': return 'text-yellow-600';
      case 'Silver': return 'text-gray-600';
      case 'Bronze': return 'text-orange-600';
      default: return 'text-gray-500';
    }
  };

  const getMissionResult = () => {
    const displayRank = userRank || 'Cadet';
    const displayName = userName || 'User';
    if (percentage >= 80) {
      return `Great Job, ${displayRank} ${displayName}!`;
    } else if (percentage >= 60) {
      return `Good Effort, ${displayRank} ${displayName}!`;
    } else {
      return "Retry Mission";
    }
  };

  const getMissionSubtext = () => {
    if (percentage >= 80) {
      return "You've completed your mission successfully!";
    } else if (percentage >= 60) {
      return "You've completed your mission!";
    } else {
      return "Don't give up! Try again and improve your score.";
    }
  };

  const getResultImage = () => {
    if (percentage >= 80) {
      return '/QuizImage/ResultGreat.png';
    } else if (percentage >= 60) {
      return '/QuizImage/ResultGood.png';
    } else {
      return '/QuizImage/ResultTryAgain.png';
    }
  };

  const getMasteryBadgeImage = () => {
    if (masteryData?.masteryLevel === 'Perfect') {
      return '/QuizImage/mastery/perfect-badge.png';
    } else if (masteryData?.masteryLevel === 'Gold') {
      return '/QuizImage/mastery/gold-badge.png';
    } else if (masteryData?.masteryLevel === 'Silver') {
      return '/QuizImage/mastery/silver-badge.png';
    } else if (masteryData?.masteryLevel === 'Bronze') {
      return '/QuizImage/mastery/bronze-badge.png';
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      {showConfetti && percentage >= 60 && <Confetti />}
      
      <div className="max-w-md w-full mx-auto p-5 bg-white shadow-2xl rounded-2xl border border-blue-100 max-h-[85vh] overflow-y-auto">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <img 
              src={getResultImage()} 
              alt="Quiz Result" 
              className="w-28 h-28 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {getMissionResult()}
          </h2>
          <p className="text-gray-600 text-base mb-4">{getMissionSubtext()}</p>

          {masteryData?.earnedBadges && masteryData.earnedBadges.length > 0 && (
            <div className="mb-4 rounded-xl p-3 border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
              <h3 className="text-base font-bold text-gray-800 mb-2">Badges Earned!</h3>
              <div className="flex justify-center items-center space-x-2 mb-2 flex-wrap gap-2">
                {masteryData.earnedBadges.map((badge: any) => (
                  <div key={badge.id} className="text-center transform hover:scale-110 transition-transform">
                    <div className="w-16 h-16 flex items-center justify-center mb-1 mx-auto">
                      {badge.image ? (
                        <img 
                          src={badge.image} 
                          alt={badge.name} 
                          className="w-full h-full object-contain drop-shadow-md" 
                        />
                      ) : (
                        <span className="text-4xl">🏆</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{badge.name}</p>
                  </div>
                ))}
              </div>
              {masteryData?.message && (
                <p className="text-green-700 text-xs font-medium italic mt-1">{masteryData.message}</p>
              )}
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 mb-3 border border-blue-200 shadow-sm">
            <div className="text-xl font-bold text-blue-600 mb-1">
              {score}/{totalQuestions}
            </div>
            <div className="text-gray-700 mb-2 font-semibold text-sm">
              {percentage}% Accuracy
            </div>
            
            {masteryData?.masteryLevel && (
              <div className="flex items-center justify-center gap-2 mb-1">
                {getMasteryBadgeImage() && (
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    <img 
                      src={getMasteryBadgeImage()!} 
                      alt={`${masteryData.masteryLevel} Badge`}
                      className="w-full h-full object-contain drop-shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 leading-tight font-medium">MISSION REPORT</p>
                  <p className={`text-sm font-bold leading-tight ${getMasteryColor(masteryData.masteryLevel)}`}>
                    {masteryData.masteryLevel} Mastery
                  </p>
                  <p className="text-xs text-gray-600 leading-tight font-medium">{Math.round(masteryData.masteryScore)}%</p>
                </div>
              </div>
            )}

            {masteryData?.isNewBestScore && (
              <div className="mt-1 text-yellow-600 text-xs font-bold">
                ⭐ New Best Score!
              </div>
            )}
          </div>

          {masteryData && (
            <div className="mb-3 text-xs text-gray-600 flex justify-center items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Time Efficiency: {Math.round(masteryData.timeEfficiency)}%</span>
            </div>
          )}

          <div className="mb-4 italic text-gray-600 text-xs px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            "{randomQuote}"
          </div>

          <div className="flex gap-2">
            <button
              onClick={onRetakeQuiz}
              className="flex-1 relative px-4 py-2.5 text-sm font-bold text-white bg-[#2d87ff] rounded-xl transition-all duration-150 ease-out shadow-[0_3px_0_0_#2563eb] hover:shadow-[0_1px_0_0_#2563eb] active:translate-y-0.5 active:shadow-none"
            >
              Retake Quiz
            </button>
            <button
              onClick={onClose}
              className="flex-1 relative px-4 py-2.5 text-sm font-bold text-white bg-gray-500 rounded-xl transition-all duration-150 ease-out shadow-[0_3px_0_0_#4b5563] hover:shadow-[0_1px_0_0_#4b5563] active:translate-y-0.5 active:shadow-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuizUIProps {
  quizId: string;
}

interface ShuffledQuestion {
  id: string;
  question: string;
  lesson: string;
  image?: string;
  options: string[];
  shuffledOptions: string[];
  correctAnswerIndex: number;
  originalCorrectAnswerIndex: number;
}

interface AnswerFeedback {
  questionId: string;
  selectedAnswer: number;
  correctAnswer: number;
  correctAnswerText: string;
  isCorrect: boolean;
  explanation?: string;
  question: string;
  options: string[];
}

interface UserAnswer {
  questionId: string;
  answer: number | null;
  correct: boolean;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const prepareQuestionsWithShuffledOptions = (questions: any[]): ShuffledQuestion[] => {
  return questions.map(question => {
    const originalCorrectAnswerIndex = 0;
    const shuffledOptions = shuffleArray(question.options);
    const correctAnswerIndex = shuffledOptions.indexOf(question.options[originalCorrectAnswerIndex]);

    return {
      ...question,
      shuffledOptions,
      correctAnswerIndex,
      originalCorrectAnswerIndex
    };
  });
};

export default function QuizUI({ quizId }: QuizUIProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { rankInfo } = useUserRank();
  
  const [showInstructions, setShowInstructions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizData, setQuizData] = useState<any>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [masteryData, setMasteryData] = useState<any>(null);
  const [isLoadingMastery, setIsLoadingMastery] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [hasSeenInstructions, setHasSeenInstructions] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const rankTitle = rankInfo?.name || 'Cadet';
  const displayName = profileName || session?.user?.name || session?.user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const response = await fetch('/api/users/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProfileName(data.data.name);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [session?.user]);

  const fetchQuizData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/quizzes/${quizId}`);
      if (!response.ok) throw new Error('Failed to fetch quiz');
      const data = await response.json();
      setQuizData(data);
      const prepared = prepareQuestionsWithShuffledOptions(data.questions);
      setShuffledQuestions(prepared);
      setTimeLeft(data.timer);
      setShowInstructions(true);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      const fallbackData = {
        id: quizId,
        title: "Sample Quiz",
        timer: 30,
        questions: [
          {
            id: "q1",
            question: "What should you use to create strong passwords?",
            lesson: "Cyber Security",
            image: "/LearnImage/CyberSecurity/21.png",
            options: [
              "A mix of letters, numbers, and symbols",
              "Only lowercase letters",
              "Your name and birthdate",
              "The same password for all accounts"
            ]
          }
        ]
      };
      setQuizData(fallbackData);
      const prepared = prepareQuestionsWithShuffledOptions(fallbackData.questions);
      setShuffledQuestions(prepared);
      setShowInstructions(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const submitAnswer = async (questionId: string, selectedAnswerIndex: number, currentQuestionData: ShuffledQuestion) => {
    try {
      const originalAnswerIndex = selectedAnswerIndex === -1 ? -1 : 
        currentQuestionData.options.indexOf(currentQuestionData.shuffledOptions[selectedAnswerIndex]);

      const response = await fetch(`/api/users/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          selectedAnswer: originalAnswerIndex,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit answer');
      
      const feedback = await response.json();

      const shuffledCorrectAnswerIndex = feedback.correctAnswer === -1 ? -1 :
        currentQuestionData.shuffledOptions.indexOf(currentQuestionData.options[feedback.correctAnswer]);

      const modifiedFeedback = {
        ...feedback,
        correctAnswer: shuffledCorrectAnswerIndex,
        explanation: feedback.isCorrect ? feedback.explanation : undefined,
        options: currentQuestionData.shuffledOptions
      };

      setAnswerFeedback(modifiedFeedback);

      if (modifiedFeedback.isCorrect) {
        setScore(score + 1);
      }

      return modifiedFeedback;
    } catch (error) {
      console.error('Error submitting answer:', error);
      const isCorrect = selectedAnswerIndex === currentQuestionData.correctAnswerIndex;
      const fallbackFeedback = {
        questionId,
        selectedAnswer: selectedAnswerIndex,
        correctAnswer: currentQuestionData.correctAnswerIndex,
        correctAnswerText: currentQuestionData.shuffledOptions[currentQuestionData.correctAnswerIndex],
        isCorrect,
        explanation: isCorrect ? "Great job!" : undefined,
        question: currentQuestionData.question,
        options: currentQuestionData.shuffledOptions
      };

      setAnswerFeedback(fallbackFeedback);

      if (isCorrect) {
        setScore(score + 1);
      }

      return fallbackFeedback;
    }
  };

  const submitCompleteQuiz = async () => {
    try {
      setIsLoadingMastery(true);
      const totalTimeSpent = Math.round((Date.now() - quizStartTime) / 1000);

      const response = await fetch(`/api/users/quizzes/${quizId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: userAnswers.map((ua, index) => {
            if (ua.answer === null) return -1;
            return shuffledQuestions[index].options.indexOf(
              shuffledQuestions[index].shuffledOptions[ua.answer]
            );
          }),
          timeSpent: totalTimeSpent,
          score: score,
          totalQuestions: shuffledQuestions.length,
        }),
      });

      if (response.ok) {
        const completionData = await response.json();
        setMasteryData(completionData);
      } else {
        console.warn('Failed to save quiz completion to database');
        setMasteryData({});
      }
    } catch (error) {
      console.error('Error submitting complete quiz:', error);
      setMasteryData({});
    } finally {
      setIsLoadingMastery(false);
    }
  };

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !showFeedback && !isQuizComplete) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback && quizStarted) {
      handleTimeUp();
    }
  }, [timeLeft, quizStarted, showFeedback, isQuizComplete]);

  const handleTimeUp = async () => {
    setShowFeedback(true);
    const currentQuestionData = shuffledQuestions[currentQuestion];
    await submitAnswer(currentQuestionData.id, -1, currentQuestionData);
    setUserAnswers(prev => [...prev, { 
      questionId: currentQuestionData.id, 
      answer: null, 
      correct: false 
    }]);
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    if (showFeedback || timeLeft === 0) return;

    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    const currentQuestionData = shuffledQuestions[currentQuestion];
    const feedback = await submitAnswer(currentQuestionData.id, answerIndex, currentQuestionData);

    setUserAnswers(prev => [...prev, { 
      questionId: currentQuestionData.id, 
      answer: answerIndex, 
      correct: feedback?.isCorrect || false
    }]);
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setAnswerFeedback(null);
      setTimeLeft(quizData.timer);
    } else {
      setIsQuizComplete(true);
      setIsLoadingMastery(true);
      await submitCompleteQuiz();
    }
  };

  const handleStartQuiz = () => {
    setShowInstructions(false);
    setQuizStarted(true);
    setQuizStartTime(Date.now());
    setHasSeenInstructions(true);
  };

  const handleRetakeQuiz = () => {
    const prepared = prepareQuestionsWithShuffledOptions(quizData.questions);
    setShuffledQuestions(prepared);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswerFeedback(null);
    setUserAnswers([]);
    setIsQuizComplete(false);
    setTimeLeft(quizData.timer);
    setQuizStartTime(Date.now());
    setMasteryData(null);
    setIsLoadingMastery(false);
    
    setShowInstructions(false);
    setQuizStarted(true);
  };

  const handleCloseAttempt = () => {
    if (!quizStarted || isQuizComplete) {
      router.push('/users/quiz');
    } else {
      setShowExitConfirmation(true);
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirmation(false);
    router.push('/users/quiz');
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  const formatTime = (seconds: number) => {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 20) return "text-green-600";
    if (timeLeft > 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getButtonStyle = (optionIndex: number) => {
    if (!showFeedback) {
      if (selectedAnswer === optionIndex) {
        return "bg-blue-500 text-white shadow-lg border-2 border-blue-300 transform scale-105";
      }
      return "bg-white text-gray-800 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 shadow-sm";
    }

    if (answerFeedback) {
      // Only show the selected answer as red if incorrect
      if (optionIndex === selectedAnswer && !answerFeedback.isCorrect) {
        return "bg-red-500 text-white shadow-lg border border-red-400";
      }
      // Only show the correct answer as green if the user got it right
      if (optionIndex === answerFeedback.correctAnswer && answerFeedback.isCorrect) {
        return "bg-green-500 text-white shadow-lg border border-green-400";
      }
    }

    return "bg-gray-100 text-gray-500 border border-gray-200";
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!quizData || shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz not found</h2>
          <button 
            onClick={() => router.push('/users/quiz')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = shuffledQuestions[currentQuestion];
  const progressWidth = ((currentQuestion + 1) / shuffledQuestions.length) * 100;
  const isLastQuestion = currentQuestion === shuffledQuestions.length - 1;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 mx-8 sm:mx-12 lg:mx-16">
        <div className="flex justify-between items-center text-gray-800 mb-4">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="bg-white/80 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-blue-200 shadow-sm">
              <span className="font-medium text-sm sm:text-base">Score: {score}/{shuffledQuestions.length}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-base sm:text-lg font-medium text-blue-700">{quizData.title}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="bg-white/80 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-blue-200 shadow-sm">
              <span className="font-medium text-sm sm:text-base">
                {currentQuestion + 1}/{shuffledQuestions.length}
              </span>
            </div>
            <button 
              onClick={handleCloseAttempt}
              className="bg-white/80 hover:bg-white backdrop-blur-md p-2.5 sm:p-3 rounded-full transition-colors border border-blue-200 shadow-sm" 
              aria-label="Close quiz"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-white/50 backdrop-blur-sm rounded-full h-3 sm:h-4 border border-blue-200 shadow-sm">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 shadow-sm" 
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow px-4 sm:px-8 mx-8 sm:mx-12 lg:mx-16 pb-32">
        <div className="max-w-3xl mx-auto">
          {/* Timer */}
          <div className="text-center mb-6 sm:mb-8">
            <div className={`font-bold text-4xl sm:text-5xl ${getTimerColor()} drop-shadow-lg`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-gray-600 text-base sm:text-lg mt-1">Time Remaining</p>
          </div>

          {/* Question Image */}
          {currentQuestionData.image && (
            <div className="mb-6 sm:mb-8 flex justify-center">
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-blue-200 shadow-lg">
                <img 
                  src={currentQuestionData.image} 
                  alt="Question illustration"
                  className="max-w-full max-h-48 sm:max-h-60 object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.parentElement) {
                      target.parentElement.style.display = 'none';
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Question Text */}
          <div className="mb-6 sm:mb-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-relaxed px-2">
              {currentQuestionData.question}
            </h2>
          </div>

          {/* Answer Options - Using Shuffled Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-4">
            {currentQuestionData.shuffledOptions.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`p-4 sm:p-5 rounded-xl text-left font-medium transition-all duration-300 min-h-[70px] sm:min-h-[80px] flex items-center ${getButtonStyle(index)} ${
                  showFeedback || timeLeft === 0 ? "cursor-not-allowed" : "cursor-pointer hover:scale-105 hover:shadow-lg"
                }`}
                disabled={showFeedback || timeLeft === 0}
              >
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-current/20 flex items-center justify-center mr-3 text-sm sm:text-base font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 text-base sm:text-lg">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Footer with Feedback */}
      {showFeedback && answerFeedback && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 border-t-4 shadow-2xl ${
          answerFeedback.isCorrect 
            ? "bg-green-50 border-green-500" 
            : "bg-red-50 border-red-500"
        }`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              {/* Left Side - Icon, Image and Feedback */}
              <div className="flex items-center gap-4 flex-1">
                {/* Icon Circle */}
                <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
                  answerFeedback.isCorrect 
                    ? "bg-green-500" 
                    : "bg-red-500"
                }`}>
                  {answerFeedback.isCorrect ? (
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                {/* Feedback Image */}
                <div className="flex-shrink-0 hidden sm:block">
                  <img 
                    src={answerFeedback.isCorrect ? '/QuizImage/FeedbackCorrect.png' : '/QuizImage/FeedbackIncorrect.png'}
                    alt="Feedback"
                    className="h-20 sm:h-24 w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Feedback Text */}
                <div className="flex-1">
                  <div className={`text-xl sm:text-2xl font-bold mb-1 ${
                    answerFeedback.isCorrect ? "text-green-800" : "text-red-800"
                  }`}>
                    {answerFeedback.isCorrect 
                      ? "Excellent!" 
                      : selectedAnswer !== null ? "Incorrect" : "Time's Up!"}
                  </div>
                  {!answerFeedback.isCorrect && selectedAnswer === null && (
                    <div className="text-sm sm:text-base text-gray-700">
                      Time's up! Let's move on to the next question.
                    </div>
                  )}
                  {answerFeedback.explanation && (
                    <div className="text-sm text-gray-600 mt-1">
                      {answerFeedback.explanation}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Next Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleNextQuestion}
                  className={`px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 shadow-lg ${
                    answerFeedback.isCorrect 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {isLastQuestion ? "Finish" : "Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay Modals */}
      {showInstructions && !hasSeenInstructions && (
        <QuizInstructions 
          topic={quizData.title}
          onStartQuiz={handleStartQuiz}
          onClose={() => router.push('/users/quiz')}
        />
      )}

      {showExitConfirmation && (
        <ExitConfirmation
          onConfirm={handleConfirmExit}
          onCancel={handleCancelExit}
        />
      )}

      {isQuizComplete && isLoadingMastery && (
        <LoadingSpinner />
      )}

      {isQuizComplete && !isLoadingMastery && masteryData !== null && (
        <QuizComplete 
          score={score}
          totalQuestions={shuffledQuestions.length}
          quizTitle={quizData.title}
          masteryData={masteryData}
          userRank={rankTitle}
          userName={displayName}
          onRetakeQuiz={handleRetakeQuiz}
          onClose={() => router.push('/users/quiz')}
        />
      )}
    </div>
  );
}