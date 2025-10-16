import React, { useState } from 'react';

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
  parentQuiz: Quiz;
  masteryMap: Map<string, QuizMastery>;
  onParentQuizClick: (parentQuiz: Quiz) => void;
}

export default function ParentQuizTitle({ 
  parentQuiz,
  masteryMap,
  onParentQuizClick
}: ParentQuizTitleProps) {
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
}