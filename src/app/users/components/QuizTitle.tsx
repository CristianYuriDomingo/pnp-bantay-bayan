import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

interface ParentQuizTitleProps {
  parentQuizId: string; // Changed to just pass ID instead of full object
  masteryMap: Map<string, QuizMastery>;
  onParentQuizClick: (parentQuiz: Quiz) => void;
}

export default function ParentQuizTitle({ 
  parentQuizId,
  masteryMap,
  onParentQuizClick
}: ParentQuizTitleProps) {
  const [imageError, setImageError] = useState(false);
  const queryClient = useQueryClient();

  // Fetch parent quiz data with caching
  const { 
    data: parentQuiz, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['parentQuiz', parentQuizId],
    queryFn: async (): Promise<Quiz> => {
      const response = await fetch(`/api/quizzes/${parentQuizId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch quiz');
      }
      
      return data.data;
    },
    enabled: !!parentQuizId,
    staleTime: 30 * 60 * 1000, // 30 minutes - parent quizzes rarely change
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  // Listen for quiz update events (if quizzes can be edited)
  useEffect(() => {
    const handleQuizUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { quizId } = customEvent.detail;
      
      // Only refresh if this specific quiz was updated
      if (quizId === parentQuizId) {
        console.log(`🔄 Quiz ${quizId} updated - refreshing`);
        queryClient.invalidateQueries({ queryKey: ['parentQuiz', parentQuizId] });
      }
    };

    // Listen for mastery updates (when user completes quiz)
    const handleMasteryUpdated = () => {
      // Mastery data is passed via props, but we might want to refresh
      // the quiz data in case completion affects anything
      console.log(`📊 Mastery updated - light refresh`);
    };

    window.addEventListener('quizUpdated', handleQuizUpdated);
    window.addEventListener('masteryUpdated', handleMasteryUpdated);
    
    return () => {
      window.removeEventListener('quizUpdated', handleQuizUpdated);
      window.removeEventListener('masteryUpdated', handleMasteryUpdated);
    };
  }, [parentQuizId, queryClient]);

  const handleClick = () => {
    if (parentQuiz) {
      onParentQuizClick(parentQuiz);
    }
  };

  const fallbackBackground = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full px-2 md:px-4">
        <div className="relative w-full max-w-xl overflow-hidden rounded-2xl shadow-xl border-4 border-[#d4d4d4] bg-[#eaebe8] aspect-[16/9] min-h-[192px]">
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !parentQuiz) {
    return (
      <div className="flex justify-center items-center w-full px-2 md:px-4">
        <div className="relative w-full max-w-xl overflow-hidden rounded-2xl shadow-xl border-4 border-red-300 bg-red-50 aspect-[16/9] min-h-[192px]">
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-red-600 font-semibold mb-2">Failed to load quiz</p>
              <button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['parentQuiz', parentQuizId] })}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full px-2 md:px-4">
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl shadow-xl border-4 border-[#d4d4d4] bg-[#eaebe8]
                  transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
        onClick={handleClick}
        style={imageError ? fallbackBackground : {}}
      >
        {/* Background Image Container */}
        <div className="relative w-full aspect-[16/9] min-h-[192px]">
          {!imageError ? (
            <Image
              src="/QuizImage/PoliceTape.png"
              alt={`${parentQuiz.title} Background`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover rounded-2xl"
              priority
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-lg font-semibold">Image not found</div>
                <div className="text-sm opacity-75">PoliceTape.png</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Title Overlay */}
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
        
        {/* Subject Domain Badge */}
        {parentQuiz.subjectDomain && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md z-10">
            {parentQuiz.subjectDomain.replace('_', ' ')}
          </div>
        )}
      </div>
    </div>
  );
}