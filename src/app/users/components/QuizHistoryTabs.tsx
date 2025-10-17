"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MasteryOverview {
  quizId: string;
  quizTitle: string;
  questionCount: number;
  masteryLevel: string | null;
  bestScore: number;
  bestPercentage: number;
  bestMasteryScore: number;
  attemptCount: number;
  firstAttemptAt: string;
  bestAttemptAt: string;
  lastAttemptAt: string;
}

interface AttemptHistory {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  timeAllowed: number;
  timeEfficiency: number;
  masteryScore: number;
  masteryLevel: string | null;
  createdAt: string;
}

interface QuizHistoryTabsProps {
  masteryOverview: MasteryOverview[];
  attemptHistory: AttemptHistory[];
}

const ITEMS_PER_PAGE = 3;

const getMasteryBadgeColor = (level: string | null) => {
  switch (level) {
    case 'Perfect': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'Bronze': return 'bg-orange-100 text-orange-800 border-orange-300';
    default: return 'bg-gray-50 text-gray-500 border-gray-200';
  }
};

const getMasteryImage = (level: string | null) => {
  switch (level) {
    case 'Perfect': return '/QuizImage/mastery/perfect-badge.png';
    case 'Gold': return '/QuizImage/mastery/gold-badge.png';
    case 'Silver': return '/QuizImage/mastery/silver-badge.png';
    case 'Bronze': return '/QuizImage/mastery/bronze-badge.png';
    default: return null;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const QuizHistoryTabs: React.FC<QuizHistoryTabsProps> = ({ masteryOverview, attemptHistory }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'attempts'>('overview');
  const [overviewPage, setOverviewPage] = React.useState(0);
  const [attemptsPage, setAttemptsPage] = React.useState(0);

  const overviewTotalPages = Math.ceil(masteryOverview.length / ITEMS_PER_PAGE);
  const attemptsTotalPages = Math.ceil(attemptHistory.length / ITEMS_PER_PAGE);

  const displayedOverview = masteryOverview.slice(
    overviewPage * ITEMS_PER_PAGE,
    (overviewPage + 1) * ITEMS_PER_PAGE
  );

  const displayedAttempts = attemptHistory.slice(
    attemptsPage * ITEMS_PER_PAGE,
    (attemptsPage + 1) * ITEMS_PER_PAGE
  );

  const handleOverviewNext = () => {
    if (overviewPage < overviewTotalPages - 1) {
      setOverviewPage(overviewPage + 1);
    }
  };

  const handleOverviewPrev = () => {
    if (overviewPage > 0) {
      setOverviewPage(overviewPage - 1);
    }
  };

  const handleAttemptsNext = () => {
    if (attemptsPage < attemptsTotalPages - 1) {
      setAttemptsPage(attemptsPage + 1);
    }
  };

  const handleAttemptsPrev = () => {
    if (attemptsPage > 0) {
      setAttemptsPage(attemptsPage - 1);
    }
  };

  const handleTabChange = (tab: 'overview' | 'attempts') => {
    setActiveTab(tab);
    if (tab === 'overview') {
      setOverviewPage(0);
    } else {
      setAttemptsPage(0);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="border-b border-gray-100 dark:border-gray-700">
        <nav className="flex justify-center space-x-1 px-5 pt-4">
          <button
            onClick={() => handleTabChange('overview')}
            className={`pb-3 px-6 border-b-2 font-semibold text-sm transition-all relative ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
          >
            Mastery Overview
          </button>
          <button
            onClick={() => handleTabChange('attempts')}
            className={`pb-3 px-6 border-b-2 font-semibold text-sm transition-all relative ${
              activeTab === 'attempts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
          >
            Recent Attempts
          </button>
        </nav>
      </div>

      <div className="p-5">
        {activeTab === 'overview' ? (
          <div className="space-y-3">
            {displayedOverview.map((mastery) => (
              <div
                key={mastery.quizId}
                className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer shadow-sm hover:shadow border border-gray-100 dark:border-gray-700"
                onClick={() => router.push(`/users/quizStart/${mastery.quizId}`)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 relative flex-shrink-0">
                      {getMasteryImage(mastery.masteryLevel) ? (
                        <Image
                          src={getMasteryImage(mastery.masteryLevel)!}
                          alt={mastery.masteryLevel || 'No mastery'}
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      ) : (
                        <Image
                          src="/QuizImage/Mastery/NoMastery.png"
                          alt="No mastery"
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate leading-tight">{mastery.quizTitle}</h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {mastery.questionCount} questions • {mastery.attemptCount} attempts
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center flex-shrink-0">
                    {mastery.masteryLevel ? (
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getMasteryBadgeColor(mastery.masteryLevel)}`}>
                        {mastery.masteryLevel} ({Math.round(mastery.bestMasteryScore)}%)
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">No mastery</span>
                    )}
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 font-medium whitespace-nowrap">
                      Best: {mastery.bestScore}/{mastery.questionCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {overviewTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleOverviewPrev}
                  disabled={overviewPage === 0}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page"
                >
                  <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex gap-1.5">
                  {Array.from({ length: overviewTotalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setOverviewPage(index)}
                      className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all ${
                        overviewPage === index
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleOverviewNext}
                  disabled={overviewPage === overviewTotalPages - 1}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page"
                >
                  <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedAttempts.map((attempt) => (
              <div key={attempt.id} className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getMasteryImage(attempt.masteryLevel) ? (
                      <div className="w-9 h-9 relative flex-shrink-0">
                        <Image
                          src={getMasteryImage(attempt.masteryLevel)!}
                          alt={attempt.masteryLevel || 'No mastery'}
                          fill
                          sizes="36px"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 relative flex-shrink-0">
                        <Image
                          src="/QuizImage/Mastery/NoMastery.png"
                          alt="No mastery"
                          fill
                          sizes="36px"
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{attempt.quizTitle}</h4>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(attempt.createdAt)}</div>
                    </div>
                  </div>
                  {attempt.masteryLevel && (
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ml-3 ${getMasteryBadgeColor(attempt.masteryLevel)}`}>
                      {attempt.masteryLevel}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-0.5">Score</div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{attempt.score}/{attempt.totalQuestions} ({Math.round(attempt.percentage)}%)</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-0.5">Time</div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{formatDuration(attempt.timeSpent)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-0.5">Efficiency</div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{Math.round(attempt.timeEfficiency)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-0.5">Mastery Score</div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{Math.round(attempt.masteryScore)}%</div>
                  </div>
                </div>
              </div>
            ))}

            {attemptsTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleAttemptsPrev}
                  disabled={attemptsPage === 0}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page"
                >
                  <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex gap-1.5">
                  {Array.from({ length: attemptsTotalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setAttemptsPage(index)}
                      className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all ${
                        attemptsPage === index
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleAttemptsNext}
                  disabled={attemptsPage === attemptsTotalPages - 1}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page"
                >
                  <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistoryTabs;