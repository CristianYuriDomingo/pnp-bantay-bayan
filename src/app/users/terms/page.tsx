// app/users/terms/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      {/* Header with X button */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-6 py-4 flex justify-end">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Terms of Use
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please read these terms carefully
          </p>
        </div>

        {/* Welcome Message */}
        <div className="mb-12">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            By using our app, you agree to follow these terms. Please read them carefully to understand your rights and responsibilities.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Purpose */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              1. Purpose of the App
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Bantay Bayan is designed for learning, safety awareness, and community education.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Important:</strong> It is not an official law-enforcement tool.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              2. User Responsibilities
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              By using the app, you agree to:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6">
              <li>• Provide accurate information when required</li>
              <li>• Use the app responsibly</li>
              <li>• Not misuse features to harm, threaten, or mislead others</li>
              <li>• Not upload harmful content, viruses, or illegal materials</li>
            </ul>
          </section>

          {/* Rewards & Ranks */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              3. Rewards & Ranks
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              XP, ranks, badges, and rewards are for <strong>educational and game purposes only</strong>. They do not represent real PNP authority or rank.
            </p>
          </section>

          {/* Allowed Usage */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              4. Allowed Usage
            </h2>
            
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">You may:</p>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 mb-4 ml-6">
              <li>• Learn through lessons</li>
              <li>• Play mini-games</li>
              <li>• Complete quests</li>
              <li>• View your leaderboard ranking</li>
            </ul>

            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">You may not:</p>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-6">
              <li>• Attempt to hack, copy, or reverse-engineer the app</li>
              <li>• Use the app to impersonate real officers</li>
              <li>• Use the app to report real emergencies (this app is not a hotline)</li>
            </ul>
          </section>

          {/* Account & Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              5. Account & Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              You may create an account using Facebook Login or Google Login. You agree to follow Facebook/Google's terms and not use fake or unauthorized accounts.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your Facebook or Google login controls your account security. We do not manage your password.
            </p>
          </section>

          {/* Account Suspension */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              6. Account Suspension
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We may suspend accounts that:
            </p>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-6">
              <li>• Cheat or exploit the system</li>
              <li>• Harass other users</li>
              <li>• Attempt to break the app or hack servers</li>
            </ul>
          </section>

          {/* Updates & Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              7. Updates & Changes
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We may update the app at any time to improve features, fix bugs, or add new content.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If we update these Terms of Use, the app will notify you.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              8. Disclaimer
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              The information in the app is for <strong>educational purposes only</strong>. Always follow real local laws and official emergency guidelines.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>For real emergencies, contact official authorities (e.g., 911).</strong>
            </p>
          </section>
        </div>

        {/* Agreement */}
        <div className="mt-16 pt-8 border-t border-gray-300 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
            By Using Bantay Bayan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-4">
            You acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
            Last Updated: January 2025
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-6 border-t border-gray-300 dark:border-gray-700">
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              href="/users/about" 
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              About Us
            </Link>
            <Link 
              href="/users/privacy" 
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}