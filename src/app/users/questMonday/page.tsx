// app/users/questMonday/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function QuestMonday() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-20 pb-6">
        <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4">
          {/* Back Button */}
          <button
            onClick={() => router.push('/users/quest')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Quest Path</span>
          </button>

          {/* Quest Content */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-800">Monday Quest</h1>
                <p className="text-blue-600">Start your week strong! • 10 points</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Challenge</h2>
              <p className="text-gray-600 mb-6">
                Complete the following tasks to earn your reward and unlock the next quest!
              </p>

              {/* Task List */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <input type="checkbox" className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Complete 3 lessons</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <input type="checkbox" className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Practice for 15 minutes</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <input type="checkbox" className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Review vocabulary</span>
                </div>
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                Complete Quest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}