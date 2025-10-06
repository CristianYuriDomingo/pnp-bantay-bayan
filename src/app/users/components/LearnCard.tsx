// components/LearnCard.tsx - FIXED: Badge type compatibility
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOverallProgress } from '@/hooks/use-progress';
import { useAllBadges } from '@/hooks/use-all-badges';

interface LearnCardProps {
  imageSrc: string;
  title: string;
  lessons: string;
  buttonText: string;
  moduleId: string;
  onCardClick?: () => void;
  isAvailable?: boolean;
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  imageSrc?: string;
}

// Lesson interface
interface Lesson {
  id: string;
  title: string;
  description: string;
  bubbleSpeech: string;
  timer: number;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

// Badge interface for display - FIXED: Updated trigger types to match use-all-badges.ts
interface BadgeDisplay {
  id: string;
  name: string;
  image: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  earnedAt: Date;
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_mastery' | 'parent_quiz_mastery' | 'manual';
  triggerValue: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, imageSrc }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg mx-4">
        {/* Conditionally render image only if imageSrc is provided and not empty */}
        {imageSrc && (
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
            <img
              src={imageSrc}
              alt="Modal Image"
              className="w-32 h-32 object-cover bg-transparent"
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
        )}

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-blue-500 hover:text-gray-900 text-xl font-bold transition-colors duration-200"
        >
          ✖
        </button>

        {/* Conditionally push content down only if image exists */}
        <div className={imageSrc ? "mt-14" : ""}>{children}</div>
      </div>
    </div>
  );
};

