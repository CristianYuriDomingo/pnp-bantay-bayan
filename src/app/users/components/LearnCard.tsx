// components/LearnCard.tsx - With Auto-Refresh (Quiz Badges Excluded)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

// Badge interface for display
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
        {imageSrc && (
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
            <div className="relative w-32 h-32">
              <Image
                src={imageSrc}
                alt="Modal Image"
                fill
                className="object-cover"
                priority
                sizes="128px"
              />
            </div>
          </div>
        )}

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-blue-500 hover:text-gray-900 text-xl font-bold transition-colors duration-200"
        >
          ✖
        </button>

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
  const queryClient = useQueryClient();
  const { overallProgress, loading: progressLoading } = useOverallProgress();
  const { badges, loading: badgesLoading } = useAllBadges();
  
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDisplay | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch module lessons with React Query
  const { 
    data: moduleLessons = [], 
    isLoading: lessonsLoading,
    error: lessonsError,
    refetch: refetchLessons
  } = useQuery({
    queryKey: ['moduleLessons', moduleId],
    queryFn: async (): Promise<Lesson[]> => {
      const response = await fetch(`/api/users/lessons?moduleId=${moduleId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch lessons');
      }
      
      return data.data;
    },
    enabled: !!moduleId,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for faster updates
    gcTime: 5 * 60 * 1000,
  });

  // Listen for progress and badge events to refresh
  useEffect(() => {
    const handleProgressRefresh = () => {
      console.log(`🔄 Progress refresh event - invalidating module ${moduleId} data`);
      // Invalidate this specific module's data
      queryClient.invalidateQueries({ queryKey: ['moduleLessons', moduleId] });
      queryClient.invalidateQueries({ queryKey: ['moduleProgress', moduleId] });
    };

    const handleBadgesAwarded = () => {
      console.log(`🏅 Badges awarded - refreshing module ${moduleId} badges`);
      // Badges are already invalidated by the hook, but we can force a UI update
      queryClient.invalidateQueries({ queryKey: ['allBadges'] });
    };

    const handleLessonCompleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { moduleId: completedModuleId } = customEvent.detail;
      
      // Only refresh if this is our module
      if (completedModuleId === moduleId) {
        console.log(`✅ Lesson completed in module ${moduleId} - refreshing`);
        queryClient.invalidateQueries({ queryKey: ['moduleLessons', moduleId] });
        queryClient.invalidateQueries({ queryKey: ['moduleProgress', moduleId] });
      }
    };

    window.addEventListener('progressRefresh', handleProgressRefresh);
    window.addEventListener('badgesAwarded', handleBadgesAwarded);
    window.addEventListener('lessonCompleted', handleLessonCompleted);
    
    return () => {
      window.removeEventListener('progressRefresh', handleProgressRefresh);
      window.removeEventListener('badgesAwarded', handleBadgesAwarded);
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
    };
  }, [moduleId, queryClient]);

  // Get progress data for this module
  const moduleProgress = overallProgress?.moduleProgress?.[moduleId];
  const completedLessons = moduleProgress?.completedLessons?.length || 0;
  const totalLessons = moduleProgress?.totalLessons || 0;

  // Filter badges for this module AND its lessons (EXCLUDING QUIZ BADGES)
  const moduleBadges: BadgeDisplay[] = React.useMemo(() => {
    if (!badges || badgesLoading || !moduleLessons.length) return [];
    
    const lessonIds = moduleLessons.map(lesson => lesson.id);
    
    const earnedBadges = badges
      .filter(badge => {
        if (!badge.isEarned) return false;
        
        // 🚫 EXCLUDE ALL QUIZ BADGES
        if (badge.triggerType === 'quiz_mastery' || badge.triggerType === 'parent_quiz_mastery') {
          return false;
        }
        
        // Only include module completion badges
        const isModuleBadge = badge.triggerType === 'module_complete' && badge.triggerValue === moduleId;
        
        // Only include lesson completion badges for lessons in THIS module
        const isLessonBadge = badge.triggerType === 'lesson_complete' && 
                            lessonIds.includes(badge.triggerValue);
        
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

    return earnedBadges
      .sort((a, b) => {
        // Module badges first
        const aIsModule = a.triggerType === 'module_complete';
        const bIsModule = b.triggerType === 'module_complete';
        
        if (aIsModule && !bIsModule) return -1;
        if (!aIsModule && bIsModule) return 1;
        
        // Then by rarity
        const rarityOrder: Record<string, number> = { 'Legendary': 0, 'Epic': 1, 'Rare': 2, 'Common': 3 };
        const rarityDiff = (rarityOrder[a.rarity] || 3) - (rarityOrder[b.rarity] || 3);
        if (rarityDiff !== 0) return rarityDiff;
        
        // Finally by date
        return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
      })
      .slice(0, 3);
  }, [badges, badgesLoading, moduleId, moduleLessons]);

  const handleLessonClick = (lessonId: string) => {
    closeModal();
    router.push(`/users/lessons/${lessonId}`);
    onCardClick?.();
  };

  // Function to handle badge click
  const handleBadgeClick = (e: React.MouseEvent, badge: BadgeDisplay) => {
    e.stopPropagation();
    setSelectedBadge(badge);
    setBadgeModalOpen(true);
  };

  // Function to get badge source description
  const getBadgeSourceDescription = (badge: BadgeDisplay) => {
    if (badge.triggerType === 'module_complete' && badge.triggerValue === moduleId) {
      return `Module completion badge`;
    }
    
    const lesson = moduleLessons.find(l => l.id === badge.triggerValue);
    if (lesson && badge.triggerType === 'lesson_complete') {
      return `Lesson: ${lesson.title}`;
    }
    
    return badge.triggerType.replace('_', ' ');
  };

  // Handle card click
  const handleCardClick = () => {
    if (isAvailable) {
      openModal();
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`relative w-full max-w-[180px] sm:max-w-[220px] md:max-w-[250px] h-56 sm:h-68 md:h-80 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
          isAvailable 
            ? 'hover:scale-105 cursor-pointer active:scale-100' 
            : 'opacity-75 cursor-not-allowed'
        }`}
      >
        {/* Image Container - takes up 70% of card height */}
        <div className="relative w-full h-[70%] bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
          {!imageError && imageSrc ? (
            <div className="relative w-full h-full">
              <Image
                src={imageSrc}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, 250px"
                onError={() => {
                  console.log('Image failed to load:', imageSrc);
                  setImageError(true);
                }}
                priority={false}
                loading="lazy"
              />
            </div>
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
              {moduleBadges.slice(0, 3).map((badge) => {
                const isModuleBadge = badge.triggerType === 'module_complete';
                
                return (
                  <div 
                    key={badge.id} 
                    className={`relative filter drop-shadow-lg transition-transform duration-200 hover:scale-110 cursor-pointer ${
                      isModuleBadge 
                        ? 'w-10 h-10 sm:w-12 sm:h-12'
                        : 'w-6 h-6 sm:w-8 sm:h-8'
                    }`}
                    onClick={(e) => handleBadgeClick(e, badge)}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={badge.image}
                        alt={badge.name}
                        fill
                        className={`object-contain ${isModuleBadge ? 'rounded-full' : ''}`}
                        sizes={isModuleBadge ? "48px" : "32px"}
                        onError={(e) => {
                          const ev = e as React.SyntheticEvent<HTMLImageElement, Event>;
                          (ev.currentTarget as HTMLImageElement).style.display = 'none';
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
            <div
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 pointer-events-none ${
                isAvailable
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-400 text-gray-200'
              }`}
            >
              {buttonText}
            </div>
          </div>
        </div>

        {/* Content Section with Fading Gradient Overlay */}
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
                <p className="text-red-600 text-sm">{(lessonsError as Error).message}</p>
                <button 
                  onClick={() => refetchLessons()}
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
              moduleLessons.map((lesson) => {
                const isCompleted = moduleProgress?.completedLessons?.includes(lesson.id) || false;
                return (
                  <button 
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson.id)}
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

      {/* Badge Detail Modal */}
      <Modal isOpen={badgeModalOpen} onClose={() => setBadgeModalOpen(false)} imageSrc="">
        {selectedBadge && (
          <div className="p-4 flex flex-col items-center">
            <div className="w-24 h-24 mb-4 relative">
              <Image
                src={selectedBadge.image}
                alt={selectedBadge.name}
                fill
                className="object-contain"
                sizes="96px"
                onError={(e) => {
                  const ev = e as React.SyntheticEvent<HTMLImageElement, Event>;
                  (ev.currentTarget as HTMLImageElement).style.display = 'none';
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