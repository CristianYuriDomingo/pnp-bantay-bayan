// app/users/privacy/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your privacy is important to us
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-12">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            This explains how Bantay Bayan collects, uses, and protects your information. We are committed to keeping your data safe and giving you control over your privacy.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              When you create an account using Facebook Login or Google Login, we may receive:
            </p>
            
            <div className="mb-6">
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">From Facebook or Google:</p>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-6">
                <li>• Your name</li>
                <li>• Your email address</li>
                <li>• Your profile picture (optional)</li>
                <li>• Your unique account ID</li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">We do NOT receive:</p>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-6">
                <li>• Your password</li>
                <li>• Your contacts</li>
                <li>• Your posts or messages</li>
                <li>• Any sensitive data</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">App Data We Collect:</p>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-6">
                <li>• XP, levels, ranks, badges</li>
                <li>• Lessons completed</li>
                <li>• Game activity</li>
                <li>• Device info (for performance only)</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We use your information to:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6 mb-4">
              <li>• Create and manage your Bantay Bayan account</li>
              <li>• Sync your progress across devices</li>
              <li>• Display your name and avatar on leaderboards</li>
              <li>• Improve lessons and game features</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>We never sell or share your data with outside companies.</strong>
            </p>
          </section>

          {/* How We Protect Your Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              3. How We Protect Your Data
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We keep your data safe using:
            </p>
            
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Encrypted Communication</p>
                <p className="text-gray-700 dark:text-gray-300">All data transmitted securely</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Secured Storage</p>
                <p className="text-gray-700 dark:text-gray-300">Protected database systems</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Limited Access</p>
                <p className="text-gray-700 dark:text-gray-300">Restricted internal access</p>
              </div>
            </div>

            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              Facebook and Google also protect your login through their own security systems.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              4. Third-Party Services
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Since you use Facebook or Google to log in:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6">
              <li>• Their privacy policies also apply</li>
              <li>• You may manage permissions anytime in your Facebook/Google settings</li>
              <li>• We do not have access to anything beyond what you allow</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              5. Your Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              You have full control over your data. You can:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6">
              <li>• <strong>Delete your account:</strong> Remove all your data permanently</li>
              <li>• <strong>Revoke app access:</strong> Disconnect from Facebook/Google</li>
              <li>• <strong>Request data deletion:</strong> Ask us to delete your stored data</li>
              <li>• <strong>Reset progress:</strong> Start fresh anytime you want</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              6. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We do not collect sensitive information from minors. Facebook/Google login ensures safe account creation.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Parental guidance is recommended for users under 13 years old.</strong>
            </p>
          </section>

          {/* Policy Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              7. Policy Updates
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              If we update this Privacy Policy, the app will notify you through in-app notifications or email.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Last Updated:</strong> January 2025
            </p>
          </section>
        </div>

        {/* Contact Section */}
        <div className="mt-16 pt-8 border-t border-gray-300 dark:border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Questions About Privacy?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you have any questions or concerns about how we handle your data, please contact our support team.
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
              href="/users/terms" 
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}