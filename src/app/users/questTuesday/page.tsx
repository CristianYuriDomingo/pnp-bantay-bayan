// app/users/questTuesday/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function QuestTuesday() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-20 pb-6">
        <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <button
            onClick={() => router.push('/users/quest')}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Quest Path</span>
          </button>

          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-cyan-800">Tuesday Quest</h1>
                <p className="text-cyan-600">Keep the momentum! • 15 points</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Challenge</h2>
              <p className="text-gray-600 mb-6">
                Build on yesterday's progress with these tasks!
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg">
                  <input type="checkbox" className="w-5 h-5 text-cyan-600" />
                  <span className="text-gray-700">Complete 5 lessons</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg">
                  <input type="checkbox" className="w-5 h-5 text-cyan-600" />
                  <span className="text-gray-700">Score 80% on a quiz</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg">
                  <input type="checkbox" className="w-5 h-5 text-cyan-600" />
                  <span className="text-gray-700">Help a peer</span>
                </div>
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold py-3 rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all">
                Complete Quest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
