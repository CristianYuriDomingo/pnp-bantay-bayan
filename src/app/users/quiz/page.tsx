// FILE 5: app/users/quiz/page.tsx (Updated with mastery display)
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import QuizTitle from '../components/QuizTitle';
import QuizHistoryDashboard from '../components/QuizHistoryDashboard';
import { useRightColumn } from '../layout';

interface Quiz {
  id: string;
  title: string;
  timer: number;
  questionCount: number;
  lessons: string[];
  createdAt: string;
}

interface QuizMastery {
  quizId: string;
  masteryLevel: string | null;
  bestScore: number;
  bestPercentage: number;
  attemptCount: number;
}

interface QuizHistory {
  statistics: {
    totalAttempts: number;
    totalQuizzesAttempted: number;
    averageScore: number;
    masteryStats: {
      perfect: number;
      gold: number;
      silver: number;
      bronze: number;
      total: number;
    };
  };
  masteryOverview: QuizMastery[];
}

// Updated QuizCard component
const QuizCard = ({ history }: { history: QuizHistory | null }) => {
  return (
    <div className="p-6">
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-4 text-center tracking-wide">
          YOUR QUIZ HISTORY
        </h2>

        <div className="flex items-center">
          <div className="w-20 h-20 relative mr-4 flex-shrink-0">
            <Image
              src="/QuizImage/PibiQuiz.png"
              alt="Quiz mascot"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              Track Your Progress. <br />
              Earn Achievements.
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {history ? (
                <>
                  You've taken {history.statistics.totalQuizzesAttempted} quizzes with an average score of {Math.round(history.statistics.averageScore)}%. 
                  Keep practicing to earn badges and improve your knowledge!
                </>
              ) : (
                "View your quiz results and see how many modules you've completed. Keep practicing to earn badges and improve your knowledge!"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced QuizTitle component with mastery display
const QuizTitleWithMastery = ({ 
  quiz,
  mastery,
  onQuizSelect
}: {
  quiz: Quiz;
  mastery?: QuizMastery;
  onQuizSelect?: (id: string) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    if (onQuizSelect) {
      onQuizSelect(quiz.id);
    }
  };

  const getMasteryColor = (level: string | null) => {
    switch (level) {
      case 'Perfect': return 'bg-purple-500 text-white';
      case 'Gold': return 'bg-yellow-500 text-white';
      case 'Silver': return 'bg-gray-400 text-white';
      case 'Bronze': return 'bg-orange-500 text-white';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  const getMasteryIcon = (level: string | null) => {
    switch (level) {
      case 'Perfect': return '🏆';
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      case 'Bronze': return '🥉';
      default: return '📝';
    }
  };

  const fallbackBackground = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  return (
    <div className="flex justify-center items-center w-full px-2 md:px-4">
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl shadow-xl border-4 border-[#d4d4d4] bg-[#eaebe8]
                  transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
        onClick={handleClick}
        style={imageError ? fallbackBackground : {}}
      >
        {/* Image with error handling */}
        {!imageError && (
          <img
            src="/QuizImage/PoliceTape.png"
            alt={`${quiz.title} Background`}
            className="w-full h-auto object-cover rounded-2xl border-4 border-[#d4d4d4]"
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
        )}
        
        {/* Loading placeholder */}
        {!imageLoaded && !imageError && (
          <div className="w-full h-48 bg-gray-300 rounded-2xl border-4 border-[#d4d4d4] flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}
        
        {/* Error placeholder */}
        {imageError && (
          <div className="w-full h-48 rounded-2xl border-4 border-[#d4d4d4] flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-lg font-semibold">Image not found</div>
              <div className="text-sm opacity-75">PoliceTape.png</div>
            </div>
          </div>
        )}
        
        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <h2
            className="text-white font-extrabold uppercase text-center drop-shadow-md"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              lineHeight: "1.1",
              textShadow: "3px 3px 10px rgba(0, 0, 0, 0.8)",
              maxWidth: "90%",
              wordBreak: "break-word"
            }}
          >
            {quiz.title}
          </h2>
        </div>
        
        {/* Quiz info overlay */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {quiz.questionCount} questions
        </div>

        {/* Mastery badge overlay */}
        {mastery?.masteryLevel && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getMasteryColor(mastery.masteryLevel)} flex items-center space-x-1`}>
            <span>{getMasteryIcon(mastery.masteryLevel)}</span>
            <span>{mastery.masteryLevel}</span>
          </div>
        )}

        {/* Attempt count overlay */}
        {mastery?.attemptCount && mastery.attemptCount > 0 && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {mastery.attemptCount} attempts
          </div>
        )}
      </div>
    </div>
  );
};

export default function Quiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistory | null>(null);
  const [masteryMap, setMasteryMap] = useState<Map<string, QuizMastery>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { setRightColumnContent } = useRightColumn();

  // Set right column content when component mounts
  useEffect(() => {
    const rightColumnContent = (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-700">
          <QuizCard history={quizHistory} />
        </div>
        
        {/* Quiz History Dashboard */}
        {quizHistory && quizHistory.masteryOverview.length > 0 && (
          <div className="p-4">
            <QuizHistoryDashboard />
          </div>
        )}
      </div>
    );
    
    setRightColumnContent(rightColumnContent);
    
    return () => {
      setRightColumnContent(null);
    };
  }, [setRightColumnContent, quizHistory]);

  useEffect(() => {
    fetchQuizzes();
    fetchQuizHistory();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/users/quizzes');
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      const data = await response.json();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizHistory = async () => {
    try {
      const response = await fetch('/api/users/quizzes/history');
      if (response.ok) {
        const data = await response.json();
        setQuizHistory(data);
        
        // Create mastery map for easy lookup
        const masteryMap = new Map<string, QuizMastery>();
        data.masteryOverview.forEach((mastery: QuizMastery) => {
          masteryMap.set(mastery.quizId, mastery);
        });
        setMasteryMap(masteryMap);
      }
    } catch (err) {
      console.warn('Could not fetch quiz history:', err);
    }
  };

  const handleQuizSelect = (quizId: string) => {
    window.location.href = `/users/quizStart/${quizId}`;
  };

  const displayedQuizzes = showAll ? quizzes : quizzes.slice(0, 4);

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-20 py-6">
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="w-full flex justify-center mb-2">
              <Image
                src="/QuizImage/StartYourQuiz.png"
                alt="Start Your Quiz"
                width={400}
                height={140}
                className="w-full max-w-[400px] h-auto"
              />
            </div>
            <div className="flex justify-center items-center py-10">
              <div className="text-lg text-gray-600">Loading quizzes...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-20 py-6">
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="w-full flex justify-center mb-2">
              <Image
                src="/QuizImage/PibiQuiz.png"
                alt="Quiz Error"
                width={400}
                height={140}
                className="w-full max-w-[400px] h-auto"
              />
            </div>
            <div className="flex justify-center items-center py-10">
              <div className="text-lg text-red-600">Error: {error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-20 py-6">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="w-full flex justify-center mb-2">
            <Image
              src="/QuizImage/StartYourQuiz.png"
              alt="Start Your Quiz"
              width={400}
              height={140}
              className="w-full max-w-[400px] h-auto"
            />
          </div>
          
          {quizzes.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-lg text-gray-600">No quizzes available</div>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedQuizzes.map((quiz) => (
                <QuizTitleWithMastery
                  key={quiz.id}
                  quiz={quiz}
                  mastery={masteryMap.get(quiz.id)}
                  onQuizSelect={handleQuizSelect}
                />
              ))}
              
              {quizzes.length > 4 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    {showAll ? 'Show Less' : 'View More Categories'}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}