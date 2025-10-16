// FILE: app/users/quiz/page.tsx - Complete File
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import QuizTitle from '../components/QuizTitle';
import MasteryAchievements from '../components/QuizMasteryAchievements';
import QuizCard from '../components/QuizCard';
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

// Helper function to get mastery image path
const getMasteryImage = (level: string | null) => {
  switch (level) {
    case 'Perfect': return '/QuizImage/perfect.png';
    case 'Gold': return '/QuizImage/gold.png';
    case 'Silver': return '/QuizImage/silver.png';
    case 'Bronze': return '/QuizImage/bronze.png';
    default: return null;
  }
};

// Simplified Sub-quiz Modal Component
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
  const [hoveredQuizId, setHoveredQuizId] = useState<string | null>(null);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-blue-500 px-6 py-6">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          
          <h2 className="text-2xl font-bold text-white text-center pr-6 mb-2">
            {parentQuiz.title}
          </h2>
          <p className="text-white text-center text-lg font-medium">
            Select a quiz to begin
          </p>
          
          {/* Quiz Stats */}
          <div className="flex items-center justify-center gap-3 mt-4 text-white/90 text-sm">
            <span className="font-medium">{parentQuiz.children?.length || 0} quizzes</span>
            {parentQuiz.children && parentQuiz.children.length > 0 && (
              <>
                <span>•</span>
                <span className="font-medium">
                  {parentQuiz.children.filter(subQuiz => 
                    masteryMap.get(subQuiz.id)?.attemptCount && masteryMap.get(subQuiz.id)!.attemptCount > 0
                  ).length} completed
                </span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[calc(85vh-140px)] overflow-y-auto bg-gray-50">
          {parentQuiz.children && parentQuiz.children.length > 0 ? (
            <div className="space-y-3">
              {parentQuiz.children.map((subQuiz, index) => {
                const mastery = masteryMap.get(subQuiz.id);
                const isAttempted = mastery && mastery.attemptCount > 0;
                const questionCount = subQuiz.questions?.length || 0;
                const masteryImage = mastery?.masteryLevel ? getMasteryImage(mastery.masteryLevel) : null;
                
                return (
                  <div
                    key={subQuiz.id}
                    onClick={() => onQuizSelect(subQuiz.id)}
                    className="group relative bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 border-2 border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-md"
                    onMouseEnter={() => setHoveredQuizId(subQuiz.id)}
                    onMouseLeave={() => setHoveredQuizId(null)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Left: Number Circle with Mastery Badge Overlay */}
                      <div className="flex-shrink-0 relative">
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                        
                        {/* Mastery Badge Overlay */}
                        {isAttempted && masteryImage && (
                          <div className="absolute -top-1 -left-1">
                            <div 
                              className="relative"
                              onMouseEnter={() => setHoveredQuizId(subQuiz.id)}
                              onMouseLeave={() => setHoveredQuizId(null)}
                            >
                              <Image
                                src={masteryImage}
                                alt={mastery.masteryLevel || ''}
                                width={24}
                                height={24}
                                className="object-contain drop-shadow-lg"
                              />
                              
                              {/* Tooltip */}
                              {hoveredQuizId === subQuiz.id && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap pointer-events-none z-10">
                                  {mastery.masteryLevel}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Center: Quiz Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
                            {subQuiz.title}
                          </h3>
                          {isAttempted && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">
                              Best: {Math.round(mastery.bestPercentage)}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {questionCount} questions
                        </p>
                      </div>

                      {/* Right: Timer Badge */}
                      <div className="flex-shrink-0">
                        <div className="flex flex-col items-center gap-1">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-medium text-gray-600">{subQuiz.timer}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-base font-medium">No quizzes available</p>
              <p className="text-gray-400 text-sm mt-1">Check back later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Parent Quiz Title Component
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
        
        {!imageLoaded && !imageError && (
          <div className="w-full h-48 bg-gray-300 rounded-2xl border-4 border-[#d4d4d4] flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}
        
        {imageError && (
          <div className="w-full h-48 rounded-2xl border-4 border-[#d4d4d4] flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-lg font-semibold">Image not found</div>
              <div className="text-sm opacity-75">PoliceTape.png</div>
            </div>
          </div>
        )}
        
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
        
        {parentQuiz.subjectDomain && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {parentQuiz.subjectDomain.replace('_', ' ')}
          </div>
        )}
      </div>
    </div>
  );
};

// MAIN COMPONENT
export default function Quiz() {
  const [parentQuizzes, setParentQuizzes] = useState<Quiz[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistory | null>(null);
  const [masteryMap, setMasteryMap] = useState<Map<string, QuizMastery>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedParentQuiz, setSelectedParentQuiz] = useState<Quiz | null>(null);
  const { setRightColumnContent } = useRightColumn();

  useEffect(() => {
    const rightColumnContent = (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-700">
          <QuizCard history={quizHistory} />
        </div>
        
        {quizHistory && quizHistory.statistics && (
          <div className="p-4">
            <MasteryAchievements masteryStats={quizHistory.statistics.masteryStats} />
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
    setSelectedParentQuiz(null);
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