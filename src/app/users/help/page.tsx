// app/help/page.tsx

'use client';

import React from 'react';

export default function HelpPage() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Help Center
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Find answers to your questions
          </p>
        </div>

        {/* Your content goes here */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          {/* Add your help content */}
        </div>
      </div>
    </div>
  );
}