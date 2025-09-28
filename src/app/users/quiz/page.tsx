// app/users/quiz/page.tsx - Updated with parent-child quiz support
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

// Sub-quiz Modal Component
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{parentQuiz.title}</h2>
              <p className="text-gray-600 mt-1">{parentQuiz.children?.length || 0} quizzes available</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {parentQuiz.children && parentQuiz.children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parentQuiz.children.map((subQuiz) => (
                <div
                  key={subQuiz.id}
                  onClick={() => onQuizSelect(subQuiz.id)}
                  className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 cursor-pointer 
                           transition-transform duration-300 hover:scale-105 hover:shadow-xl text-white"
                >
                  {/* Mastery badge */}
                  {masteryMap.get(subQuiz.id)?.masteryLevel && (
                    <div className="absolute top-3 right-3 bg-white bg-opacity-20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                      {getMasteryIcon(masteryMap.get(subQuiz.id)?.masteryLevel || null)} {masteryMap.get(subQuiz.id)?.masteryLevel}
                    </div>
                  )}

                  {/* Quiz title */}
                  <h3 className="text-xl font-bold mb-3 leading-tight">{subQuiz.title}</h3>
                  
                  {/* Quiz details */}
                  <div className="space-y-2 text-sm opacity-90">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {subQuiz.questions?.length || 0} questions
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {subQuiz.timer}s per question
                    </div>
                    {masteryMap.get(subQuiz.id)?.attemptCount && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {masteryMap.get(subQuiz.id)?.attemptCount} attempts
                      </div>
                    )}
                  </div>

                  {/* Best score */}
                  {masteryMap.get(subQuiz.id)?.bestPercentage && (
                    <div className="mt-4 pt-3 border-t border-white border-opacity-20">
                      <div className="text-sm opacity-90">Best Score:</div>
                      <div className="text-lg font-bold">{Math.round(masteryMap.get(subQuiz.id)?.bestPercentage || 0)}%</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No sub-quizzes available in this category yet.</p>
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

// Updated QuizCard component (same as before)
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

// Parent Quiz Title Component (uses existing QuizTitle styling)
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

export default function Quiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
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
      
      // Separate parent quizzes from regular quizzes
      const parents = data.filter((quiz: Quiz) => quiz.isParent);
      const standaloneQuizzes = data.filter((quiz: Quiz) => !quiz.isParent && !quiz.parentId);
      
      setParentQuizzes(parents);
      // Only show standalone quizzes if there are no parent quizzes
      setQuizzes(parents.length === 0 ? standaloneQuizzes : []);
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

  const handleQuizSelect = (quizId: string) => {
    window.location.href = `/users/quizStart/${quizId}`;
  };

  const displayedParentQuizzes = showAll ? parentQuizzes : parentQuizzes.slice(0, 4);
  // Only show regular quizzes if there are no parent quizzes
  const displayedRegularQuizzes = parentQuizzes.length === 0 
    ? (showAll ? quizzes : quizzes.slice(0, 4))
    : [];

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
          
          {parentQuizzes.length === 0 && quizzes.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-lg text-gray-600">No quizzes available</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Display Parent Quizzes */}
              {displayedParentQuizzes.map((parentQuiz) => (
                <ParentQuizTitle
                  key={parentQuiz.id}
                  parentQuiz={parentQuiz}
                  masteryMap={masteryMap}
                  onParentQuizClick={handleParentQuizClick}
                />
              ))}

              {/* Display Regular Quizzes (standalone quizzes without parent) */}
              {displayedRegularQuizzes.map((quiz) => (
                <QuizTitle
                  key={quiz.id}
                  id={quiz.id}
                  title={quiz.title}
                  timer={quiz.timer}
                  questionCount={quiz.questionCount}
                  lessons={quiz.lessons}
                  createdAt={quiz.createdAt}
                  onQuizSelect={handleQuizSelect}
                />
              ))}
              
              {(parentQuizzes.length + quizzes.length) > 4 && (
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

      {/* Sub-Quiz Modal */}
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