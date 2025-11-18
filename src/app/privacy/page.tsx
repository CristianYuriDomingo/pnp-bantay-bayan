'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-6 py-4 flex justify-end">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Link>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-600 text-lg">Your privacy is important to us</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-10">
          
          {/* Intro */}
          <div className="pb-6 border-b border-gray-200">
            <p className="text-gray-700 leading-relaxed">
              This explains how Bantay Bayan collects, uses, and protects your information. We are committed to keeping your data safe and giving you control over your privacy.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you create an account using Facebook Login or Google Login, we may receive:
            </p>

            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed mb-3 font-semibold">From Facebook or Google:</p>
              <ul className="space-y-2 text-gray-700 leading-relaxed ml-6">
                <li>• Your name</li>
                <li>• Your email address</li>
                <li>• Your profile picture (optional)</li>
                <li>• Your unique account ID</li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed mb-3 font-semibold">We do NOT receive:</p>
              <ul className="space-y-2 text-gray-700 leading-relaxed ml-6">
                <li>• Your password</li>
                <li>• Your contacts</li>
                <li>• Your posts or messages</li>
                <li>• Any sensitive data</li>
              </ul>
            </div>

            <div>
              <p className="text-gray-700 leading-relaxed mb-3 font-semibold">App Data We Collect:</p>
              <ul className="space-y-2 text-gray-700 leading-relaxed ml-6">
                <li>• XP, levels, ranks, badges</li>
                <li>• Lessons completed</li>
                <li>• Game activity</li>
                <li>• Device info (for performance only)</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">We use your information to:</p>
            <ul className="space-y-2 text-gray-700 leading-relaxed ml-6 mb-4">
              <li>• Create and manage your Bantay Bayan account</li>
              <li>• Sync your progress across devices</li>
              <li>• Display your name and avatar on leaderboards</li>
              <li>• Improve lessons and game features</li>
            </ul>
            <p className="text-gray-700 leading-relaxed font-semibold">
              We never sell or share your data with outside companies.
            </p>
          </section>

          {/* Section 3 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Protect Your Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We keep your data safe using:</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-900 font-semibold mb-1">Encrypted Communication</p>
                <p className="text-gray-700 leading-relaxed">All data transmitted securely</p>
              </div>
              
              <div>
                <p className="text-gray-900 font-semibold mb-1">Secured Storage</p>
                <p className="text-gray-700 leading-relaxed">Protected database systems</p>
              </div>
              
              <div>
                <p className="text-gray-900 font-semibold mb-1">Limited Access</p>
                <p className="text-gray-700 leading-relaxed">Restricted internal access</p>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">
              Facebook and Google also protect your login through their own security systems.
            </p>
          </section>

          {/* Section 4 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Since you use Facebook or Google to log in:</p>
            <ul className="space-y-2 text-gray-700 leading-relaxed ml-6">
              <li>• Their privacy policies also apply</li>
              <li>• You may manage permissions anytime in your Facebook/Google settings</li>
              <li>• We do not have access to anything beyond what you allow</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">You have full control over your data. You can:</p>
            <ul className="space-y-2 text-gray-700 leading-relaxed ml-6">
              <li>• <span className="font-semibold">Delete your account:</span> Remove all your data permanently</li>
              <li>• <span className="font-semibold">Revoke app access:</span> Disconnect from Facebook/Google</li>
              <li>• <span className="font-semibold">Request data deletion:</span> Ask us to delete your stored data</li>
              <li>• <span className="font-semibold">Reset progress:</span> Start fresh anytime you want</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We do not collect sensitive information from minors. Facebook/Google login ensures safe account creation.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Parental guidance is recommended for users under 13 years old.
            </p>
          </section>

          {/* Section 7 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Policy Updates</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If we update this Privacy Policy, the app will notify you through in-app notifications or email.
            </p>
            <p className="text-gray-700 leading-relaxed font-semibold">
              Last Updated: January 2025
            </p>
          </section>

          {/* Questions Section */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Privacy?</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions or concerns about how we handle your data, please contact our support team.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex justify-center gap-6">
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;