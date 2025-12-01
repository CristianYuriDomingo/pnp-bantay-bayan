'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function Home() {
  const [showHeaderButton, setShowHeaderButton] = useState(false);
  const [showModal, setShowModal] = useState<'privacy' | 'terms' | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowHeaderButton(true);
      } else {
        setShowHeaderButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const handleGetStarted = () => {
    router.push('/auth/signin');
  };

  const handleLoginClick = () => {
    router.push('/auth/signin');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openModal = (type: 'privacy' | 'terms') => {
    setShowModal(type);
  };

  const closeModal = () => {
    setShowModal(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      {/* Navigation Bar */}
      <nav className="fixed w-full h-20 bg-white/95 backdrop-blur-md z-50 border-b border-blue-100 shadow-sm">
        <div className="relative flex items-center h-full w-full px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          {/* Logo - centered on small screens, left on large screens */}
          <div className={`flex items-center transition-all duration-300 ${
            showHeaderButton ? 'relative' : 'absolute left-1/2 -translate-x-1/2 lg:relative lg:left-auto lg:translate-x-0'
          }`}>
            <Image
              src="/DashboardImage/logo.png"
              alt="Bantay Bayan Logo"
              width={64}
              height={64}
              className="h-16 w-auto object-contain cursor-pointer"
              priority
              onClick={scrollToTop}
            />
          </div>

          {/* Right side container */}
          <div className="flex items-center gap-8 ml-auto">
            {/* Navigation Links - Hidden on small screens */}
            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => openModal('privacy')}
                className="text-sm font-semibold transition-colors text-gray-600 hover:text-blue-600"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => openModal('terms')}
                className="text-sm font-semibold transition-colors text-gray-600 hover:text-blue-600"
              >
                Terms of Use
              </button>
              <button
                onClick={scrollToAbout}
                className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </button>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleGetStarted}
              className={`relative px-6 py-2.5 text-sm font-bold rounded-xl text-white transition-all duration-300 uppercase tracking-wide ${
                showHeaderButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
              style={{
                background: 'linear-gradient(to bottom, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
                boxShadow: '0 4px 0 #1e40af, 0 6px 8px rgba(37, 99, 235, 0.4)',
                transform: showHeaderButton ? 'translateY(0)' : 'translateY(-8px)'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = '0 2px 0 #1e40af, 0 4px 6px rgba(37, 99, 235, 0.3)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 0 #1e40af, 0 6px 8px rgba(37, 99, 235, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 0 #1e40af, 0 6px 8px rgba(37, 99, 235, 0.4)';
              }}
            >
              BEGIN SERVICE
            </button>
          </div>
        </div>
      </nav>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {showModal === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-6">
              {showModal === 'privacy' && (
                <div className="space-y-4 text-gray-700">
                  <p className="text-gray-600 italic">Your privacy is important to us</p>
                  <p>This explains how Bantay Bayan collects, uses, and protects your information. We are committed to keeping your data safe and giving you control over your privacy.</p>
                  
                  <h3 className="text-xl font-bold mt-6">1. Information We Collect</h3>
                  <p>When you create an account using Facebook Login or Google Login, we may receive:</p>
                  <p className="font-semibold">From Facebook or Google:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Your name</li>
                    <li>Your email address</li>
                    <li>Your profile picture (optional)</li>
                    <li>Your unique account ID</li>
                  </ul>
                  <p className="font-semibold mt-3">We do NOT receive:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Your password</li>
                    <li>Your contacts</li>
                    <li>Your posts or messages</li>
                    <li>Any sensitive data</li>
                  </ul>
                  <p className="font-semibold mt-3">App Data We Collect:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>XP, levels, ranks, badges</li>
                    <li>Lessons completed</li>
                    <li>Game activity</li>
                    <li>Device info (for performance only)</li>
                  </ul>

                  <h3 className="text-xl font-bold mt-6">2. How We Use Your Information</h3>
                  <p>We use your information to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Create and manage your Bantay Bayan account</li>
                    <li>Sync your progress across devices</li>
                    <li>Display your name and avatar on leaderboards</li>
                    <li>Improve lessons and game features</li>
                  </ul>
                  <p className="font-semibold mt-3">We never sell or share your data with outside companies.</p>

                  <h3 className="text-xl font-bold mt-6">3. How We Protect Your Data</h3>
                  <p>We keep your data safe using:</p>
                  <div className="space-y-2 mt-2">
                    <p><span className="font-semibold">Encrypted Communication:</span> All data transmitted securely</p>
                    <p><span className="font-semibold">Secured Storage:</span> Protected database systems</p>
                    <p><span className="font-semibold">Limited Access:</span> Restricted internal access</p>
                  </div>
                  <p className="mt-3">Facebook and Google also protect your login through their own security systems.</p>

                  <h3 className="text-xl font-bold mt-6">4. Third-Party Services</h3>
                  <p>Since you use Facebook or Google to log in:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Their privacy policies also apply</li>
                    <li>You may manage permissions anytime in your Facebook/Google settings</li>
                    <li>We do not have access to anything beyond what you allow</li>
                  </ul>

                  <h3 className="text-xl font-bold mt-6">5. Your Rights</h3>
                  <p>You have full control over your data. You can:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><span className="font-semibold">Delete your account:</span> Remove all your data permanently</li>
                    <li><span className="font-semibold">Revoke app access:</span> Disconnect from Facebook/Google</li>
                    <li><span className="font-semibold">Request data deletion:</span> Ask us to delete your stored data</li>
                    <li><span className="font-semibold">Reset progress:</span> Start fresh anytime you want</li>
                  </ul>

                  <h3 className="text-xl font-bold mt-6">6. Children's Privacy</h3>
                  <p>We do not collect sensitive information from minors. Facebook/Google login ensures safe account creation.</p>
                  <p className="mt-2">Parental guidance is recommended for users under 13 years old.</p>

                  <h3 className="text-xl font-bold mt-6">7. Policy Updates</h3>
                  <p>If we update this Privacy Policy, the app will notify you through in-app notifications or email.</p>
                  <p className="mt-3 font-semibold">Last Updated: January 2025</p>

                  <h3 className="text-xl font-bold mt-6">Questions About Privacy?</h3>
                  <p>If you have any questions or concerns about how we handle your data, please contact our support team.</p>
                </div>
              )}

              {showModal === 'terms' && (
                <div className="space-y-4 text-gray-700">
                  <p className="text-gray-600 italic">Please read these terms carefully</p>
                  <p>By using our app, you agree to follow these terms. Please read them carefully to understand your rights and responsibilities.</p>

                  <h3 className="text-xl font-bold mt-6">1. Purpose of the App</h3>
                  <p>Bantay Bayan is designed for learning, safety awareness, and community education.</p>
                  <p className="font-semibold">Important: It is not an official law-enforcement tool.</p>

                  <h3 className="text-xl font-bold mt-6">2. User Responsibilities</h3>
                  <p>By using the app, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Provide accurate information when required</li>
                    <li>Use the app responsibly</li>
                    <li>Not misuse features to harm, threaten, or mislead others</li>
                    <li>Not upload harmful content, viruses, or illegal materials</li>
                  </ul>

                  <h3 className="text-xl font-bold mt-6">3. Rewards & Ranks</h3>
                  <p>XP, ranks, badges, and rewards are for educational and game purposes only. They do not represent real PNP authority or rank.</p>

                  <h3 className="text-xl font-bold mt-6">4. Allowed Usage</h3>
                  <p className="font-semibold">You may:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Learn through lessons</li>
                    <li>Play mini-games</li>
                    <li>Complete quests</li>
                    <li>View your leaderboard ranking</li>
                  </ul>
                  <p className="font-semibold mt-3">You may not:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Attempt to hack, copy, or reverse-engineer the app</li>
                    <li>Use the app to impersonate real officers</li>
                    <li>Use the app to report real emergencies (this app is not a hotline)</li>
                  </ul>

                  <h3 className="text-xl font-bold mt-6">5. Account & Security</h3>
                  <p>You may create an account using Facebook Login or Google Login. You agree to follow Facebook/Google's terms and not use fake or unauthorized accounts.</p>
                  <p className="mt-2">Your Facebook or Google login controls your account security. We do not manage your password.</p>

                  <h3 className="text-xl font-bold mt-6">6. Account Suspension</h3>
                  <p>We may suspend accounts that:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Cheat or exploit the system</li>
                    <li>Harass other users</li>
                    <li>Attempt to break the app or hack servers</li>
                  </ul>

                  <h3 className="text-xl font-bold mt-6">7. Updates & Changes</h3>
                  <p>We may update the app at any time to improve features, fix bugs, or add new content.</p>
                  <p className="mt-2">If we update these Terms of Use, the app will notify you.</p>

                  <h3 className="text-xl font-bold mt-6">8. Disclaimer</h3>
                  <p>The information in the app is for educational purposes only. Always follow real local laws and official emergency guidelines.</p>
                  <p className="font-semibold mt-2">For real emergencies, contact official authorities (e.g., 911).</p>

                  <h3 className="text-xl font-bold mt-6">By Using Bantay Bayan</h3>
                  <p>You acknowledge that you have read, understood, and agree to be bound by these Terms of Use.</p>
                  <p className="mt-3 font-semibold">Last Updated: January 2025</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-20">
        {/* Hero Section */}
        <section className="pt-12 pb-20 px-4 md:px-8 lg:px-16 min-h-screen flex items-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full max-w-7xl mx-auto">
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

            <div className="flex-1 max-w-xl text-center">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-700 text-center">
                  Strengthen public awareness through
                  <span className="text-blue-600"> gamified learning</span>!
                </h1>

                <div className="flex flex-col gap-4 max-w-md mx-auto">
                  <button
                    onClick={handleGetStarted}
                    className="relative w-full px-8 py-4 text-lg font-bold rounded-2xl text-white transition-all duration-150 active:translate-y-1 uppercase tracking-wide"
                    style={{
                      backgroundColor: '#3b82f6',
                      boxShadow: '0 4px 0 #1e40af',
                    }}
                  >
                    BEGIN SERVICE
                  </button>

                  <button
                    onClick={handleLoginClick}
                    className="relative w-full px-8 py-4 text-lg font-bold rounded-2xl bg-white transition-all duration-150 active:translate-y-1 uppercase tracking-wide"
                    style={{
                      border: '2px solid #d1d5db',
                      color: '#3b82f6',
                      boxShadow: '0 4px 0 #d1d5db',
                    }}
                  >
                    CONTINUE YOUR DUTY
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="py-24 px-4 md:px-8 lg:px-16 bg-white">
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
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 lg:px-16 bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-gray-700 pt-8 flex justify-center items-center">
            <p className="text-gray-300">&copy; 2025 Bantay Bayan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}