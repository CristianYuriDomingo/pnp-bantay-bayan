'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const popoverWidth = 300; // Small compact width
      
      let left = buttonRect.left - popoverWidth + buttonRect.width;
      let top = buttonRect.bottom + 12;

      // Adjust if popover goes off-screen
      if (left < 16) {
        left = 16;
      }
      if (left + popoverWidth > window.innerWidth) {
        left = window.innerWidth - popoverWidth - 16;
      }

      setPopoverPosition({ top, left });
    }
  }, [isModalOpen]);

  const handleClickOutside = (e: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target as Node) && 
        buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isModalOpen]);

  return (
    <div className="p-6 relative">
      {/* Header Section */}
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5 relative">
        {/* Question Mark Icon */}
        <button
          ref={buttonRef}
          onClick={() => setIsModalOpen(!isModalOpen)}
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
              Score = 70% accuracy + 30% speed. Earn badges: Perfect (100%), Gold (90%+), Silver (75%+), Bronze (60%+).
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

      {/* Popover Modal */}
      {isModalOpen && (
        <div 
          ref={popoverRef}
          className="fixed bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 z-50"
          style={{
            width: '300px',
            maxHeight: '50vh',
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
          }}
        >
          {/* Modal Header - Fixed */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quiz Information</h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {/* Mastery Score Section */}
              <div className="border border-blue-300 dark:border-blue-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                <div className="bg-blue-50 dark:bg-gray-700 px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 relative flex-shrink-0">
                    <Image
                      src="/QuizImage/QuizCard/MasteryScoreFormula.png"
                      alt="Target"
                      fill
                      sizes="20px"
                      className="object-contain"
                    />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Mastery Score Formula</span>
                </div>
                
                <div className="p-4 space-y-3 text-xs text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">70%</div>
                    <span>Accuracy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">30%</div>
                    <span>Speed</span>
                  </div>
                  <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-3 mt-2">
                    <div className="font-bold text-xs mb-1.5">EXAMPLE:</div>
                    <div className="space-y-0.5 text-xs">
                      <div>• Got 8/10 correct = 80% accuracy</div>
                      <div>• Took 180s = 40% efficiency</div>
                      <div className="pt-1.5 mt-1.5 border-t border-gray-300 dark:border-gray-600 font-bold text-blue-600 dark:text-blue-400">
                        Final = (80 × 0.7) + (40 × 0.3) = 68%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mastery Levels Section */}
              <div className="border border-blue-300 dark:border-blue-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                <div className="bg-blue-50 dark:bg-gray-700 px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 relative flex-shrink-0">
                    <Image
                      src="/QuizImage/QuizCard/MasteryLevels.png"
                      alt="Trophy"
                      fill
                      sizes="20px"
                      className="object-contain"
                    />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Mastery Levels</span>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-gradient-to-b from-purple-100 to-purple-200 rounded-lg p-2 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 relative mb-1">
                        <Image
                          src="/QuizImage/mastery/perfect-badge.png"
                          alt="Perfect"
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                      <span className="font-bold text-[10px] text-gray-900">Perfect</span>
                      <span className="text-[9px] text-gray-700">100%</span>
                    </div>
                    <div className="bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-lg p-2 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 relative mb-1">
                        <Image
                          src="/QuizImage/mastery/gold-badge.png"
                          alt="Gold"
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                      <span className="font-bold text-[10px] text-gray-900">Gold</span>
                      <span className="text-[9px] text-gray-700">90%+</span>
                    </div>
                    <div className="bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg p-2 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 relative mb-1">
                        <Image
                          src="/QuizImage/mastery/silver-badge.png"
                          alt="Silver"
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                      <span className="font-bold text-[10px] text-gray-900">Silver</span>
                      <span className="text-[9px] text-gray-700">75%+</span>
                    </div>
                    <div className="bg-gradient-to-b from-orange-100 to-orange-200 rounded-lg p-2 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 relative mb-1">
                        <Image
                          src="/QuizImage/mastery/bronze-badge.png"
                          alt="Bronze"
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                      <span className="font-bold text-[10px] text-gray-900">Bronze</span>
                      <span className="text-[9px] text-gray-700">60%+</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge System Section */}
              <div className="border border-blue-300 dark:border-blue-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                <div className="bg-blue-50 dark:bg-gray-700 px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 relative flex-shrink-0">
                    <Image
                      src="/QuizImage/QuizCard/BadgeSystem.png"
                      alt="Gift"
                      fill
                      sizes="20px"
                      className="object-contain"
                    />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Badge System</span>
                </div>
                
                <div className="p-4 space-y-2 text-xs text-gray-700 dark:text-gray-300">
                  <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="font-bold mb-1.5">Earning Badges</div>
                    <div className="space-y-1">
                      <div>Badges are awarded when you achieve <span className="font-bold text-blue-600 dark:text-blue-400">Gold mastery (90%+)</span> or <span className="font-bold text-purple-600 dark:text-purple-400">Perfect accuracy (100%)</span></div>
                      <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="font-semibold mb-1">Requirements by Quiz Length:</div>
                        <div>• 1-2 questions: Perfect (100%)</div>
                        <div>• 3-5 questions: 80%+ mastery</div>
                        <div>• 6+ questions: 90%+ mastery</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3">
                    <div className="font-bold mb-1">Master All Sub-Quizzes</div>
                    <div>Achieve 90%+ mastery on ALL sub-quizzes to earn the ultimate parent quiz badge!</div>
                  </div>
                </div>
              </div>

              {/* Pro Tips Section */}
              <div className="border border-blue-300 dark:border-blue-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                <div className="bg-blue-50 dark:bg-gray-700 px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 relative flex-shrink-0">
                    <Image
                      src="/QuizImage/QuizCard/ProTips.png"
                      alt="Lightbulb"
                      fill
                      sizes="20px"
                      className="object-contain"
                    />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Pro Tips</span>
                </div>
                
                <div className="p-4 space-y-2 text-xs text-gray-700 dark:text-gray-300">
                  <div className="flex gap-2 items-start">
                    <span className="text-blue-500 text-sm">✦</span>
                    <span><span className="font-bold">Accuracy is king:</span> Worth 70% vs 30% for speed</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-blue-500 text-sm">✦</span>
                    <span><span className="font-bold">Perfect mastery:</span> Get 100% correct!</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-blue-500 text-sm">✦</span>
                    <span><span className="font-bold">Retake strategy:</span> Only best score counts</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-blue-500 text-sm">✦</span>
                    <span><span className="font-bold">Fresh challenge:</span> Questions shuffle each time</span>
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