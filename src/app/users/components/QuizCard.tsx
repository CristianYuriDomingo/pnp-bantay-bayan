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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6 relative">
      {/* Header Section */}
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5 relative">
        {/* Question Mark Icon */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center font-bold text-lg transition-all duration-200 hover:scale-110 shadow-lg"
          aria-label="Quiz information"
        >
          ?
        </button>

        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-4 text-center tracking-wide">
          HOW QUIZ SCORING WORKS
        </h2>

        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 relative mb-3 flex-shrink-0">
            <Image
              src="/QuizImage/PibiQuiz.png"
              alt="Quiz mascot"
              fill
              sizes="96px"
              className="object-contain"
              priority
            />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              Understanding Mastery Levels & Rewards
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
              Score = 95% accuracy + 5% speed bonus. Earn badges at 90%+ mastery: Perfect (100%), Gold (90%+), Silver (75%+), Bronze (60%+).
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop Blur */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40"
          onClick={() => setIsModalOpen(false)}
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 pointer-events-auto" onClick={() => setIsModalOpen(false)} />
          
          {/* Modal Content */}
          <div 
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Information</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Mastery Score Section */}
                <div className="border border-blue-300 dark:border-blue-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                  <div className="bg-blue-50 dark:bg-gray-700 px-5 py-4">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">Mastery Score Formula</span>
                  </div>
                  
                  <div className="p-5 space-y-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">95%</div>
                      <span className="font-medium">Accuracy (main factor)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">5%</div>
                      <span className="font-medium">Speed (bonus)</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 mt-3">
                      <div className="font-bold text-sm mb-2">EXAMPLE:</div>
                      <div className="space-y-1 text-sm">
                        <div>• Got 9/10 correct = 90% accuracy</div>
                        <div>• Took 180s of 300s = 40% time efficiency</div>
                        <div className="pt-2 mt-2 border-t border-gray-300 dark:border-gray-600 font-bold text-blue-600 dark:text-blue-400">
                          Final = (90 × 0.95) + (40 × 0.05) = 87.5%
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <div className="font-bold text-green-700 dark:text-green-400 text-sm">💡 Key Insight</div>
                      <div className="text-sm mt-1">Accuracy matters most! Speed is just a small bonus, so focus on getting answers right.</div>
                    </div>
                  </div>
                </div>

                {/* Mastery Levels Section */}
                <div className="border border-blue-300 dark:border-blue-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                  <div className="bg-blue-50 dark:bg-gray-700 px-5 py-4">
                    <span className="font-semibold text-gray-900 dark:text-white text-base">Mastery Levels</span>
                  </div>
                  
                  <div className="p-5">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-gradient-to-b from-purple-100 to-purple-200 rounded-lg p-3 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 relative mb-2">
                          <Image
                            src="/QuizImage/mastery/perfect-badge.png"
                            alt="Perfect"
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                        <span className="font-bold text-xs text-gray-900">Perfect</span>
                        <span className="text-[10px] text-gray-700">100% accuracy</span>
                      </div>
                      <div className="bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-lg p-3 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 relative mb-2">
                          <Image
                            src="/QuizImage/mastery/gold-badge.png"
                            alt="Gold"
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                        <span className="font-bold text-xs text-gray-900">Gold</span>
                        <span className="text-[10px] text-gray-700">90%+ mastery</span>
                      </div>
                      <div className="bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg p-3 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 relative mb-2">
                          <Image
                            src="/QuizImage/mastery/silver-badge.png"
                            alt="Silver"
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                        <span className="font-bold text-xs text-gray-900">Silver</span>
                        <span className="text-[10px] text-gray-700">75%+ mastery</span>
                      </div>
                      <div className="bg-gradient-to-b from-orange-100 to-orange-200 rounded-lg p-3 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 relative mb-2">
                          <Image
                            src="/QuizImage/mastery/bronze-badge.png"
                            alt="Bronze"
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                        <span className="font-bold text-xs text-gray-900">Bronze</span>
                        <span className="text-[10px] text-gray-700">60%+ mastery</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge System Section */}
                <div className="border border-blue-300 dark:border-blue-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                  <div className="bg-blue-50 dark:bg-gray-700 px-5 py-4">
                    <span className="font-semibold text-gray-900 dark:text-white text-base">Badge System</span>
                  </div>
                  
                  <div className="p-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="font-bold mb-2">Earning Badges</div>
                      <div className="space-y-2">
                        <div>Badges are awarded when you achieve <span className="font-bold text-blue-600 dark:text-blue-400">Gold mastery (90%+)</span> or <span className="font-bold text-purple-600 dark:text-purple-400">Perfect accuracy (100%)</span></div>
                        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="font-semibold mb-2">Requirements by Quiz Length:</div>
                          <div className="space-y-1">
                            <div>• 1-2 questions: Perfect (100%) required</div>
                            <div>• 3+ questions: 90%+ mastery required</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                      <div className="font-bold mb-2">🏆 Master All Sub-Quizzes</div>
                      <div>Achieve 90%+ mastery on ALL sub-quizzes to earn the ultimate parent quiz badge!</div>
                    </div>
                  </div>
                </div>

                {/* Pro Tips Section */}
                <div className="border border-blue-300 dark:border-blue-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                  <div className="bg-blue-50 dark:bg-gray-700 px-5 py-4">
                    <span className="font-semibold text-gray-900 dark:text-white text-base">Pro Tips</span>
                  </div>
                  
                  <div className="p-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex gap-3 items-start">
                      <span className="text-blue-500 text-base">✦</span>
                      <span><span className="font-bold">Accuracy is king:</span> Worth 95% vs only 5% for speed</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-blue-500 text-base">✦</span>
                      <span><span className="font-bold">Perfect mastery:</span> Get 100% correct for automatic Perfect rank!</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-blue-500 text-base">✦</span>
                      <span><span className="font-bold">Retake strategy:</span> Only your best score counts</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-blue-500 text-base">✦</span>
                      <span><span className="font-bold">Fresh challenge:</span> Questions shuffle each attempt</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCard;