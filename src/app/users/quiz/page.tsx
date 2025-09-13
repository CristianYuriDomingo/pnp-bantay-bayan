// app/users/quiz/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import QuizTitle from '../components/QuizTitle'; // Adjust path as needed
import { useRightColumn } from '../layout'; // Import the hook

interface Quiz {
  id: string;
  title: string;
  timer: number;
  questionCount: number;
  lessons: string[];
  createdAt: string;
}

// QuizCard component styled like LearnCard2 from Dashboard
const QuizCard = () => {
  return (
    <div className="p-6">
      {/* Inner card with rounded corners and border */}
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        {/* Header */}
        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-4 text-center tracking-wide">
          YOUR QUIZ HISTORY
        </h2>

        {/* Main content */}
        <div className="flex items-center">
          {/* Character image */}
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

          {/* Text Content */}
          <div className="flex-1">
            {/* Bold statement */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              Track Your Progress. <br />
              Earn Achievements.
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              View your quiz results and see how many modules you've completed. Keep practicing to earn badges and improve your knowledge!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Quiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { setRightColumnContent } = useRightColumn(); // Use the hook

  // Set right column content when component mounts - styled like Dashboard
  useEffect(() => {
    const rightColumnContent = (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Quiz History Card */}
        <div className="border-b border-gray-100 dark:border-gray-700">
          <QuizCard />
        </div>
        
        {/* You can add more components here if needed */}
        {/* Example: Quiz Stats, Recent Quizzes, etc. */}
      </div>
    );
    
    setRightColumnContent(rightColumnContent);
    
    // Clean up when component unmounts
    return () => {
      setRightColumnContent(null);
    };
  }, [setRightColumnContent]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/users/quizzes');
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      const data = await response.json();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (quizId: string) => {
    // Navigate to specific quiz - in a real Next.js app, you'd use router.push
    console.log(`Navigating to quiz: ${quizId}`);
    // Example: router.push(`/quiz/${quizId}`);
    
    // For now, you can redirect using window.location or implement your navigation logic
    // window.location.href = `/quiz/${quizId}`;
  };

  const displayedQuizzes = showAll ? quizzes : quizzes.slice(0, 4);

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-20 py-6"> {/* Updated margins to match Dashboard */}
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
        <div className="px-20 py-6"> {/* Updated margins to match Dashboard */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="w-full flex justify-center mb-2">
              <Image
                src="/QuizImage/PibiQuiz.png"
                alt="Start Your Quiz"
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
      <div className="px-20 py-6"> {/* Updated margins to match Dashboard */}
        


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
          
          {quizzes.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-lg text-gray-600">No quizzes available</div>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedQuizzes.map((quiz) => (
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
              
              {/* View More Categories Button */}
              {quizzes.length > 4 && (
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
    </div>
  );
}