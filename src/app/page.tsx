'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const [showHeaderButton, setShowHeaderButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled past the hero section buttons (roughly 600px)
      if (window.scrollY > 600) {
        setShowHeaderButton(true);
      } else {
        setShowHeaderButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    router.push('/auth/signin');
  };

  const handleLoginClick = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      {/* Navigation Bar */}
      <nav className="fixed w-full h-20 bg-white/95 backdrop-blur-md z-50 border-b border-blue-100 shadow-sm">
        <div className="relative flex items-center h-full w-full px-4 md:px-8 lg:px-16 max-w-7xl mx-auto transition-all duration-300">
          {/* Logo - Centered on mobile when button hidden, left-aligned otherwise */}
          <div className={`flex items-center transition-all duration-300 ${
            showHeaderButton ? 'relative' : 'absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0'
          }`}>
            <Image
              src="/DashboardImage/logo.png"
              alt="Bantay Bayan Logo"
              width={64}
              height={64}
              className="h-16 w-auto object-contain"
              priority
            />
          </div>

          {/* Get Started Button - Desktop and Mobile */}
          <div className="flex items-center gap-8 ml-auto">
            <button
              onClick={handleGetStarted}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-sm ${
                showHeaderButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              GET STARTED
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 lg:px-16 min-h-screen flex items-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full max-w-7xl mx-auto">

          {/* Left Column: Visual Element */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Image
                src="/MainImage/LandingPage.png"
                alt="Bantay Bayan Safety Education"
                width={384}
                height={384}
                className="w-full h-auto mx-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="flex-1 max-w-xl text-center md:text-left">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-700">
                Strengthen public awareness through
                <span className="text-blue-600"> gamified learning</span>!
              </h1>

              <div className="flex flex-col gap-4 max-w-md mx-auto md:mx-0">
                <button
                  onClick={handleGetStarted}
                  className="w-full px-8 py-4 text-lg font-bold rounded-2xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-md"
                >
                  GET STARTED
                </button>

                <button
                  onClick={handleLoginClick}
                  className="w-full px-8 py-4 text-lg font-bold rounded-2xl border-2 border-blue-400 text-blue-500 hover:bg-blue-50 transition-all duration-300"
                >
                  I ALREADY HAVE AN ACCOUNT
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          {[
            {
              title: "Learn About Safety and Civic Responsibility",
              description: "Master local laws, emergency response, proper citizen behavior, and reporting awareness through educational modules. Learn about community responsibility, crime prevention, and public safety procedures that help you become a more informed and responsible citizen.",
              visual: (
                <Image
                  src="/MainImage/LandingPage1.png"
                  alt="Interactive Learning Platform"
                  width={640}
                  height={320}
                  className="w-full h-full object-cover"
                />
              ),
              reverse: false
            },
            {
              title: "Play Interactive Mini-Games",
              description: "Engage with fun games including drag-and-drop, identification challenges, true or false quizzes, and scenario-based decision making. Practice suspect identification, memorize emergency hotlines through puzzles, guess PNP ranks using insignia, and play games like 'Confiscate or Allow' for prohibited items.",
              visual: (
                <Image
                  src="/MainImage/LandingPage2.png"
                  alt="Achievement Recognition System"
                  width={640}
                  height={320}
                  className="w-full h-full object-cover"
                />
              ),
              reverse: true
            },
            {
              title: "Complete Quests and Earn Rewards",
              description: "Take on daily quests, weekly quests, and special event quests to gain XP and level up. Earn PNP-style ranks starting from Cadet and progressing through Pat, PCpl, and beyond to Officer and Star ranks. Collect badges for completing lessons, quizzes, and weekly quests while competing on leaderboards based on total XP, badges, and level.",
              visual: (
                <Image
                  src="/MainImage/LandingPage3.png"
                  alt="Community Safety Network"
                  width={640}
                  height={320}
                  className="w-full h-full object-cover"
                />
              ),
              reverse: false
            }
          ].map((section, index) => (
            <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32 ${section.reverse ? 'lg:grid-flow-col-dense' : ''}`}>
              <div className={`${section.reverse ? 'lg:col-start-2' : ''} text-center lg:text-left`}>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-800">
                  {section.title}
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8 text-justify">
                  {section.description}
                </p>
              </div>
              <div className={section.reverse ? 'lg:col-start-1' : ''}>
                {section.visual}
              </div>
            </div>
          ))}
        </div>
        
      </section>

      <section className="py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Ready to Become a Community Guardian?
          </h2>
          <p className="text-2xl mb-12 opacity-90">
            Join the community in learning about safety, civic duty, and public awareness through engaging gameplay.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 lg:px-16 bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300">&copy; 2025 Bantay Bayan. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}