const LearnCard: React.FC<LearnCardProps> = ({
  imageSrc,
  title,
  lessons,
  buttonText,
  moduleId,
  onCardClick,
  isAvailable = true
}) => {
  const router = useRouter();
  const { overallProgress, loading: progressLoading } = useOverallProgress();
  
  // Add badge hooks
  const { badges, loading: badgesLoading } = useAllBadges();
  
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDisplay | null>(null);
  const [moduleLessons, setModuleLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Get progress data for this module
  const moduleProgress = overallProgress?.moduleProgress?.[moduleId];
  const completedLessons = moduleProgress?.completedLessons?.length || 0;
  const totalLessons = moduleProgress?.totalLessons || 0;
  const completionPercentage = moduleProgress?.percentage || 0;

  // ENHANCED: Filter badges for this module AND its lessons (EXCLUDING quiz badges)
  const moduleBadges: BadgeDisplay[] = React.useMemo(() => {
    if (!badges || badgesLoading || !moduleLessons.length) return [];
    
    // Get all lesson IDs for this module
    const lessonIds = moduleLessons.map(lesson => lesson.id);
    
    // Filter badges that are earned and related to this module or its lessons
    // ONLY show module_complete and lesson_complete badges (NO quiz badges)
    const earnedBadges = badges
      .filter(badge => {
        if (!badge.isEarned) return false;
        
        // Check if badge is for this module (module completion)
        const isModuleBadge = badge.triggerValue === moduleId || 
                             badge.category.toLowerCase().includes(title.toLowerCase().split(' ')[0]);
        
        // Check if badge is for any lesson in this module (lesson completion only)
        const isLessonBadge = badge.triggerType === 'lesson_complete' && 
                             lessonIds.includes(badge.triggerValue);
        
        // ONLY return module and lesson badges (quiz badges excluded)
        return isModuleBadge || isLessonBadge;
      })
      .map(badge => ({
        id: badge.id,
        name: badge.name,
        image: badge.image,
        rarity: badge.rarity,
        earnedAt: badge.earnedAt as Date,
        triggerType: badge.triggerType,
        triggerValue: badge.triggerValue
      }));

    // Sort with module badges first (emphasized), then by rarity
    return earnedBadges
      .sort((a, b) => {
        // First, prioritize module badges (parent badges)
        const aIsModule = a.triggerValue === moduleId || a.triggerType === 'module_complete';
        const bIsModule = b.triggerValue === moduleId || b.triggerType === 'module_complete';
        
        if (aIsModule && !bIsModule) return -1; // a (module) comes first
        if (!aIsModule && bIsModule) return 1;  // b (module) comes first
        
        // If both are module or both are lesson badges, sort by rarity
        const rarityOrder: Record<string, number> = { 'Legendary': 0, 'Epic': 1, 'Rare': 2, 'Common': 3 };
        const rarityDiff = (rarityOrder[a.rarity] || 3) - (rarityOrder[b.rarity] || 3);
        if (rarityDiff !== 0) return rarityDiff;
        
        // Then by earned date (newest first)
        return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
      })
      .slice(0, 3); // Show up to 3 badges
  }, [badges, badgesLoading, moduleId, title, moduleLessons]);

  // Fetch lessons when component mounts or moduleId changes
  useEffect(() => {
    const fetchLessons = async () => {
      if (moduleId) {
        setLessonsLoading(true);
        setLessonsError(null);
        
        try {
          const response = await fetch(`/api/users/lessons?moduleId=${moduleId}`);
          const data = await response.json();
          
          if (data.success) {
            setModuleLessons(data.data);
          } else {
            setLessonsError(data.error || 'Failed to fetch lessons');
          }
        } catch (error) {
          console.error('Error fetching lessons:', error);
          setLessonsError('Failed to fetch lessons');
        } finally {
          setLessonsLoading(false);
        }
      }
    };

    fetchLessons();
  }, [moduleId]);

  const handleLessonClick = (lessonId: string, lessonTitle: string) => {
    closeModal();
    router.push(`/users/lessons/${lessonId}`);
    onCardClick?.();
  };

  // Function to handle badge click
  const handleBadgeClick = (badge: BadgeDisplay) => {
    setSelectedBadge(badge);
    setBadgeModalOpen(true);
  };

  // Function to get badge source description (simplified - no quiz badges)
  const getBadgeSourceDescription = (badge: BadgeDisplay) => {
    if (badge.triggerValue === moduleId || badge.triggerType === 'module_complete') {
      return `Module completion badge`;
    }
    
    const lesson = moduleLessons.find(l => l.id === badge.triggerValue);
    if (lesson && badge.triggerType === 'lesson_complete') {
      return `Lesson: ${lesson.title}`;
    }
    
    return badge.triggerType.replace('_', ' ');
  };

  return (
    <>
      <div
        className={`relative w-full max-w-[180px] sm:max-w-[220px] md:max-w-[250px] h-56 sm:h-68 md:h-80 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
          isAvailable ? 'hover:scale-105' : 'opacity-75'
        }`}
      >
        {/* Image Container - takes up 70% of card height */}
        <div className="relative w-full h-[70%] bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
          {!imageError && imageSrc ? (
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => {
                console.log('Image failed to load:', imageSrc);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-xl font-bold">📚</span>
                </div>
                <span className="text-gray-500 text-sm">No Image</span>
              </div>
            </div>
          )}

          {/* Badge container - Module badges emphasized */}
          {moduleBadges.length > 0 && (
            <div className="absolute top-2 left-2 flex space-x-2 z-20">
              {moduleBadges.slice(0, 3).map((badge, index) => {
                const isModuleBadge = badge.triggerValue === moduleId || badge.triggerType === 'module_complete';
                
                return (
                  <div 
                    key={badge.id} 
                    className={`relative filter drop-shadow-lg transition-transform duration-200 hover:scale-110 cursor-pointer ${
                      isModuleBadge 
                        ? 'w-10 h-10 sm:w-12 sm:h-12'
                        : 'w-6 h-6 sm:w-8 sm:h-8'
                    }`}
                    onClick={() => handleBadgeClick(badge)}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={badge.image}
                        alt={badge.name}
                        className={`w-full h-full object-contain ${
                          isModuleBadge ? 'ring-2 ring-yellow-400 ring-opacity-60 rounded-full' : ''
                        }`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      
                      {isModuleBadge && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-200/20 to-amber-200/20 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
                  
          {/* Button positioned in bottom-right corner of image */}
          <div className="absolute bottom-3 right-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isAvailable) {
                  openModal();
                }
              }}
              disabled={!isAvailable}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                isAvailable
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {buttonText}
            </button>
          </div>
        </div>

        {/* Content Section with Fading Gradient Overlay - takes up 30% of card height */}
        <div className="relative bg-white py-3 px-4 h-[30%] flex flex-col justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-blue-300/10 to-transparent"></div>
                  
          <div className="relative text-left z-10">
            <h3 className="text-blue-600 font-bold text-sm sm:text-base md:text-lg mb-1 line-clamp-2 leading-tight">{title}</h3>
            <div className="flex items-center justify-between">
              <p className="text-blue-500 text-xs sm:text-sm font-medium">{lessons}</p>
              {totalLessons > 0 && !progressLoading && (
                <span className="text-xs text-blue-600 font-medium">
                  {completedLessons}/{totalLessons}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} imageSrc="/MainImage/1.png">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">Choose a Lesson</p>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {lessonsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading lessons...</span>
              </div>
            ) : lessonsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{lessonsError}</p>
                <button 
                  onClick={() => {
                    setLessonsError(null);
                    setIsModalOpen(false);
                    setTimeout(() => setIsModalOpen(true), 100);
                  }}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : moduleLessons.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">No lessons available for this module.</p>
              </div>
            ) : (
              moduleLessons.map((lesson, index) => {
                const isCompleted = moduleProgress?.completedLessons?.includes(lesson.id) || false;
                return (
                  <button 
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson.id, lesson.title)}
                    className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-blue-600 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center relative"
                  >
                    <span className="text-center">{lesson.title}</span>
                    {isCompleted && (
                      <svg className="w-5 h-5 text-green-600 absolute right-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Badge Detail Modal - NO TOP IMAGE */}
      <Modal isOpen={badgeModalOpen} onClose={() => setBadgeModalOpen(false)} imageSrc="">
        {selectedBadge && (
          <div className="p-4 flex flex-col items-center">
            <div className="w-24 h-24 mb-4 relative">
              <img
                src={selectedBadge.image}
                alt={selectedBadge.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <h2 className="text-xl font-bold mb-2">{selectedBadge.name}</h2>
            <div className="text-center">
              <p className="mb-2">You've earned this {selectedBadge.rarity.toLowerCase()} badge!</p>
              <p className="text-sm text-gray-600 mb-1">
                Earned on {selectedBadge.earnedAt.toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {getBadgeSourceDescription(selectedBadge)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default LearnCard;