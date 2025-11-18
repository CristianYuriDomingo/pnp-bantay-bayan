// app/users/about/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
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
            About Us
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Learn more about our mission and values
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Our Mission */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              To empower every Filipino to become an informed, proactive, and safety-conscious member of the community through engaging education and gamified learning experiences.
            </p>
          </section>

          {/* What is Bantay Bayan */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What is Bantay Bayan?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Bantay Bayan is a community-driven mobile app created to promote public safety, awareness, and responsible citizenship. We combine education, gamification, and real-life civic lessons to make learning about laws, safety, and proper citizen behavior easy and engaging.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Safety First</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Promoting public safety and community awareness through education
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Community-Driven</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Empowering every Filipino to become a proactive community member
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Educational</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Learn about laws, safety protocols, and proper citizen behavior
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Engaging Learning</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Gamification makes learning about civic duties fun and memorable
                </p>
              </div>
            </div>
          </section>

          {/* What You'll Learn */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What You'll Learn
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Through lessons, quests, and mini-games, Bantay Bayan helps users:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-6">
              <li>• Understand community responsibilities</li>
              <li>• Learn how to respond during emergencies</li>
              <li>• Identify proper and improper behaviors</li>
              <li>• Build confidence in reporting and awareness</li>
            </ul>
          </section>

          {/* Our Story */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Story
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We believe that a safer community starts with educated citizens. Bantay Bayan is here to guide, teach, and inspire every user—one lesson at a time.
            </p>
          </section>

          {/* Join Our Journey */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Join Our Journey
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Whether you're a seasoned learner or just starting out, we're excited to have you as part of our community. Together, we can build safer communities and achieve great things, one quest at a time.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Have questions or feedback? We'd love to hear from you. Reach out to us through our support channels, and we'll get back to you as soon as possible.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-6 border-t border-gray-300 dark:border-gray-700">
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              href="/users/privacy" 
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              Privacy Policy
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