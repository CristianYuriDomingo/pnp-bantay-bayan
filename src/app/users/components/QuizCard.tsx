
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
      {/* Header Section */}
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5 mb-4">
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              Understanding Mastery <br />
              Levels & Rewards
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Score = 70% accuracy + 30% speed. Earn badges: Perfect (100%), Gold (90%+), Silver (75%+), Bronze (60%+).
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2">
        {/* Mastery Score Section */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200">
          <button
            onClick={() => toggleSection('mastery')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 relative flex-shrink-0">
                <Image
                  src="/QuizImage/target-icon.png"
                  alt="Target"
                  fill
                  sizes="24px"
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Mastery Score Formula</span>
            </div>
            <svg
              className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform ${
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
            <div className="p-4 pt-4 space-y-3 text-xs text-gray-700 dark:text-gray-300 border-t border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">70%</div>
                <span>Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">30%</div>
                <span>Speed</span>
              </div>
              <div className="bg-blue-50 dark:bg-gray-800 rounded p-2 mt-2">
                <div className="font-bold text-xs mb-1">EXAMPLE:</div>
                <div className="space-y-0.5">
                  <div>• 10 questions × 30s = 300s total</div>
                  <div>• Got 8/10 correct = 80% accuracy</div>
                  <div>• Took 180s = 40% efficiency</div>
                  <div className="pt-1 mt-1 border-t border-gray-300 dark:border-gray-600 font-bold text-blue-600 dark:text-blue-400">
                    Final = (80 × 0.7) + (40 × 0.3) = 68%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mastery Levels Section */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200">
          <button
            onClick={() => toggleSection('levels')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 relative flex-shrink-0">
                <Image
                  src="/QuizImage/trophy-icon.png"
                  alt="Trophy"
                  fill
                  sizes="24px"
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">Mastery Levels</span>
            </div>
            <svg
              className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform duration-300 ${
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
            <div className="p-4 pt-4 border-t border-blue-200 dark:border-blue-700">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-2 flex flex-col items-center justify-center text-xs">
                  <div className="w-8 h-8 relative mb-1">
                    <Image
                      src="/QuizImage/perfect-badge.png"
                      alt="Perfect"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold">Perfect</span>
                  <span className="text-[10px]">100% Accuracy</span>
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg p-2 flex flex-col items-center justify-center text-xs">
                  <div className="w-8 h-8 relative mb-1">
                    <Image
                      src="/QuizImage/gold-badge.png"
                      alt="Gold"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold">Gold</span>
                  <span className="text-[10px]">90%+ Mastery</span>
                </div>
                <div className="bg-gradient-to-r from-gray-300 to-gray-400 text-white rounded-lg p-2 flex flex-col items-center justify-center text-xs">
                  <div className="w-8 h-8 relative mb-1">
                    <Image
                      src="/QuizImage/silver-badge.png"
                      alt="Silver"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold">Silver</span>
                  <span className="text-[10px]">75%+ Mastery</span>
                </div>
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg p-2 flex flex-col items-center justify-center text-xs">
                  <div className="w-8 h-8 relative mb-1">
                    <Image
                      src="/QuizImage/bronze-badge.png"
                      alt="Bronze"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold">Bronze</span>
                  <span className="text-[10px]">60%+ Mastery</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Badge System Section */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-200">
          <button
            onClick={() => toggleSection('badges')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 relative flex-shrink-0">
                <Image
                  src="/QuizImage/gift-icon.png"
                  alt="Gift"
                  fill
                  sizes="24px"
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">Badge System</span>
            </div>
            <svg
              className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform duration-300 ${
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
            <div className="p-4 pt-4 space-y-2 text-xs text-gray-700 dark:text-gray-300 border-t border-blue-200 dark:border-blue-700">
              <div className="bg-blue-50 dark:bg-gray-800 rounded p-2">
                <div className="font-bold mb-1">Earning Badges</div>
                <div className="space-y-1">
                  <div>Badges are awarded when you achieve <span className="font-bold text-blue-600 dark:text-blue-400">Gold mastery (90%+)</span> or <span className="font-bold text-purple-600 dark:text-purple-400">Perfect accuracy (100%)</span></div>
                  <div className="pt-1 mt-1 border-t border-gray-200 dark:border-gray-700">
                    <div className="font-semibold mb-0.5">Requirements by Quiz Length:</div>
                    <div>• 1-2 questions: Perfect (100%)</div>
                    <div>• 3-5 questions: 80%+ mastery</div>
                    <div>• 6+ questions: 90%+ mastery</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded p-2">
                <div className="font-bold mb-0.5">Master All Sub-Quizzes</div>
                <div>Achieve 90%+ mastery on ALL sub-quizzes to earn the ultimate parent quiz badge!</div>
              </div>
            </div>
          )}
        </div>

        {/* Pro Tips Section */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-200">
          <button
            onClick={() => toggleSection('tips')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 relative flex-shrink-0">
                <Image
                  src="/QuizImage/lightbulb-icon.png"
                  alt="Lightbulb"
                  fill
                  sizes="24px"
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">Pro Tips</span>
            </div>
            <svg
              className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform duration-300 ${
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
            <div className="p-4 pt-4 space-y-2 text-xs text-gray-700 dark:text-gray-300 border-t border-blue-200 dark:border-blue-700">
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
  );
};

export default QuizCard;