// FILE: app/users/components/QuizCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

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

interface QuizCardProps {
  history: QuizHistory | null;
}

const QuizCard: React.FC<QuizCardProps> = ({ history }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="p-6">
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-4 text-center tracking-wide">
          HOW QUIZ SCORING WORKS
        </h2>

        <div className="flex items-center mb-4">
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
              Understanding Mastery <br />
              Levels & Rewards
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Your score combines 70% accuracy and 30% speed. Earn Perfect, Gold, Silver, or Bronze badges based on your mastery level.
            </p>
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="space-y-2 mt-4">
          {/* Mastery Score Section */}
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <button
              onClick={() => toggleSection('mastery')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Mastery Score Formula</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                  expandedSection === 'mastery' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSection === 'mastery' && (
              <div className="p-3 pt-0 space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">70%</div>
                  <span>Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">30%</div>
                  <span>Speed</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 mt-2">
                  <div className="font-bold text-xs mb-1">EXAMPLE:</div>
                  <div className="space-y-0.5">
                    <div>📝 10 questions × 30s = 300s total</div>
                    <div>✓ Got 8/10 correct = 80% accuracy</div>
                    <div>⚡ Took 180s = 40% efficiency</div>
                    <div className="pt-1 mt-1 border-t border-gray-300 dark:border-gray-600 font-bold text-blue-600 dark:text-blue-400">
                      Final = (80 × 0.7) + (40 × 0.3) = 68%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mastery Levels Section */}
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <button
              onClick={() => toggleSection('levels')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🏆</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Mastery Levels</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                  expandedSection === 'levels' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSection === 'levels' && (
              <div className="p-3 pt-0 space-y-1.5">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-2 flex items-center justify-between text-xs">
                  <span className="font-bold">⭐ Perfect</span>
                  <span>100% Accuracy</span>
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg p-2 flex items-center justify-between text-xs">
                  <span className="font-bold">🥇 Gold</span>
                  <span>90%+ Mastery</span>
                </div>
                <div className="bg-gradient-to-r from-gray-300 to-gray-400 text-white rounded-lg p-2 flex items-center justify-between text-xs">
                  <span className="font-bold">🥈 Silver</span>
                  <span>75%+ Mastery</span>
                </div>
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg p-2 flex items-center justify-between text-xs">
                  <span className="font-bold">🥉 Bronze</span>
                  <span>60%+ Mastery</span>
                </div>
              </div>
            )}
          </div>

          {/* Badge System Section */}
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <button
              onClick={() => toggleSection('badges')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🎁</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Badge System</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                  expandedSection === 'badges' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSection === 'badges' && (
              <div className="p-3 pt-0 space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span>🏅</span>
                    <span className="font-bold">Quiz Mastery Badges</span>
                  </div>
                  <div className="space-y-0.5">
                    <div>• 1-2 questions: Need 100%</div>
                    <div>• 3-5 questions: Need 80%+</div>
                    <div>• 6+ questions: Need 90%+</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded p-2">
                  <div className="font-bold mb-0.5">👑 Master All Badges</div>
                  <div>Achieve 90%+ on ALL sub-quizzes!</div>
                </div>
              </div>
            )}
          </div>

          {/* Pro Tips Section */}
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <button
              onClick={() => toggleSection('tips')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">💡</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Pro Tips</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                  expandedSection === 'tips' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSection === 'tips' && (
              <div className="p-3 pt-0 space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex gap-1.5 items-start">
                  <span className="text-blue-500">✦</span>
                  <span><span className="font-bold">Accuracy is king:</span> Worth 70% vs 30% for speed</span>
                </div>
                <div className="flex gap-1.5 items-start">
                  <span className="text-blue-500">✦</span>
                  <span><span className="font-bold">Perfect mastery:</span> Get 100% correct!</span>
                </div>
                <div className="flex gap-1.5 items-start">
                  <span className="text-blue-500">✦</span>
                  <span><span className="font-bold">Retake strategy:</span> Only best score counts</span>
                </div>
                <div className="flex gap-1.5 items-start">
                  <span className="text-blue-500">✦</span>
                  <span><span className="font-bold">Fresh challenge:</span> Questions shuffle each time</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;