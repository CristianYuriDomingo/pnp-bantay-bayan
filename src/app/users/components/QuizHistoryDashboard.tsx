// FILE 4: app/users/components/QuizHistoryDashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

interface QuizHistoryData {
  masteryOverview: MasteryOverview[];
  attemptHistory: AttemptHistory[];
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
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

const QuizHistoryDashboard = () => {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<QuizHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attempts'>('overview');

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/quizzes/history');
      if (!response.ok) {
        throw new Error('Failed to fetch quiz history');
      }
      const data = await response.json();
      setHistoryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMasteryColor = (level: string | null) => {
    switch (level) {
      case 'Perfect': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Bronze': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={fetchQuizHistory}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!historyData || historyData.masteryOverview.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Quiz History</h3>
          <p className="text-gray-600 mb-4">Complete some quizzes to see your progress here!</p>
          <button
            onClick={() => router.push('/users/quiz')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Take a Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quiz Performance</h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{historyData.statistics.totalAttempts}</div>
            <div className="text-sm text-blue-700">Total Attempts</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{historyData.statistics.totalQuizzesAttempted}</div>
            <div className="text-sm text-green-700">Quizzes Tried</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(historyData.statistics.averageScore)}%</div>
            <div className="text-sm text-purple-700">Avg Score</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{historyData.statistics.masteryStats.total}</div>
            <div className="text-sm text-yellow-700">Masteries</div>
          </div>
        </div>

        {/* Mastery Level Breakdown */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-purple-50 rounded p-3 text-center">
            <div className="text-lg">🏆</div>
            <div className="font-medium text-purple-800">{historyData.statistics.masteryStats.perfect}</div>
            <div className="text-xs text-purple-600">Perfect</div>
          </div>
          <div className="bg-yellow-50 rounded p-3 text-center">
            <div className="text-lg">🥇</div>
            <div className="font-medium text-yellow-800">{historyData.statistics.masteryStats.gold}</div>
            <div className="text-xs text-yellow-600">Gold</div>
          </div>
          <div className="bg-gray-50 rounded p-3 text-center">
            <div className="text-lg">🥈</div>
            <div className="font-medium text-gray-800">{historyData.statistics.masteryStats.silver}</div>
            <div className="text-xs text-gray-600">Silver</div>
          </div>
          <div className="bg-orange-50 rounded p-3 text-center">
            <div className="text-lg">🥉</div>
            <div className="font-medium text-orange-800">{historyData.statistics.masteryStats.bronze}</div>
            <div className="text-xs text-orange-600">Bronze</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mastery Overview
            </button>
            <button
              onClick={() => setActiveTab('attempts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attempts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              {historyData.masteryOverview.map((mastery) => (
                <div
                  key={mastery.quizId}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/users/quizStart/${mastery.quizId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getMasteryIcon(mastery.masteryLevel)}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{mastery.quizTitle}</h3>
                        <div className="text-sm text-gray-500">
                          {mastery.questionCount} questions • Attempted {mastery.attemptCount} times
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {mastery.masteryLevel ? (
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getMasteryColor(mastery.masteryLevel)}`}>
                          {mastery.masteryLevel} ({Math.round(mastery.bestMasteryScore)}%)
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No mastery yet</span>
                      )}
                      <div className="text-sm text-gray-500 mt-1">
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
              {historyData.attemptHistory.map((attempt) => (
                <div key={attempt.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{getMasteryIcon(attempt.masteryLevel)}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{attempt.quizTitle}</h4>
                        <div className="text-sm text-gray-500">{formatDate(attempt.createdAt)}</div>
                      </div>
                    </div>
                    {attempt.masteryLevel && (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getMasteryColor(attempt.masteryLevel)}`}>
                        {attempt.masteryLevel}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Score</div>
                      <div className="font-medium">{attempt.score}/{attempt.totalQuestions} ({Math.round(attempt.percentage)}%)</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Time</div>
                      <div className="font-medium">{formatDuration(attempt.timeSpent)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Efficiency</div>
                      <div className="font-medium">{Math.round(attempt.timeEfficiency)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Mastery Score</div>
                      <div className="font-medium">{Math.round(attempt.masteryScore)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizHistoryDashboard;