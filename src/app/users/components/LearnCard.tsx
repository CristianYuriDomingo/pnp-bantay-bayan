// components/LearnCard.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, imageSrc }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg mx-4">
        {/* Image - Stays at the top with NO RADIUS and NO BORDER */}
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
          <img
            src={imageSrc || "/DashboardImage/profile.png"}
            alt="Modal Image"
            className="w-32 h-32 object-cover bg-transparent"
            style={{ backgroundColor: 'transparent' }}
          />
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-blue-500 hover:text-gray-900 text-xl font-bold transition-colors duration-200"
        >
          ✖
        </button>

        {/* Push content down to accommodate the image */}
        <div className="mt-14">{children}</div>
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
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moduleLessons, setModuleLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch lessons when modal opens
  useEffect(() => {
    const fetchLessons = async () => {
      if (isModalOpen && moduleId) {
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
  }, [isModalOpen, moduleId]);

  const handleLessonClick = (lessonId: string, lessonTitle: string) => {
    closeModal();
    // Navigate to the lesson page without alert
    router.push(`/users/lessons/${lessonId}`);
    onCardClick?.(); // Call the original onCardClick function if provided
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
                  
          {/* Button positioned in bottom-right corner of image */}
          <div className="absolute bottom-3 right-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isAvailable) {
                  openModal(); // Open modal on button click only
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
          {/* Fading gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-blue-300/10 to-transparent"></div>
                  
          {/* Title and Lessons Info */}
          <div className="relative text-left z-10">
            <h3 className="text-blue-600 font-bold text-sm sm:text-base md:text-lg mb-1 line-clamp-2 leading-tight">{title}</h3>
            <p className="text-blue-500 text-xs sm:text-sm font-medium">{lessons}</p>
          </div>
        </div>
      </div>

      {/* Modal with Local Image */}
      <Modal isOpen={isModalOpen} onClose={closeModal} imageSrc="/MainImage/Pibi.png">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">Choose a Lesson</p>
          
          {/* Lesson List */}
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
                    // Trigger refetch by toggling modal
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
              moduleLessons.map((lesson, index) => (
                <button 
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson.id, lesson.title)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  {lesson.title}
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LearnCard;