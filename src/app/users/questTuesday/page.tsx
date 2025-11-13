// app/users/questTuesday/page.tsx
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, X, Trophy } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  correctAnswer: boolean;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Should I join terrorist groups?",
    correctAnswer: false,
    explanation: "Never join terrorist groups. They promote violence and harm innocent people."
  },
  {
    id: 2,
    question: "Should I report suspicious activities to the police?",
    correctAnswer: true,
    explanation: "Yes! Reporting suspicious activities helps keep our community safe."
  },
  {
    id: 3,
    question: "Is it okay to share fake news about crimes?",
    correctAnswer: false,
    explanation: "Sharing fake news causes panic and misinformation. Always verify before sharing."
  },
  {
    id: 4,
    question: "Should I cooperate with police officers when asked?",
    correctAnswer: true,
    explanation: "Cooperation with law enforcement helps maintain peace and order."
  },
  {
    id: 5,
    question: "Can I take the law into my own hands?",
    correctAnswer: false,
    explanation: "Vigilante actions are illegal. Always let authorities handle law enforcement."
  }
];

export default function QuestTrueFalse() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const handleAnswer = (answer: boolean) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setGameOver(true);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false);
      setSelectedAnswer(null);
      setIsCorrect(false);
    } else {
      setGameWon(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setLives(3);
    setScore(0);
    setShowFeedback(false);
    setSelectedAnswer(null);
    setIsCorrect(false);
    setGameOver(false);
    setGameWon(false);
  };

  const progress = (currentQuestion / questions.length) * 100;

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-400 to-red-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-32 h-32 mx-auto mb-6">
              <img 
                src="/Quest/questTuesday/jail.png" 
                alt="Jail" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-black text-gray-800 mb-2">Pibi goes to jail.</h1>
            <p className="text-xl text-gray-600 mb-8">
              All bullets are gone!
            </p>
            <button
              onClick={handleRestart}
              className="w-full py-4 bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-transform active:scale-95"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameWon) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-32 h-32 mx-auto mb-6">
              <img 
                src="/Quest/questTuesday/free.png" 
                alt="Free" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-black text-gray-800 mb-2">Pibi stays free</h1>
            <p className="text-2xl text-gray-600 mb-8">You passed the safety test!</p>
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full py-4 bg-gradient-to-b from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-transform active:scale-95"
              >
                CONTINUE
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-4 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-2xl font-bold text-lg transition-transform active:scale-95"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
            >
              <X size={28} className="text-gray-600 sm:w-8 sm:h-8" />
            </button>
            <div className="flex-1 mx-4 sm:mx-6">
              <div className="h-5 sm:h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {[...Array(3)].map((_, i) => (
                <img
                  key={i}
                  src="/Quest/questTuesday/bullet.png"
                  alt="Life"
                  className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 object-contain ${i < lives ? "opacity-100" : "opacity-30 grayscale"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-center min-h-[calc(100vh-300px)] sm:min-h-[calc(100vh-340px)]">
        {!showFeedback ? (
          <div className="w-full flex flex-col items-center justify-center">
            {/* Question */}
            <div className="mb-12 sm:mb-16 md:mb-24 w-full">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-center px-4 leading-tight">
                {questions[currentQuestion].question}
              </h2>
            </div>

            {/* Answer Buttons */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 w-full max-w-xl lg:max-w-2xl px-4">
              <div className="flex-1 max-w-[180px] sm:max-w-[220px] md:max-w-[260px]">
                <img 
                  src="/Quest/questTuesday/true.png" 
                  alt="True" 
                  onClick={() => handleAnswer(true)}
                  className="w-full h-auto cursor-pointer hover:scale-105 transition-transform active:scale-95 select-none"
                />
              </div>

              <div className="flex-1 max-w-[180px] sm:max-w-[220px] md:max-w-[260px]">
                <img 
                  src="/Quest/questTuesday/false.png"
                  alt="False"
                  onClick={() => handleAnswer(false)}
                  className="w-full h-auto cursor-pointer hover:scale-105 transition-transform active:scale-95 select-none"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl px-4">
            {/* Feedback Screen */}
            <div className="text-center mb-8 sm:mb-12">
              <div className={`w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center ${
                isCorrect ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isCorrect ? (
                  <Check size={56} className="text-green-500 sm:w-16 sm:h-16" />
                ) : (
                  <X size={56} className="text-red-500 sm:w-16 sm:h-16" />
                )}
              </div>
              
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 ${
                isCorrect ? 'text-green-500' : 'text-red-500'
              }`}>
                {isCorrect ? 'Awesome!' : 'Not quite!'}
              </h2>

              <div className={`max-w-xl mx-auto p-4 sm:p-6 rounded-2xl ${
                isCorrect ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className={`text-base sm:text-lg font-medium ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {questions[currentQuestion].explanation}
                </p>
              </div>
            </div>

            {/* Continue Button */}
            <div className="w-full">
              <button
                onClick={handleNext}
                className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl text-white shadow-lg transition-transform active:scale-95 ${
                  isCorrect 
                    ? 'bg-gradient-to-b from-green-400 to-green-500 hover:from-green-500 hover:to-green-600' 
                    : 'bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600'
                }`}
              >
                {currentQuestion < questions.length - 1 ? 'CONTINUE' : 'FINISH'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6">
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <img 
                src="/Quest/think.png" 
                alt="Bantay Mascot" 
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-3 text-lg">How to Play: Free or Jail</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• <strong>Answer Questions:</strong> Click TRUE or FALSE for each safety question</li>
                <li>• <strong>Three Lives:</strong> You have 3 bullets - lose one for each wrong answer</li>
                <li>• <strong>Goal:</strong> Answer all questions before running out of bullets</li>
                <li>• <strong>Win:</strong> Keep Pibi free by making smart, safe choices!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-20" />
    </div>
  );
}