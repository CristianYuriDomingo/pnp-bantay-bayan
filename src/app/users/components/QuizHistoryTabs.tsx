// FILE: app/users/components/QuizHistoryTabs.tsx
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
    case 'Perfect': return '/QuizImage/perfect-badge.png';
    case 'Gold': return '/QuizImage/gold-badge.png';
    case 'Silver': return '/QuizImage/silver-badge.png';
    case 'Bronze': return '/QuizImage/bronze-badge.png';
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Mastery Overview
          </button>
          <button
            onClick={() => setActiveTab('attempts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'attempts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Recent Attempts
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'overview' ? (
          /* Mastery Overview Tab */
          <div className="space-y-4">
            {masteryOverview.map((mastery) => (
              <div
                key={mastery.quizId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => router.push(`/users/quizStart/${mastery.quizId}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getMasteryImage(mastery.masteryLevel) ? (
                      <div className="w-10 h-10 relative flex-shrink-0">
                        <Image
                          src={getMasteryImage(mastery.masteryLevel)!}
                          alt={mastery.masteryLevel || 'No mastery'}
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center text-2xl">📝</div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{mastery.quizTitle}</h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {mastery.questionCount} questions • Attempted {mastery.attemptCount} times
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {mastery.masteryLevel ? (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getMasteryBadgeColor(mastery.masteryLevel)}`}>
                        {mastery.masteryLevel} ({Math.round(mastery.bestMasteryScore)}%)
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">No mastery yet</span>
                    )}
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Best: {mastery.bestScore}/{mastery.questionCount} ({Math.round(mastery.bestPercentage)}%)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Recent Attempts Tab */
          <div className="space-y-4">
            {attemptHistory.map((attempt) => (
              <div key={attempt.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getMasteryImage(attempt.masteryLevel) ? (
                      <div className="w-8 h-8 relative flex-shrink-0">
                        <Image
                          src={getMasteryImage(attempt.masteryLevel)!}
                          alt={attempt.masteryLevel || 'No mastery'}
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center text-xl">📝</div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{attempt.quizTitle}</h4>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(attempt.createdAt)}</div>
                    </div>
                  </div>
                  {attempt.masteryLevel && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getMasteryBadgeColor(attempt.masteryLevel)}`}>
                      {attempt.masteryLevel}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Score</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{attempt.score}/{attempt.totalQuestions} ({Math.round(attempt.percentage)}%)</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Time</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{formatDuration(attempt.timeSpent)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Efficiency</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{Math.round(attempt.timeEfficiency)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Mastery Score</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{Math.round(attempt.masteryScore)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistoryTabs;