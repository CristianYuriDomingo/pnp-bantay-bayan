// FILE: app/users/quiz/page.tsx - Fixed to ONLY show parent quizzes
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
  isParent: boolean;
  parentId: string | null;
  subjectDomain: string | null;
  skillArea: string | null;
  children?: Quiz[];
  questions?: any[];
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

// Simple and Clean Sub-quiz Modal Component - Optimized for UI/UX
const SubQuizModal = ({ 
  parentQuiz, 
  masteryMap, 
  onClose, 
  onQuizSelect 
}: {
  parentQuiz: Quiz;
  masteryMap: Map<string, QuizMastery>;
  onClose: () => void;
  onQuizSelect: (quizId: string) => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 text-center pr-8">
            {parentQuiz.title}
          </h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            {parentQuiz.children?.length || 0} quizzes available
          </p>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {parentQuiz.children && parentQuiz.children.length > 0 ? (
            <div className="space-y-2">
              {parentQuiz.children.map((subQuiz, index) => {
                const mastery = masteryMap.get(subQuiz.id);
                const isAttempted = mastery && mastery.attemptCount > 0;
                const bestScore = mastery?.bestPercentage ? Math.round(mastery.bestPercentage) : null;
                
                return (
                  <div
                    key={subQuiz.id}
                    onClick={() => onQuizSelect(subQuiz.id)}
                    className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-700 truncate">
                              {subQuiz.title}
                            </h3>
                            
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>{subQuiz.questions?.length || 0} questions</span>
                              <span>{subQuiz.timer}s each</span>
                              {bestScore && (
                                <span className="text-green-600 font-medium">
                                  Best: {bestScore}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status indicator */}
                      <div className="ml-3 flex-shrink-0">
                        {isAttempted ? (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-blue-400"></div>
                        )}
                      </div>
                    </div>

                    {/* Mastery badge */}
                    {mastery?.masteryLevel && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {getMasteryIcon(mastery.masteryLevel)} {mastery.masteryLevel}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No quizzes available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for mastery icons
const getMasteryIcon = (level: string | null) => {
  switch (level) {
    case 'Perfect': return '🏆';
    case 'Gold': return '🥇';
    case 'Silver': return '🥈';
    case 'Bronze': return '🥉';
    default: return '📝';
  }
};

// QuizCard component (unchanged)
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

// Parent Quiz Title Component (unchanged)
const ParentQuizTitle = ({ 
  parentQuiz,
  masteryMap,
  onParentQuizClick
}: {
  parentQuiz: Quiz;
  masteryMap: Map<string, QuizMastery>;
  onParentQuizClick: (parentQuiz: Quiz) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    onParentQuizClick(parentQuiz);
  };

  // Calculate aggregate stats for parent quiz
  const subQuizCount = parentQuiz.children?.length || 0;
  const completedSubQuizzes = parentQuiz.children?.filter(subQuiz => 
    masteryMap.get(subQuiz.id)?.attemptCount && masteryMap.get(subQuiz.id)!.attemptCount > 0
  ).length || 0;

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
            alt={`${parentQuiz.title} Background`}
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
            {parentQuiz.title}
          </h2>
        </div>
        
        {/* Sub-quiz count overlay */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {subQuizCount} quizzes
        </div>

        {/* Progress indicator */}
        {completedSubQuizzes > 0 && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            {completedSubQuizzes}/{subQuizCount} completed
          </div>
        )}

        {/* Category badge if subject domain exists */}
        {parentQuiz.subjectDomain && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {parentQuiz.subjectDomain.replace('_', ' ')}
          </div>
        )}
      </div>
    </div>
  );
};

// MAIN COMPONENT - FIXED TO ONLY SHOW PARENT QUIZZES
export default function Quiz() {
  const [parentQuizzes, setParentQuizzes] = useState<Quiz[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistory | null>(null);
  const [masteryMap, setMasteryMap] = useState<Map<string, QuizMastery>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedParentQuiz, setSelectedParentQuiz] = useState<Quiz | null>(null);
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
      
      // FIXED: Only show parent quizzes (isParent: true)
      // This completely excludes all sub-quizzes from the main view
      const parentQuizzesOnly = data.filter((quiz: Quiz) => quiz.isParent);
      
      console.log('All quizzes from API:', data);
      console.log('Parent quizzes only:', parentQuizzesOnly);
      
      setParentQuizzes(parentQuizzesOnly);
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

  const handleParentQuizClick = (parentQuiz: Quiz) => {
    setSelectedParentQuiz(parentQuiz);
  };

  const handleSubQuizSelect = (quizId: string) => {
    setSelectedParentQuiz(null); // Close modal
    window.location.href = `/users/quizStart/${quizId}`;
  };

  const displayedParentQuizzes = showAll ? parentQuizzes : parentQuizzes.slice(0, 4);

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
          
          {parentQuizzes.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-lg text-gray-600">No quiz categories available</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Display Parent Quizzes Only */}
              {displayedParentQuizzes.map((parentQuiz) => (
                <ParentQuizTitle
                  key={parentQuiz.id}
                  parentQuiz={parentQuiz}
                  masteryMap={masteryMap}
                  onParentQuizClick={handleParentQuizClick}
                />
              ))}
              
              {parentQuizzes.length > 4 && (
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

      {/* Sub-Quiz Modal - Only shows when parent quiz is clicked */}
      {selectedParentQuiz && (
        <SubQuizModal
          parentQuiz={selectedParentQuiz}
          masteryMap={masteryMap}
          onClose={() => setSelectedParentQuiz(null)}
          onQuizSelect={handleSubQuizSelect}
        />
      )}
    </div>
  );
}