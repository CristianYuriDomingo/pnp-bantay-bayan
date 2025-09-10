// app/users/components/CombinedCarousel.tsx - FIXED
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLessonProgress } from '@/hooks/use-progress';
import Modal from './Modal';

export type SlideProps = {
  id: string;
  image: string;
  title: string;
  content: string;
};

type SpeechBubbleProps = {
  messages: string[];
  typingSpeed?: number;
  delayBetween?: number;
};

type CombinedCarouselProps = {
  slides: SlideProps[];
  themeColor?: string;
  onModuleComplete?: (moduleId: string) => void;
  completedModules?: string[]; // This will be ignored now
  finishButtonText?: string;
  completedButtonText?: string;
  continueButtonText?: string;
  backButtonText?: string;
  moduleId?: string;
  lessonId: string;
  speechBubbleMessages?: string[];
  moduleTitle?: string;
  moduleDescription?: string;
  characterImage?: string;
  iconImage?: string;
  timerDuration?: number;
  timerColor?: string;
  isOpen?: boolean;
  onClose?: () => void;
  showAsModal?: boolean;
  onExit?: () => void;
};

// Speech Bubble Component with enhanced image handling
function SpeechBubble({ messages, typingSpeed = 50, delayBetween = 1500 }: SpeechBubbleProps) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const characterImagePath = "/MainImage/PibiTeach.png";
  const fallbackImage = "https://images.unsplash.com/photo-1507003211169-0a1dd7238f2d?w=120&h=120&fit=crop&crop=face&auto=format";

  useEffect(() => {
    if (messageIndex < messages.length) {
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        setCurrentMessage(messages[messageIndex].slice(0, charIndex + 1));
        charIndex++;
        if (charIndex === messages[messageIndex].length) {
          clearInterval(typingInterval);
          setTimeout(() => setMessageIndex(messageIndex + 1), delayBetween);
        }
      }, typingSpeed);
      return () => clearInterval(typingInterval);
    }
  }, [messageIndex, messages, typingSpeed, delayBetween]);

  const handleImageError = () => {
    console.log('Character image failed to load:', characterImagePath);
    setImageError(true);
  };

  return (
    <div className="flex items-center space-x-4 p-4">
      <div ref={imageRef} className="flex-shrink-0">
        <img 
          src={imageError ? fallbackImage : characterImagePath}
          alt="Character" 
          className="w-24 h-24 object-contain bg-transparent" 
          onError={handleImageError}
          onLoad={() => console.log('Character image loaded successfully')}
        />
      </div>

      <div className="relative bg-white text-gray-800 px-6 py-4 rounded-lg shadow-md border border-gray-200 max-w-xl">
        <p className="text-lg font-medium">{currentMessage}</p>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45"></div>
      </div>
    </div>
  );
}

