// FILE: app/users/quizStart/[id]/QuizUI.tsx (Complete Updated Version)
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

// Updated QuizComplete component with mastery display and badge showcase
const QuizComplete = ({ 
  score, 
  totalQuestions, 
  quizTitle, 
  masteryData,
  onRetakeQuiz, 
  onClose 
}: {
  score: number;
  totalQuestions: number;
  quizTitle: string;
  masteryData?: any;
  onRetakeQuiz: () => void;
  onClose: () => void;
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getMasteryColor = (level: string | null) => {
    switch (level) {
      case 'Perfect': return 'text-purple-600 bg-purple-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Bronze': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full mx-auto p-6 bg-white shadow-2xl rounded-2xl border border-blue-100">
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close results"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">
              {masteryData?.masteryLevel === 'Perfect' ? '🏆' : 
               masteryData?.masteryLevel === 'Gold' ? '🥇' :
               masteryData?.masteryLevel === 'Silver' ? '🥈' :
               masteryData?.masteryLevel === 'Bronze' ? '🥉' :
               percentage >= 80 ? '🎉' : 
               percentage >= 60 ? '👍' : '📚'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">{quizTitle}</p>
          </div>

          {/* Score Display */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {score}/{totalQuestions}
            </div>
            <div className="text-gray-700 mb-2">
              {percentage}% Score
            </div>
            
            {/* Mastery Level Display */}
            {masteryData?.masteryLevel && (
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getMasteryColor(masteryData.masteryLevel)}`}>
                {masteryData.masteryLevel} Mastery ({Math.round(masteryData.masteryScore)}%)
              </div>
            )}
            
            {/* New Best Score Indicator */}
            {masteryData?.isNewBestScore && (
              <div className="mt-2 text-green-600 text-sm font-medium">
                🎊 New Best Score!
              </div>
            )}
          </div>

          {/* Earned Badges Display */}
          {masteryData?.earnedBadges && masteryData.earnedBadges.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Badges Earned!</h3>
              <div className="flex justify-center space-x-3 mb-4">
                {masteryData.earnedBadges.map((badge: any) => (
                  <div key={badge.id} className="text-center">
                    {/* Removed colored background, just show the image */}
                    <div className="w-16 h-16 flex items-center justify-center mb-2">
                      {badge.image ? (
                        <img 
                          src={badge.image} 
                          alt={badge.name} 
                          className="w-16 h-16 object-contain" 
                        />
                      ) : (
                        <span className="text-4xl">🏆</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-700">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {masteryData?.message && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">{masteryData.message}</p>
            </div>
          )}

          {/* Performance Stats */}
          {masteryData && (
            <div className="mb-6 text-sm text-gray-600 space-y-1">
              <div>Time Efficiency: {Math.round(masteryData.timeEfficiency)}%</div>
              <div>Attempt #{masteryData.attemptCount}</div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onRetakeQuiz}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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

interface QuestionData {
  id: string;
  question: string;
  lesson: string;
  image?: string;
  options: string[];
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

export default function QuizUI({ quizId }: QuizUIProps) {
  const router = useRouter();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(null);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [masteryData, setMasteryData] = useState<any>(null);

  const fetchQuizData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/quizzes/${quizId}`);
      if (!response.ok) throw new Error('Failed to fetch quiz');
      const data = await response.json();
      setQuizData(data);
      setTimeLeft(data.timer);
      setShowInstructions(true);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      // Fallback data for development
      setQuizData({
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
              "Only lowercase letters",
              "A mix of letters, numbers, and symbols",
              "Your name and birthdate",
              "The same password for all accounts"
            ]
          }
        ]
      });
      setShowInstructions(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const submitAnswer = async (questionId: string, selectedAnswerIndex: number) => {
    try {
      const response = await fetch(`/api/users/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          selectedAnswer: selectedAnswerIndex,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit answer');
      
      const feedback = await response.json();
      setAnswerFeedback(feedback);

      if (feedback.isCorrect) {
        setScore(score + 1);
      }

      return feedback;
    } catch (error) {
      console.error('Error submitting answer:', error);
      const isCorrect = selectedAnswerIndex === 1;
      const fallbackFeedback = {
        questionId,
        selectedAnswer: selectedAnswerIndex,
        correctAnswer: 1,
        correctAnswerText: quizData.questions[currentQuestion].options[1],
        isCorrect,
        explanation: isCorrect ? "Great job!" : "The correct answer provides better security.",
        question: quizData.questions[currentQuestion].question,
        options: quizData.questions[currentQuestion].options
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
      const totalTimeSpent = Math.round((Date.now() - quizStartTime) / 1000);

      const response = await fetch(`/api/users/quizzes/${quizId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: userAnswers.map(ua => ua.answer),
          timeSpent: totalTimeSpent,
          score: score,
          totalQuestions: quizData.questions.length,
        }),
      });

      if (response.ok) {
        const completionData = await response.json();
        setMasteryData(completionData);
      } else {
        console.warn('Failed to save quiz completion to database');
      }
    } catch (error) {
      console.error('Error submitting complete quiz:', error);
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
    const currentQuestionData = quizData.questions[currentQuestion];
    await submitAnswer(currentQuestionData.id, -1);
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

    const currentQuestionData = quizData.questions[currentQuestion];
    const feedback = await submitAnswer(currentQuestionData.id, answerIndex);

    setUserAnswers(prev => [...prev, { 
      questionId: currentQuestionData.id, 
      answer: answerIndex, 
      correct: feedback?.isCorrect || false
    }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setAnswerFeedback(null);
      setTimeLeft(quizData.timer);
    } else {
      // Quiz completed - submit to database
      setIsQuizComplete(true);
      submitCompleteQuiz();
    }
  };

  const handleStartQuiz = () => {
    setShowInstructions(false);
    setQuizStarted(true);
    setQuizStartTime(Date.now());
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswerFeedback(null);
    setUserAnswers([]);
    setIsQuizComplete(false);
    setQuizStarted(false);
    setTimeLeft(quizData.timer);
    setQuizStartTime(0);
    setMasteryData(null);
    setShowInstructions(true);
  };

  const handleCloseQuiz = () => {
    router.push('/users/quiz');
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
      if (optionIndex === answerFeedback.correctAnswer) {
        return "bg-green-500 text-white shadow-lg border border-green-400";
      } else if (optionIndex === selectedAnswer && !answerFeedback.isCorrect) {
        return "bg-red-500 text-white shadow-lg border border-red-400";
      }
    }

    return "bg-gray-100 text-gray-500 border border-gray-200";
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz not found</h2>
          <button 
            onClick={handleCloseQuiz}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = quizData.questions[currentQuestion];
  const progressWidth = ((currentQuestion + 1) / quizData.questions.length) * 100;
  const isLastQuestion = currentQuestion === quizData.questions.length - 1;

  return (
    <div className="min-h-screen">
      {/* Header with better margins and alignment */}
      <div className="p-4 sm:p-6 mx-8 sm:mx-12 lg:mx-16">
        <div className="flex justify-between items-center text-gray-800 mb-4">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="bg-white/80 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-blue-200 shadow-sm">
              <span className="font-medium text-sm sm:text-base">Score: {score}/{quizData.questions.length}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-base sm:text-lg font-medium text-blue-700">{quizData.title}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="bg-white/80 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-blue-200 shadow-sm">
              <span className="font-medium text-sm sm:text-base">
                {currentQuestion + 1}/{quizData.questions.length}
              </span>
            </div>
            <button 
              onClick={handleCloseQuiz}
              className="bg-white/80 hover:bg-white backdrop-blur-md p-2.5 sm:p-3 rounded-full transition-colors border border-blue-200 shadow-sm" 
              aria-label="Close quiz"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Progress Bar with better spacing */}
        <div className="bg-white/50 backdrop-blur-sm rounded-full h-3 sm:h-4 border border-blue-200 shadow-sm">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 shadow-sm" 
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content with better margins */}
      <div className="px-4 sm:px-8 pb-6 mx-8 sm:mx-12 lg:mx-16">
        <div className="max-w-3xl mx-auto">
          {/* Timer */}
          <div className="text-center mb-6 sm:mb-8">
            <div className={`font-bold text-4xl sm:text-5xl ${getTimerColor()} drop-shadow-lg`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-gray-600 text-base sm:text-lg mt-1">Time Remaining</p>
          </div>

          {/* Question Image - Made bigger */}
          {currentQuestionData.image && (
            <div className="mb-6 sm:mb-8 flex justify-center">
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-blue-200 shadow-lg">
                <img 
                  src={currentQuestionData.image} 
                  alt="Question illustration"
                  className="max-w-full max-h-48 sm:max-h-60 object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.parentElement!.style.display = 'none';
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

          {/* Answer Options - Better margins matching the progress bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-4">
            {currentQuestionData.options.map((option: string, index: number) => (
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

          {/* Feedback */}
          {showFeedback && answerFeedback && (
            <div className="mb-6 sm:mb-8 max-w-lg mx-auto px-2 sm:px-4">
              <div className={`text-center py-3 sm:py-4 px-4 rounded-lg font-medium backdrop-blur-md border shadow-md ${
                answerFeedback.isCorrect 
                  ? "bg-green-100/80 text-green-800 border-green-200" 
                  : "bg-red-100/80 text-red-800 border-red-200"
              }`}>
                <div className="text-base sm:text-lg mb-1">
                  {answerFeedback.isCorrect 
                    ? "🎉 Excellent!" 
                    : `❌ ${selectedAnswer !== null ? "Not quite right" : "Time's up!"}`}
                </div>
                {!answerFeedback.isCorrect && (
                  <div className="text-sm">
                    Correct answer: <strong>{answerFeedback.correctAnswerText}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Button - Moved more to the right */}
          <div className="flex justify-end px-2 sm:px-8">
            <button
              onClick={handleNextQuestion}
              className={`px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-300 ${
                !showFeedback 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer shadow-lg hover:scale-105 transform border border-blue-600'
              }`}
              disabled={!showFeedback}
            >
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay Modals */}
      {showInstructions && (
        <QuizInstructions 
          topic={quizData.title}
          onStartQuiz={handleStartQuiz}
          onClose={handleCloseQuiz}
        />
      )}

      {isQuizComplete && (
        <QuizComplete 
          score={score}
          totalQuestions={quizData.questions.length}
          quizTitle={quizData.title}
          masteryData={masteryData}
          onRetakeQuiz={handleRetakeQuiz}
          onClose={handleCloseQuiz}
        />
      )}
    </div>
  );
}