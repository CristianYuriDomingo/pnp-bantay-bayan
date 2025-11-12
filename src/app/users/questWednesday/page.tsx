// app/users/questWednesday/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function QuestWednesday() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-20 pb-6">
        <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <button
            onClick={() => router.push('/users/quest')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Quest Path</span>
          </button>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-purple-800">Wednesday Quest</h1>
                <p className="text-purple-600">Midweek milestone! • 20 points</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Challenge</h2>
              <p className="text-gray-600 mb-6">
                You're halfway through! Complete these tasks to continue!
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <input type="checkbox" className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Master a new skill</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <input type="checkbox" className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Achieve perfect score</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <input type="checkbox" className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Unlock achievement</span>
                </div>
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all">
                Complete Quest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
