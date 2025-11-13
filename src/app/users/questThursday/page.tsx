// app/users/questThursday/page.tsx
'use client';
import React, { useState } from 'react';
import { X, Trophy, Check } from 'lucide-react';

interface Item {
  id: number;   
  name: string;
  image: string;
  isAllowed: boolean;
  explanation: string;
}

const items: Item[] = [
  {
    id: 1,
    name: "KNIFE",
    image: "/Quest/questThursday/knife.png",
    isAllowed: false,
    explanation: "Knives are dangerous weapons and are confiscated for everyone's safety."
  },
  {
    id: 2,
    name: "BOOK",
    image: "/Quest/questThursday/book.png",
    isAllowed: true,
    explanation: "Books are allowed! Reading materials are safe and educational."
  },
  {
    id: 3,
    name: "GUN",
    image: "/Quest/questThursday/gun.png",
    isAllowed: false,
    explanation: "Firearms are strictly prohibited and will be confiscated immediately."
  },
  {
    id: 4,
    name: "PHONE",
    image: "/Quest/questThursday/phone.png",
    isAllowed: true,
    explanation: "Mobile phones are allowed for communication and emergencies."
  },
  {
    id: 5,
    name: "DRUGS",
    image: "/Quest/questThursday/drugs.png",
    isAllowed: false,
    explanation: "Illegal drugs are prohibited and will be confiscated by authorities."
  }
];

export default function ConfiscatedAllowedGame() {
  const [currentItem, setCurrentItem] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const handleAnswer = (answer: boolean) => {
    if (showFeedback) return;

    const correct = answer === items[currentItem].isAllowed;
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
    if (currentItem < items.length - 1) {
      setCurrentItem(currentItem + 1);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      setGameWon(true);
    }
  };

  const handleRestart = () => {
    setCurrentItem(0);
    setLives(3);
    setScore(0);
    setShowFeedback(false);
    setIsCorrect(false);
    setGameOver(false);
    setGameWon(false);
  };

  const progress = (currentItem / items.length) * 100;

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-400 to-red-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="w-32 h-32 mx-auto mb-6">
              <img 
                src="/Quest/questThursday/kickedoff.png" 
                alt="Kicked Off" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-black text-gray-800 mb-2">General kicked you off.</h1>
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
                src="/Quest/questThursday/promoted.png" 
                alt="Promoted" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-black text-gray-800 mb-2">General promoting you</h1>
            <p className="text-2xl text-gray-600 mb-8">You passed the inspection!</p>
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
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
              aria-label="Go back"
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
                  src="/Quest/questThursday/bullet.png"
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
            {/* Mascot and Item */}
            <div className="relative mb-8 sm:mb-12 z-20">
              {/* Speech Bubble */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg px-6 py-4 border border-gray-200 min-w-[200px]">
                <div className="text-center">
                  <img 
                    src={items[currentItem].image} 
                    alt={items[currentItem].name}
                    className="w-16 h-16 mx-auto mb-2 object-contain"
                  />
                  <p className="text-2xl font-bold text-gray-800">{items[currentItem].name}</p>
                </div>
                {/* Speech bubble tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
              </div>

              {/* Mascot */}
              <img 
                src="/Quest/questThursday/mascot.png" 
                alt="Police Mascot"
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain mx-auto mt-24"
              />
            </div>

            {/* Answer Buttons */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-2xl px-4 mt-8">
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 max-w-[280px] py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl sm:text-2xl shadow-sm transition-all active:scale-95"
              >
                CONFISCATE
              </button>
              
              <p className="text-xl font-medium text-gray-400">or</p>

              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 max-w-[280px] py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl sm:text-2xl shadow-sm transition-all active:scale-95"
              >
                ALLOW
              </button>
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
                  {items[currentItem].explanation}
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
                {currentItem < items.length - 1 ? 'CONTINUE' : 'FINISH'}
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
              <h3 className="font-bold text-gray-800 mb-3 text-lg">How to Play: Avoid Angering the General</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• <strong>Inspect Items:</strong> The general is watching inspect item in right way</li>
                <li>• <strong>Make a Decision:</strong> Choose CONFISCATE or ALLOW for each item</li>
                <li>• <strong>Three Lives:</strong> You have 3 bullets - lose one for each wrong answer</li>
                <li>• <strong>Goal:</strong> Pass the inspection by correctly identifying all items</li>
                <li>• <strong>Win:</strong> Get promoted by the general for your excellent work!</li>
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