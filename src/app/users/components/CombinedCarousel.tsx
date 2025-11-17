// app/users/components/CombinedCarousel.tsx - ENHANCED UI
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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
  onModuleComplete?: (moduleId: string) => void;
  completedModules?: string[];
  finishButtonText?: string;
  completedButtonText?: string;
  continueButtonText?: string;
  backButtonText?: string;
  moduleId?: string;
  lessonId: string;
  speechBubbleMessages?: string[];
  moduleTitle?: string;
  moduleDescription?: string;
  timerDuration?: number;
  isOpen?: boolean;
  onClose?: () => void;
  showAsModal?: boolean;
  onExit?: () => void;
};

// Enhanced Speech Bubble Component
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
      <div ref={imageRef} className="flex-shrink-0 relative w-24 h-24">
        <Image 
          src={imageError ? fallbackImage : characterImagePath}
          alt="Character" 
          fill
          className="object-contain bg-transparent"
          onError={handleImageError}
        />
      </div>

      <div className="relative bg-white text-gray-800 px-6 py-4 rounded-2xl border-2 border-blue-100 max-w-xl">
        <p className="text-lg font-medium">{currentMessage}</p>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-white border-l-2 border-b-2 border-blue-100 rotate-45"></div>
      </div>
    </div>
  );
}

