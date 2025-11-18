'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-6 py-4 flex justify-end">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-40 h-20 flex items-center justify-center">
            <Image 
              src="/DashboardImage/logo.png" 
              alt="Bantay Bayan Logo" 
              width={160} 
              height={80}
              className="object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms of Use</h1>
          <p className="text-gray-600 text-lg">Please read these terms carefully</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-10">
          
          {/* Intro */}
          <div className="pb-6 border-b border-gray-200">
            <p className="text-gray-700 leading-relaxed">
              By using our app, you agree to follow these terms. Please read them carefully to understand your rights and responsibilities.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Purpose of the App</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Bantay Bayan is designed for learning, safety awareness, and community education.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <span className="font-semibold">Important:</span> It is not an official law-enforcement tool.
            </p>
          </section>

          {/* Section 2 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">By using the app, you agree to:</p>
            <ul className="space-y-2 text-gray-700 leading-relaxed ml-6">
              <li>• Provide accurate information when required</li>
              <li>• Use the app responsibly</li>
              <li>• Not misuse features to harm, threaten, or mislead others</li>
              <li>• Not upload harmful content, viruses, or illegal materials</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Rewards & Ranks</h2>
            <p className="text-gray-700 leading-relaxed">
              XP, ranks, badges, and rewards are for <span className="font-semibold">educational and game purposes only</span>. They do not represent real PNP authority or rank.
            </p>
          </section>

          {/* Section 4 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Allowed Usage</h2>
            
            <p className="text-gray-700 leading-relaxed mb-3 font-semibold">You may:</p>
            <ul className="space-y-2 text-gray-700 leading-relaxed ml-6 mb-6">
              <li>• Learn through lessons</li>
              <li>• Play mini-games</li>
              <li>• Complete quests</li>
              <li>• View your leaderboard ranking</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mb-3 font-semibold">You may not:</p>
            <ul className="space-y-2 text-gray-700 leading-relaxed ml-6">
              <li>• Attempt to hack, copy, or reverse-engineer the app</li>
              <li>• Use the app to impersonate real officers</li>
              <li>• Use the app to report real emergencies (this app is not a hotline)</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Account & Security</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You may create an account using Facebook Login or Google Login. You agree to follow Facebook/Google's terms and not use fake or unauthorized accounts.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Your Facebook or Google login controls your account security. We do not manage your password.
            </p>
          </section>

          {/* Section 6 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Account Suspension</h2>
            <p className="text-gray-700 leading-relaxed mb-3">We may suspend accounts that:</p>
            <ul className="space-y-2 text-gray-700 leading-relaxed ml-6">
              <li>• Cheat or exploit the system</li>
              <li>• Harass other users</li>
              <li>• Attempt to break the app or hack servers</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Updates & Changes</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may update the app at any time to improve features, fix bugs, or add new content.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If we update these Terms of Use, the app will notify you.
            </p>
          </section>

          {/* Section 8 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              The information in the app is for educational purposes only. Always follow real local laws and official emergency guidelines.
            </p>
            <p className="text-gray-700 leading-relaxed font-semibold">
              For real emergencies, contact official authorities (e.g., 911).
            </p>
          </section>

          {/* Final Statement */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">By Using Bantay Bayan</h2>
            <p className="text-gray-700 leading-relaxed">
              You acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;