'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const [showHeaderButton, setShowHeaderButton] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'about' | null>(null);
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

  const handleGetStarted = () => {
    router.push('/auth/signin');
  };

  const handleLoginClick = () => {
    router.push('/auth/signin');
  };

  const openModal = (modal: 'privacy' | 'terms' | 'about') => {
    setActiveModal(modal);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      {/* Navigation Bar */}
      <nav className="fixed w-full h-20 bg-white/95 backdrop-blur-md z-50 border-b border-blue-100 shadow-sm">
        <div className="relative flex items-center h-full w-full px-4 md:px-8 lg:px-16 max-w-7xl mx-auto transition-all duration-300">
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

          <div className="flex items-center gap-8 ml-auto">
            <button
              onClick={handleGetStarted}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-sm ${
                showHeaderButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              BEGIN SERVICE
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 lg:px-16 min-h-screen flex items-center">
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
                  BEGIN SERVICE
                </button>

                <button
                  onClick={handleLoginClick}
                  className="w-full px-8 py-4 text-lg font-bold rounded-2xl border-2 border-blue-400 text-blue-500 hover:bg-blue-50 transition-all duration-300"
                >
                  CONTINUE YOUR DUTY
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
              <button onClick={() => openModal('privacy')} className="text-gray-300 hover:text-white transition-colors">Privacy</button>
              <button onClick={() => openModal('terms')} className="text-gray-300 hover:text-white transition-colors">Terms</button>
              <button onClick={() => openModal('about')} className="text-gray-300 hover:text-white transition-colors">About Us</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms of Use'}
                {activeModal === 'about' && 'About Us'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div className="px-6 py-6">
              {activeModal === 'privacy' && (
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

              {activeModal === 'terms' && (
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

              {activeModal === 'about' && (
                <div className="space-y-4 text-gray-700">
                  <p className="text-gray-600 italic">Learn more about our mission and values</p>

                  <h3 className="text-xl font-bold mt-6">Our Mission</h3>
                  <p>To empower every Filipino to become an informed, proactive, and safety-conscious member of the community through engaging education and gamified learning experiences.</p>

                  <h3 className="text-xl font-bold mt-6">What is Bantay Bayan?</h3>
                  <p>Bantay Bayan is a community-driven mobile app created to promote public safety, awareness, and responsible citizenship. We combine education, gamification, and real-life civic lessons to make learning about laws, safety, and proper citizen behavior easy and engaging.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h4 className="font-bold text-lg">Safety First</h4>
                      <p>Promoting public safety and community awareness through education</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Community-Driven</h4>
                      <p>Empowering every Filipino to become a proactive community member</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Educational</h4>
                      <p>Learn about laws, safety protocols, and proper citizen behavior</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Engaging Learning</h4>
                      <p>Gamification makes learning about civic duties fun and memorable</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mt-6">What You'll Learn</h3>
                  <p>Through lessons, quests, and mini-games, Bantay Bayan helps users:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Understand community responsibilities</li>
                    <li>Learn how to respond during emergencies</li>
                    <li>Identify proper and improper behaviors</li>
                    <li>Build confidence in reporting and awareness</li>
                  </ul>

                  <h3 className="text-xl font-bold mt-6">Our Story</h3>
                  <p>We believe that a safer community starts with educated citizens. Bantay Bayan is here to guide, teach, and inspire every user—one lesson at a time.</p>

                  <h3 className="text-xl font-bold mt-6">Join Our Journey</h3>
                  <p>Whether you're a seasoned learner or just starting out, we're excited to have you as part of our community. Together, we can build safer communities and achieve great things, one quest at a time.</p>

                  <h3 className="text-xl font-bold mt-6">Contact Us</h3>
                  <p>Have questions or feedback? We'd love to hear from you. Reach out to us through our support channels, and we'll get back to you as soon as possible.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}