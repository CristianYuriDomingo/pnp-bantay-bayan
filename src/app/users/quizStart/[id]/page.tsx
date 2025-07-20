// src/app/users/quizStart/[id]/page.tsx
import React from 'react';
import QuizUI from './QuizUI'; // Import your QuizUI component

interface QuizStartPageProps {
  params: {
    id: string;
  };
}

export default function QuizStartPage({ params }: QuizStartPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Decorative fixed blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-30 transform translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full opacity-20 transform -translate-x-1/3 translate-y-1/4"></div>
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-[#7bc8ff] rounded-full opacity-20"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-green-100 rounded-full opacity-20"></div>
      </div>
      
      {/* Content with relative positioning */}
      <div className="relative z-10">
        <QuizUI quizId={params.id} />
      </div>
    </div>
  );
}