// Main Carousel Content Component
const CarouselContent: React.FC<CombinedCarouselProps> = ({
  slides,
  onModuleComplete,
  finishButtonText = "Finish Reading",
  completedButtonText = "✓ Completed",
  continueButtonText = "Continue Reading",
  backButtonText = "Back",
  moduleId = "sample-module",
  lessonId,
  speechBubbleMessages = ["Say No to Smoking", "Protect Your Health and Others!"],
  moduleTitle = "Anti Smoking",
  moduleDescription = "Learn about the dangers of smoking and how to promote a smoke-free environment for a healthier community.",
  timerDuration = 10,
  onExit
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);
  const [canProceed, setCanProceed] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    lessonProgress, 
    loading: progressLoading, 
    updating: progressUpdating, 
    error: progressError,
    updateProgress,
    refetch: refetchProgress
  } = useLessonProgress(lessonId);

  const isLessonCompletedValue = lessonProgress?.completed || false;

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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isLessonCompletedValue) {
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
  }, [currentSlide, timerDuration, isLessonCompletedValue]);

  const markLessonComplete = async () => {
    if (progressUpdating || isLessonCompletedValue) return;

    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    
    console.log(`Attempting to complete lesson ${lessonId} with ${timeSpent}s spent`);
    
    const success = await updateProgress(timeSpent, 100);
    
    if (success) {
      console.log('Lesson progress updated successfully');
      await refetchProgress();
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lessonCompleted', {
          detail: { lessonId, moduleId, timestamp: Date.now() }
        }));
        
        window.dispatchEvent(new CustomEvent('progressRefresh', {
          detail: { timestamp: Date.now() }
        }));
        
        localStorage.setItem('lessonCompleted', JSON.stringify({
          lessonId,
          moduleId,
          timestamp: Date.now()
        }));
        
        setTimeout(() => {
          localStorage.removeItem('lessonCompleted');
        }, 2000);
        
        console.log(`Enhanced completion events dispatched for lesson ${lessonId}`);
      }, 1000);
      
      if (onModuleComplete) {
        onModuleComplete(moduleId);
      }
    } else {
      console.error('Failed to update lesson progress:', progressError);
      alert('Failed to save your progress. Please try again.');
    }
  };

  const nextSlide = () => {
    if (canProceed || isLessonCompletedValue) {
      setCurrentSlide((prev) => (prev === currentSlides.length - 1 ? 0 : prev + 1));
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    if (isSubmitting || progressUpdating || isLessonCompletedValue) {
      console.log('Submission blocked: already submitting or completed');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(`Starting lesson completion for lesson ${lessonId}`);
      await markLessonComplete();
      console.log(`Lesson completion finished for lesson ${lessonId}`);
      
      localStorage.setItem('lessonCompleted', JSON.stringify({
        lessonId,
        moduleId,
        timestamp: Date.now()
      }));
      
      window.dispatchEvent(new CustomEvent('lessonCompleted', {
        detail: { lessonId, moduleId }
      }));
      
      console.log(`📡 Dispatched completion events for lesson ${lessonId}`);
      
    } catch (error) {
      console.error('Error in handleFinish:', error);
      alert('Failed to complete lesson. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonText = () => {
    if (isLessonCompletedValue) {
      return continueButtonText;
    } else if (canProceed) {
      return continueButtonText;
    } else {
      return `Wait (${timeRemaining}s)`;
    }
  };

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {lessonProgress && (
        <div className="w-full bg-gray-200 h-2 shadow-inner">
          <div 
            className={`h-2 transition-all duration-300 ${
              lessonProgress.completed ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full opacity-20 transform translate-x-1/3 -translate-y-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200 rounded-full opacity-20 transform -translate-x-1/3 translate-y-1/4 blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-blue-300 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-green-200 rounded-full opacity-20 blur-xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-6 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex-1">
            <SpeechBubble messages={speechBubbleMessages} />
          </div>
          
          {onExit && (
            <button
              onClick={onExit}
              className="ml-4 text-gray-600 hover:text-gray-800 transition-all focus:outline-none hover:scale-110 flex-shrink-0"
              aria-label="Exit lesson"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="w-full text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{moduleTitle}</h2>
            {isLessonCompletedValue && (
              <span className="bg-gradient-to-r from-green-400 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                ✓ Completed
              </span>
            )}
          </div>
          <p className="text-gray-600 text-lg">{moduleDescription}</p>
        </div>
      </div>

      <div className="flex-grow flex justify-center items-center w-full relative z-10 px-4 mb-6">
        <div className="w-full max-w-6xl"> 
          {!isMobile && (
            <div className="relative flex items-center h-[500px]">
              <div className="w-full overflow-hidden rounded-3xl relative bg-white">
                {!canProceed && !isLessonCompletedValue && (
                  <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 text-center font-semibold text-base rounded-t-3xl shadow-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Please continue reading. You can proceed in {timeRemaining} seconds.</span>
                    </div>
                  </div>
                )}

                {currentSlide > 0 && (
                  <button
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-95 backdrop-blur rounded-full w-14 h-14 flex items-center justify-center focus:outline-none hover:scale-110 active:scale-95 transform transition-all duration-200 text-blue-600 hover:text-blue-700 border-2 border-blue-100"
                    aria-label="Previous slide"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                )}

                <div className="flex transition-transform duration-500 ease-in-out h-[500px]"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {currentSlides.map((slide) => (
                    <div key={slide.id} className="min-w-full flex bg-white h-full">
                      <div className="w-3/5 relative bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="w-full h-full relative">
                          <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-10"></div>
                        </div>
                      </div>

                      <div className="w-2/5 p-12 flex flex-col justify-center bg-gradient-to-br from-white to-blue-50">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 leading-tight">{slide.title}</h2>
                        <p className="text-lg text-gray-700 leading-relaxed mb-8">{slide.content}</p>
                        
                        {slide.id === currentSlides[currentSlides.length - 1].id && (
                          <button
                            onClick={handleFinish}
                            disabled={progressUpdating || isSubmitting}
                            className={`${isLessonCompletedValue 
                              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-green-700 shadow-green-200' 
                              : (progressUpdating || isSubmitting)
                                ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-700 shadow-blue-200'
                            } text-white font-semibold py-4 px-8 rounded-xl 
                            transition-all w-full border-b-4 shadow-lg
                            ${!(progressUpdating || isSubmitting) ? 'hover:border-b-2 hover:mb-0.5 hover:translate-y-0.5 hover:shadow-xl active:border-b-0 active:mb-1 active:translate-y-1' : ''}`}
                          >
                            {(progressUpdating || isSubmitting) 
                              ? 'Saving Progress...' 
                              : isLessonCompletedValue 
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
                    onClick={canProceed || isLessonCompletedValue ? nextSlide : undefined}
                    className={`absolute right-6 top-1/2 -translate-y-1/2 z-20 rounded-full w-14 h-14 flex items-center justify-center
                    focus:outline-none shadow-xl border-2
                    transform transition-all duration-200
                    ${canProceed || isLessonCompletedValue
                      ? `bg-white bg-opacity-95 backdrop-blur border-blue-100
                        hover:shadow-2xl hover:scale-110 active:scale-95
                        text-blue-600 hover:text-blue-700`
                      : `bg-gray-300 bg-opacity-80 cursor-not-allowed text-gray-500 border-gray-400`
                    }`}
                    aria-label="Next slide"
                    disabled={!canProceed && !isLessonCompletedValue}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 bg-white bg-opacity-90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                {currentSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => {
                      if (index <= currentSlide || isLessonCompletedValue) {
                        setCurrentSlide(index);
                      }
                    }}
                    className={`h-2.5 rounded-full transition-all ${
                      currentSlide === index
                        ? 'bg-blue-600 w-8 shadow-md'
                        : isLessonCompletedValue
                          ? 'bg-green-500 w-2.5'
                          : index < currentSlide
                            ? 'bg-blue-400 w-2.5'
                            : 'bg-gray-300 hover:bg-gray-400 w-2.5 cursor-not-allowed'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    disabled={index > currentSlide && !isLessonCompletedValue}
                  />
                ))}
              </div>
            </div>
          )}

          {isMobile && (
            <div className="w-full px-4">
              <div className="bg-white rounded-3xl overflow-hidden">
                {!canProceed && !isLessonCompletedValue && (
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 text-center text-sm font-semibold rounded-t-3xl shadow-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Please continue reading. Proceed in {timeRemaining}s.</span>
                    </div>
                  </div>
                )}

                <div className="w-full aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100">
                  <Image
                    src={currentSlides[currentSlide].image}
                    alt={currentSlides[currentSlide].title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-6 bg-gradient-to-br from-white to-blue-50">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">{currentSlides[currentSlide].title}</h2>
                  <p className="text-gray-700 text-base mb-6 leading-relaxed">{currentSlides[currentSlide].content}</p>
                  
                  {currentSlide === currentSlides.length - 1 ? (
                    <button
                      onClick={handleFinish}
                      disabled={progressUpdating || isSubmitting}
                      className={`w-full ${isLessonCompletedValue 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-green-700' 
                        : (progressUpdating || isSubmitting)
                          ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-700'
                      } text-white font-bold py-4 px-4 rounded-xl 
                      mb-4 transition-all border-b-4 shadow-lg
                      ${!(progressUpdating || isSubmitting) ? 'hover:border-b-2 hover:mb-[18px] hover:translate-y-0.5 active:border-b-0 active:mb-5 active:translate-y-1' : ''}`}
                    >
                      {(progressUpdating || isSubmitting) 
                        ? 'Saving Progress...' 
                        : isLessonCompletedValue 
                          ? completedButtonText 
                          : finishButtonText}
                    </button>
                  ) : (
                    <button
                      onClick={canProceed || isLessonCompletedValue ? nextSlide : undefined}
                      className={`w-full ${
                        canProceed || isLessonCompletedValue
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-700'
                          : 'bg-gray-400 border-gray-500 cursor-not-allowed'
                      } text-white font-bold py-4 px-4 rounded-xl 
                      mb-4 transition-all border-b-4 shadow-lg
                      ${canProceed || isLessonCompletedValue 
                        ? `hover:border-b-2 hover:mb-[18px] hover:translate-y-0.5
                          active:border-b-0 active:mb-5 active:translate-y-1`
                        : ''
                      }`}
                      disabled={!canProceed && !isLessonCompletedValue}
                    >
                      {currentSlide === currentSlides.length - 1 
                        ? finishButtonText 
                        : isLessonCompletedValue 
                          ? continueButtonText 
                          : getButtonText()}
                    </button>
                  )}

                  {currentSlide > 0 && (
                    <button
                      onClick={prevSlide}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all border-b-4 border-gray-300 hover:border-b-2 hover:mb-0.5 hover:translate-y-0.5 active:border-b-0 active:mb-1 active:translate-y-1 shadow-md"
                    >
                      {backButtonText}
                    </button>
                  )}
                </div>

                <div className="px-6 pb-5">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2 flex-grow">
                      {currentSlides.map((slide, index) => (
                        <div
                          key={slide.id}
                          className={`h-2.5 rounded-full transition-all flex-grow ${
                            index === currentSlide
                              ? 'bg-blue-600 shadow-md'
                              : isLessonCompletedValue
                                ? 'bg-green-500'
                                : index < currentSlide
                                  ? 'bg-blue-400'
                                  : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-600 ml-3 bg-gray-100 px-3 py-1 rounded-full">
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
        <CarouselContent {...carouselProps} onExit={onExit} />
      </Modal>
    );
  }

  return <CarouselContent {...carouselProps} onExit={onExit} />;
};

export default CombinedCarousel;