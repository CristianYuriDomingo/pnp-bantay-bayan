'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Add this import
import Image from 'next/image'; // Add this import

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const router = useRouter(); // Add this hook

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  const handleGetStarted = () => {
    setActiveButton('getStarted');
    // Navigate to login page instead of just console.log
    router.push('/auth/signin');
  };

  const handleLearnMore = () => {
    setActiveButton('learnMore');
    console.log('Learn More clicked');
  };

  // Add this function for login navigation
  const handleLoginClick = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800">
      {/* Navigation Bar */}
      <nav className="fixed w-full h-20 bg-white/95 backdrop-blur-md z-50 border-b border-blue-100 shadow-sm">
        <div className="flex justify-between items-center h-full w-full px-4 md:px-8 lg:px-16">
          {/* Logo */}
          <div className="flex items-center">
            {/* Replace this img src with your actual logo image */}
            <Image
              src="/DashboardImage/logo.png"
              alt="Bantay Bayan Logo"
              width={64}
              height={64}
              className="h-16 w-auto object-contain"
              priority
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Modules", "About", "Contact"].map((item) => (
              <a
                href={`#${item.toLowerCase()}`}
                key={item}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300"
              >
                {item}
              </a>
            ))}

            <button
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={toggleNav}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={navOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {navOpen && (
          <div className="absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-lg">
            <div className="flex flex-col items-center gap-6 py-8">
              {["Features", "Modules", "About", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={toggleNav}
                  className="text-gray-600 hover:text-blue-600 text-lg font-medium transition-colors"
                >
                  {item}
                </a>
              ))}
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 lg:px-16 min-h-screen flex items-center">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 w-full">

          {/* Left Column: Content */}
          <div className="flex-1 max-w-2xl">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-gray-800">
                Learn
                <span className="text-blue-600"> Safety</span>
                <br />
                Build
                <span className="text-yellow-500"> Awareness</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
                Interactive safety education platform designed to build awareness and prevent crime.
                Learn through engaging modules, earn badges, and become a community guardian.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={handleGetStarted}
                  className="group relative px-8 py-4 text-lg font-bold rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                >
                  <span className="relative z-10">Start Learning</span>
                </button>

                <button
                  onClick={handleLearnMore}
                  className="px-8 py-4 text-lg font-bold rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  View Modules
                </button>
              </div>

              {/* Add a "Already have an account?" link */}
              <div className="mt-6">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={handleLoginClick}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Static Visual Element */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Replace with your actual image */}
              <Image
                src="/MainImage/LandingPage.png"
                alt="Bantay Bayan Safety Education"
                width={384}
                height={384}
                className="w-96 h-96 mx-auto object-cover rounded-3xl border-none"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Learning Modules Section */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Learning Modules
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive lessons designed to build safety awareness and crime prevention skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            {
              title: "Crime Prevention",
              lessons: "5 Lessons",
              description: "Learn fundamental crime prevention strategies and community safety measures.",
              bgColor: "bg-blue-50"
            },
            {
              title: "Digital & Cyber Safety",
              lessons: "5 Lessons",
              description: "Protect yourself online with essential cybersecurity knowledge and best practices.",
              bgColor: "bg-purple-50"
            },
            {
              title: "Emergency Response",
              lessons: "4 Lessons",
              description: "Essential skills for emergency situations and first aid response techniques.",
              bgColor: "bg-red-50"
            },
            {
              title: "Anti-Terrorism Awareness",
              lessons: "3 Lessons",
              description: "Recognize threats and understand counter-terrorism awareness protocols.",
              bgColor: "bg-orange-50"
            },
            {
              title: "Drug Awareness",
              lessons: "2 Lessons",
              description: "Education about drug prevention and substance abuse awareness.",
              bgColor: "bg-yellow-50"
            },
            {
              title: "Traffic Safety",
              lessons: "4 Lessons",
              description: "Road safety rules, pedestrian awareness, and traffic regulation knowledge.",
              bgColor: "bg-green-50"
            }
          ].map((module, index) => (
            <div key={index} className="group">
              <div className={`${module.bgColor} rounded-2xl p-6 h-full border-2 border-transparent hover:border-blue-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-lg`}>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{module.title}</h3>
                <p className="text-blue-600 font-medium text-sm mb-4">{module.lessons}</p>
                <p className="text-gray-600 leading-relaxed mb-6">{module.description}</p>

                <button
                  onClick={handleGetStarted}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300"
                >
                  Start Module
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto">
          {[
            {
              title: "Interactive Learning Experience",
              description: "Engage with gamified lessons, quizzes, and interactive content designed to make safety education enjoyable and memorable. Track your progress and earn badges as you complete modules.",
              visual: (
                <Image
                  src="/path-to-interactive-learning-image.png"
                  alt="Interactive Learning Platform"
                  width={640}
                  height={320}
                  className="w-full h-80 object-cover rounded-3xl shadow-xl"
                />
              ),
              reverse: false
            },
            {
              title: "Achievement System",
              description: "Earn recognition for your achievements with our comprehensive tracking system. Get rewarded for completing modules, passing quizzes, and demonstrating mastery of safety concepts.",
              visual: (
                <Image
                  src="/path-to-achievement-system-image.png"
                  alt="Achievement Recognition System"
                  width={640}
                  height={320}
                  className="w-full h-80 object-cover rounded-3xl shadow-xl"
                />
              ),
              reverse: true
            },
            {
              title: "Community Safety Network",
              description: "Connect with fellow learners and safety advocates in your community. Share knowledge, participate in discussions, and build a stronger, more aware community together.",
              visual: (
                <div className="relative w-full h-80 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">Community</div>
                    <div className="text-lg">Safety Network</div>
                  </div>
                </div>
              ),
              reverse: false
            }
          ].map((section, index) => (
            <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32 ${section.reverse ? 'lg:grid-flow-col-dense' : ''}`}>
              <div className={section.reverse ? 'lg:col-start-2' : ''}>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-800">
                  {section.title}
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  {section.description}
                </p>
                <button className="inline-flex items-center text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors group">
                  Learn more
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
              <div className={section.reverse ? 'lg:col-start-1' : ''}>
                {section.visual}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Ready to Build Safer Communities?
          </h2>
          <p className="text-2xl mb-12 opacity-90">
            Join thousands of learners already making their communities safer through education.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-12 py-4 text-xl font-bold rounded-full bg-yellow-500 hover:bg-yellow-400 text-gray-800 transition-all duration-300 shadow-lg"
            >
              Start Learning Now
            </button>
            <button className="px-12 py-4 text-xl font-bold rounded-full border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 lg:px-16 bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-4">
                {/* Footer logo - same as header */}
                <Image
                  src="/path-to-your-logo.png"
                  alt="Bantay Bayan Logo"
                  width={48}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="text-gray-300">
                Building safer communities through interactive safety education.
              </p>
            </div>

            {[
              {
                title: "Learning",
                links: ["Modules", "Quizzes", "Progress Tracking", "Resources"]
              },
              {
                title: "Support",
                links: ["Help Center", "Contact", "FAQ", "Community"]
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Disclaimer"]
              }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="text-white font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

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