// Main Carousel Content Component
const CarouselContent: React.FC<CombinedCarouselProps> = ({
  slides,
  themeColor = "blue",
  onModuleComplete,
  // completedModules is now ignored - we use lessonProgress instead
  finishButtonText = "Finish Reading",
  completedButtonText = "✓ Completed",
  continueButtonText = "Continue Reading",
  backButtonText = "Back",
  moduleId = "sample-module",
  lessonId,
  speechBubbleMessages = ["Say No to Smoking", "Protect Your Health and Others!"],
  moduleTitle = "Anti Smoking",
  moduleDescription = "Learn about the dangers of smoking and how to promote a smoke-free environment for a healthier community.",
  iconImage = "/MainImage/1.png",
  timerDuration = 10,
  timerColor = "red",
  onClose,
  onExit
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);
  const [canProceed, setCanProceed] = useState(false);
  const [iconImageError, setIconImageError] = useState(false);
  const [iconImageLoaded, setIconImageLoaded] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the enhanced progress hook - THIS IS THE KEY FIX
  const { 
    lessonProgress, 
    loading: progressLoading, 
    updating: progressUpdating, 
    error: progressError,
    updateProgress,
    refetch: refetchProgress
  } = useLessonProgress(lessonId);

  // FIXED: Use lessonProgress from hook instead of completedModules prop
  const isLessonCompleted = () => {
    // Only check user-specific lesson progress from the hook
    const completed = lessonProgress?.completed || false;
    console.log(`Checking completion for lesson ${lessonId}: ${completed}`);
    return completed;
  };

  const currentSlides = slides && slides.length > 0 ? slides : [
    {
      id: "1",
      image: "https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=Slide+1",
      title: "Welcome to Our Carousel",
      content: "This is the first slide of our beautiful carousel component. It features a clean design with smooth transitions and responsive layout."
    },
    {
      id: "2", 
      image: "https://via.placeholder.com/600x400/10B981/FFFFFF?text=Slide+2",
      title: "Features Overview",
      content: "Our carousel includes desktop and mobile responsive designs, navigation controls, progress indicators, and customizable styling options."
    },
    {
      id: "3",
      image: "https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=Slide+3",
      title: "Getting Started",
      content: "You can easily customize the theme colors, button text, and handle completion events. The component is fully responsive and works great on all devices."
    }
  ];

  const handleIconError = () => {
    console.log('Icon image failed to load:', iconImage);
    setIconImageError(true);
  };

  const handleIconLoad = () => {
    console.log('Icon image loaded successfully:', iconImage);
    setIconImageLoaded(true);
  };

  const getTimerClasses = (color: string) => {
    switch (color.toLowerCase()) {
      case 'red':
        return 'bg-red-500 text-white';
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'green':
        return 'bg-green-500 text-white';
      case 'yellow':
        return 'bg-yellow-500 text-white';
      case 'purple':
        return 'bg-purple-500 text-white';
      case 'orange':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-red-500 text-white';
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Timer effect - FIXED: Check lessonProgress instead of completedModules
  useEffect(() => {
    if (isLessonCompleted()) {
      setCanProceed(true);
      setTimeRemaining(0);
      return;
    }

    setTimeRemaining(timerDuration);
    setCanProceed(false);
    setStartTime(new Date());
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanProceed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSlide, timerDuration, isLessonCompleted()]);

  // FIXED: Enhanced completion tracking with better error handling
  const markLessonComplete = async () => {
    if (progressUpdating || isLessonCompleted()) return;

    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    
    console.log(`Attempting to complete lesson ${lessonId} with ${timeSpent}s spent`);
    
    const success = await updateProgress(timeSpent, 100);
    
    if (success) {
      console.log('Lesson progress updated successfully');
      
      // Force refetch to ensure we have latest data
      await refetchProgress();
      
      if (onModuleComplete) {
        onModuleComplete(moduleId);
      }
    } else {
      console.error('Failed to update lesson progress:', progressError);
      // Show error to user
      alert('Failed to save your progress. Please try again.');
    }
  };

  const nextSlide = () => {
    if (canProceed || isLessonCompleted()) {
      setCurrentSlide((prev) => (prev === currentSlides.length - 1 ? 0 : prev + 1));
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    if (isSubmitting || progressUpdating || isLessonCompleted()) {
      console.log('Submission blocked: already submitting or completed');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(`Starting lesson completion for lesson ${lessonId}`);
      await markLessonComplete();
      console.log(`Lesson completion finished for lesson ${lessonId}`);
    } catch (error) {
      console.error('Error in handleFinish:', error);
      alert('Failed to complete lesson. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonText = () => {
    if (isLessonCompleted()) {
      return continueButtonText;
    } else if (canProceed) {
      return continueButtonText;
    } else {
      return `Wait (${timeRemaining}s)`;
    }
  };

  // Show loading state
  if (progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson progress...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's a critical error
  if (progressError && !lessonProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error Loading Lesson</p>
            <p className="text-sm">{progressError}</p>
          </div>
          <button
            onClick={refetchProgress}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {onExit && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={onExit}
            className="bg-white rounded-full p-2 shadow-md text-gray-500 hover:text-gray-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Exit lesson"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {lessonProgress && (
        <div className="w-full bg-gray-200 h-1">
          <div 
            className={`h-1 transition-all duration-300 ${
              lessonProgress.completed ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${lessonProgress.progress}%` }}
          ></div>
        </div>
      )}

      {progressError && lessonProgress && (
        <div className="w-full bg-yellow-100 border-b border-yellow-300 px-4 py-2">
          <p className="text-yellow-800 text-sm text-center">
            Warning: {progressError}
          </p>
        </div>
      )}

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-30 transform translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full opacity-20 transform -translate-x-1/3 translate-y-1/4"></div>
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-20"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-green-100 rounded-full opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-6 flex flex-col items-center">
        <div className="w-full p-4 mb-2">
          <div className="relative">
            <SpeechBubble messages={speechBubbleMessages} />
          </div>
        </div>

        <div className="relative w-full mb-2 flex items-center justify-center">
          <div className="absolute h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-full"></div>
          <div className="relative bg-white p-3 rounded-full shadow-sm z-10 border border-gray-200">
            {iconImageError ? (
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">📚</span>
              </div>
            ) : (
              <img
                src={iconImage}
                alt="Module Icon"
                className="h-8 w-8 object-contain"
                onError={handleIconError}
                onLoad={handleIconLoad}
                style={{
                  display: iconImageLoaded || !iconImageError ? 'block' : 'none'
                }}
              />
            )}
          </div>
        </div>

        <div className="w-full text-center mb-4">
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-800">{moduleTitle}</h2>
            {isLessonCompleted() && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                ✓ Completed
              </span>
            )}
          </div>
          <p className="text-gray-600">{moduleDescription}</p>
        </div>
      </div>

      {/* Rest of the carousel content remains the same... */}
      <div className="flex-grow flex justify-center items-center w-full relative z-10 px-4 mb-6">
        <div className="w-full max-w-6xl"> 
          {!isMobile && (
            <div className="relative flex items-center h-[500px]">
              <div className="w-full overflow-hidden rounded-2xl shadow-lg relative">
                {!canProceed && !isLessonCompleted() && (
                  <div className={`absolute top-0 left-0 right-0 z-30 ${getTimerClasses(timerColor)} py-2 px-4 text-center font-medium`}>
                    Please continue reading. You can proceed in {timeRemaining} seconds.
                  </div>
                )}

                {currentSlide > 0 && (
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-80 rounded-full w-12 h-12 flex items-center justify-center focus:outline-none shadow-md hover:bg-gray-50 hover:bg-opacity-90 active:bg-gray-100 hover:shadow-lg active:shadow-md transform transition-all duration-200 active:scale-95 hover:scale-100 text-blue-500 hover:text-blue-600"
                    aria-label="Previous slide"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                )}

                <div className="flex transition-transform duration-500 ease-in-out h-[500px]"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {currentSlides.map((slide, index) => (
                    <div key={index} className="min-w-full flex bg-white h-full">
                      <div className="w-3/5 relative bg-white">
                        <div className="w-full h-full relative">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="w-2/5 p-12 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold mb-5 text-gray-800">{slide.title}</h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-8">{slide.content}</p>
                        
                        {index === currentSlides.length - 1 && (
                          <button
                            onClick={handleFinish}
                            disabled={progressUpdating || isSubmitting}
                            className={`${isLessonCompleted() 
                              ? 'bg-green-500 hover:bg-green-600 border-green-700' 
                              : (progressUpdating || isSubmitting)
                                ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 border-blue-700'
                            } text-white font-medium py-3 px-6 rounded-lg 
                            transition-all w-full border-b-4
                            ${!(progressUpdating || isSubmitting) ? 'hover:border-b-2 hover:mb-0.5 hover:translate-y-0.5 active:border-b-0 active:mb-1 active:translate-y-1' : ''}`}
                          >
                            {(progressUpdating || isSubmitting) 
                              ? 'Saving Progress...' 
                              : isLessonCompleted() 
                                ? completedButtonText 
                                : finishButtonText}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {currentSlide < currentSlides.length - 1 && (
                  <button
                    onClick={canProceed || isLessonCompleted() ? nextSlide : undefined}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full w-12 h-12 flex items-center justify-center
                    focus:outline-none shadow-md
                    transform transition-all duration-200
                    ${canProceed || isLessonCompleted()
                      ? `bg-white bg-opacity-80
                        hover:bg-gray-50 hover:bg-opacity-90 active:bg-gray-100
                        hover:shadow-lg active:shadow-md  
                        active:scale-95 hover:scale-100
                        text-blue-500 hover:text-blue-600`
                      : `bg-gray-300 bg-opacity-80 cursor-not-allowed text-gray-500`
                    }`}
                    aria-label="Next slide"
                    disabled={!canProceed && !isLessonCompleted()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {currentSlides.map((slide, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (index <= currentSlide || isLessonCompleted()) {
                        setCurrentSlide(index);
                      }
                    }}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === index
                        ? 'bg-blue-500 w-6'
                        : isLessonCompleted()
                          ? 'bg-green-500 w-2'
                          : index < currentSlide
                            ? 'bg-blue-300 w-2'
                            : 'bg-gray-300 hover:bg-gray-400 w-2 cursor-not-allowed'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    disabled={index > currentSlide && !isLessonCompleted()}
                  />
                ))}
              </div>
            </div>
          )}

          {isMobile && (
            <div className="w-full px-4">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {!canProceed && !isLessonCompleted() && (
                  <div className={`${getTimerClasses(timerColor)} py-2 px-4 text-center text-sm font-medium`}>
                    Please continue reading. You can proceed in {timeRemaining} seconds.
                  </div>
                )}

                <div className="w-full aspect-square relative bg-white">
                  <img
                    src={currentSlides[currentSlide].image}
                    alt={currentSlides[currentSlide].title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold mb-3 text-gray-800">{currentSlides[currentSlide].title}</h2>
                  <p className="text-gray-600 text-base mb-6">{currentSlides[currentSlide].content}</p>
                  
                  {currentSlide === currentSlides.length - 1 ? (
                    <button
                      onClick={handleFinish}
                      disabled={progressUpdating || isSubmitting}
                      className={`w-full ${isLessonCompleted() 
                        ? 'bg-green-500 hover:bg-green-600 border-green-700' 
                        : (progressUpdating || isSubmitting)
                          ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 border-blue-700'
                      } text-white font-bold py-3 px-4 rounded-lg 
                      mb-4 transition-all border-b-4
                      ${!(progressUpdating || isSubmitting) ? 'hover:border-b-2 hover:mb-[18px] hover:translate-y-0.5 active:border-b-0 active:mb-5 active:translate-y-1' : ''}`}
                    >
                      {(progressUpdating || isSubmitting) 
                        ? 'Saving Progress...' 
                        : isLessonCompleted() 
                          ? completedButtonText 
                          : finishButtonText}
                    </button>
                  ) : (
                    <button
                      onClick={canProceed || isLessonCompleted() ? nextSlide : undefined}
                      className={`w-full ${
                        canProceed || isLessonCompleted()
                          ? 'bg-blue-500 hover:bg-blue-600 border-blue-700'
                          : 'bg-gray-400 border-gray-500 cursor-not-allowed'
                      } text-white font-bold py-3 px-4 rounded-lg 
                      mb-4 transition-all border-b-4
                      ${canProceed || isLessonCompleted() 
                        ? `hover:border-b-2 hover:mb-[18px] hover:translate-y-0.5
                          active:border-b-0 active:mb-5 active:translate-y-1`
                        : ''
                      }`}
                      disabled={!canProceed && !isLessonCompleted()}
                    >
                      {currentSlide === currentSlides.length - 1 
                        ? finishButtonText 
                        : isLessonCompleted() 
                          ? continueButtonText 
                          : getButtonText()}
                    </button>
                  )}

                  {currentSlide > 0 && (
                    <button
                      onClick={prevSlide}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all border-b-4 border-gray-300 hover:border-b-2 hover:mb-0.5 hover:translate-y-0.5 active:border-b-0 active:mb-1 active:translate-y-1"
                    >
                      {backButtonText}
                    </button>
                  )}
                </div>

                <div className="px-6 pb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1 flex-grow">
                      {currentSlides.map((slide, index) => (
                        <div
                          key={index}
                          className={`h-2 rounded-full transition-all flex-grow ${
                            index === currentSlide
                              ? 'bg-blue-500'
                              : isLessonCompleted()
                                ? 'bg-green-500'
                                : index < currentSlide
                                  ? 'bg-blue-300'
                                  : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {currentSlide + 1}/{currentSlides.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component that can be used as modal or standalone
const CombinedCarousel: React.FC<CombinedCarouselProps> = (props) => {
  const {
    isOpen = true,
    onClose,
    showAsModal = false,
    onExit,
    ...carouselProps
  } = props;

  if (showAsModal) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose || onExit || (() => {})}
        className="w-full max-w-7xl max-h-[90vh]"
        showCloseButton={false}
      >
        <CarouselContent {...carouselProps} onClose={onClose} onExit={onExit} />
      </Modal>
    );
  }

  return <CarouselContent {...carouselProps} onClose={onClose} onExit={onExit} />;
};

export default CombinedCarousel;