'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('guide');

  const tabs = [
    { id: 'guide', label: 'How to Use the App (Quick Guide)' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'contact', label: 'Contact Support' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">?</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
              <p className="text-gray-600 text-sm">Find answers and get support</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 border-b border-gray-200">
            {tabs.map((tab) => {
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {activeTab === 'guide' && <QuickGuideContent />}
          {activeTab === 'faqs' && <FAQsContent />}
          {activeTab === 'contact' && <ContactSupportContent />}
        </div>
      </div>
    </div>
  );
}

function QuickGuideContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use the App</h2>
      
      <div className="space-y-6">
        <GuideSection
          number="1"
          title="Getting Started"
          content="Create an account with your name, email, and password. You'll receive a verification email - click the link to activate your account. Then sign in using email/password or through Google/Facebook."
        />
        
        <GuideSection
          number="2"
          title="Learn"
          content="Browse through modules on safety topics. Click a module to see its lessons, then pick one to start. Complete lessons to earn badges and XP. Finish entire modules to earn special module completion badges!"
        />
        
        <GuideSection
          number="3"
          title="Complete Weekly Quests"
          content="Play 5 daily quest games (Monday-Friday) to build your streak and earn rewards. Each quest unlocks on its specific day. Complete all 5 quests in a week to unlock the weekly reward chest with bonus XP! Miss a day? Use a Duty Pass (claim free every Sunday) to unlock missed quests and protect your streak."
        />
        
        <GuideSection
          number="4"
          title="Take Quizzes"
          content="Test your knowledge with quizzes organized by category. Your mastery score is 95% accuracy + 5% speed. Earn mastery badges: Perfect (100%), Gold (90%+), Silver (75%+), or Bronze (60%+). Only your best score counts, so retake quizzes to improve!"
        />
        
        <GuideSection
          number="5"
          title="Climb the Leaderboard"
          content="Earn XP through lessons, quizzes, and achievements to rank up through PNP officer titles (Cadet → Pat → PCpl → ... → PGEN). The more XP you earn, the higher you climb. Top 3 players get special podium display. Star ranks are competitive - stay active to maintain your position!"
        />

        <GuideSection
          number="6"
          title="Unlock Achievements"
          content="Earn achievements by reaching milestones: complete lessons, earn badges, reach new ranks, or update your profile. Achievements award bonus XP and are automatically checked when you visit the achievements page!"
        />
      </div>
    </div>
  );
}

function GuideSection({ number, title, content }: { number: string; title: string; content: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function FAQsContent() {
  const faqs = [
    {
      question: "What is Bantay Bayan?",
      answer: "Bantay Bayan is an educational platform designed for learning about safety awareness and community education through interactive gameplay. It's not an official law-enforcement tool, but a way to engage with important safety topics while earning badges and climbing the leaderboard."
    },
    {
      question: "How does the Weekly Quest system work?",
      answer: "You have 5 daily quest games (Monday-Friday). Each quest unlocks on its specific day and features different gameplay. Complete all 5 quests in a week to unlock the reward chest with bonus XP. If you miss a day, you can use a Duty Pass (claim one free every Sunday) to unlock missed quests and protect your streak."
    },
    {
      question: "What are the different quest games?",
      answer: "Monday: Suspect Line-Up (identify suspects), Tuesday: True or False (answer safety questions with 3 lives), Wednesday: Code the Call (arrange digits to form Philippine mobile numbers), Thursday: Inspection Game (decide to confiscate or allow items with 3 lives), Friday: Guess the Rank (match Pibi to the correct police rank insignia)."
    },
    {
      question: "How does quiz scoring work?",
      answer: "Your mastery score is calculated as 95% accuracy + 5% speed. This means getting answers correct is far more important than speed! Earn mastery levels: Perfect (100%), Gold (90%+), Silver (75%+), or Bronze (60%+). Only your best score counts, so you can retake quizzes to improve."
    },
    {
      question: "How do I earn badges?",
      answer: "Badges are earned by completing lessons and achieving Gold (90%+) or Perfect scores on quizzes. Complete all lessons in a module to earn the module completion badge. The more badges you collect, the higher your badge milestone achievements (Starter → Master → Legend)."
    },
    {
      question: "How does the leaderboard and ranking system work?",
      answer: "Players are ranked by total XP earned from lessons, quizzes, and achievements. You unlock PNP officer ranks (Cadet → Pat → PCpl → ... → PGEN) as you gain XP. Top 3 players get special podium displays. Star ranks (like PGEN) are competitive - you can be demoted if others pass you, so stay active!"
    },
    {
      question: "What happens if I forget my password?",
      answer: "Click 'Forgot password?' on the sign-in page, enter your email, and you'll receive a reset link. Click the link and set a new password (must be 8+ characters with uppercase, lowercase, number, and special character). Note: After 5 failed sign-in attempts, your account locks for 5 minutes for security."
    },
    {
      question: "How do achievements work?",
      answer: "Achievements are earned by reaching milestones like completing lessons, earning badges, reaching new ranks, or updating your profile. They're automatically checked when you visit the achievements page and award bonus XP. Special achievements like 'Former Chief PNP' offer rare rewards!"
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
      
      {faqs.map((faq, index) => (
        <details
          key={index}
          className="group border border-gray-200 rounded-lg overflow-hidden"
        >
          <summary className="cursor-pointer px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors font-medium text-gray-900 flex items-center justify-between">
            {faq.question}
            <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="px-6 py-4 bg-white text-gray-600 leading-relaxed">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

function ContactSupportContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Support</h2>
      
      <p className="text-gray-600 mb-8">
        Need additional help? We're here to support you. Get in touch with our support team via email.
      </p>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
        <p className="text-gray-600 mb-4">
          Send us your questions, feedback, or concerns and we'll get back to you as soon as possible.
        </p>
        <a
          href="mailto:bantaybayan@gmail.com"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          <Mail className="w-5 h-5" />
          bantaybayan@gmail.com
        </a>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Support Hours</h3>
        <p className="text-gray-600">
          Monday - Friday, 9:00 AM - 5:00 PM PHT
        </p>
        <p className="text-gray-500 text-sm mt-2">
          We typically respond to all inquiries within 24-48 hours during business days.
        </p>
      </div>
    </div>
  );
}