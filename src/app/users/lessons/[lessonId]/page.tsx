// app/users/lessons/[lessonId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CombinedCarousel from '../../components/CombinedCarousel';

// Define the slide props interface locally
interface SlideProps {
  id: string;
  image: string;
  title: string;
  content: string;
}

// Define the lesson data structure
interface Lesson {
  id: string;
  title: string;
  description: string;
  bubbleSpeech: string;
  timer: number;
  moduleId: string;
  tips: Tip[];
  module: {
    id: string;
    title: string;
    image: string;
  };
}

interface Tip {
  id: string;
  title: string;
  description: string;
  image: string | null;
  lessonId: string;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/lessons/${lessonId}`);
        const data = await response.json();

        if (data.success) {
          setLesson(data.data);
        } else {
          setError(data.error || 'Failed to fetch lesson');
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to fetch lesson');
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  // Load completed modules from localStorage (or your preferred state management)
  useEffect(() => {
    const completed = localStorage.getItem('completedModules');
    if (completed) {
      setCompletedModules(JSON.parse(completed));
    }
  }, []);

  // Handle module completion
  const handleModuleComplete = (moduleId: string) => {
    const updatedCompleted = [...completedModules, moduleId];
    setCompletedModules(updatedCompleted);
    localStorage.setItem('completedModules', JSON.stringify(updatedCompleted));
  };

  // Transform tips to slides format
  const transformTipsToSlides = (tips: Tip[]): SlideProps[] => {
    return tips.map(tip => ({
      id: tip.id,
      image: tip.image || 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=No+Image',
      title: tip.title,
      content: tip.description
    }));
  };

  // Handle navigation back to dashboard
  const handleBackToDashboard = () => {
    router.push('/users/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error || 'Lesson not found'}</p>
            <button
              onClick={handleBackToDashboard}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const slides = transformTipsToSlides(lesson.tips);

  return (
    <CombinedCarousel
      slides={slides}
      themeColor="blue"
      onModuleComplete={handleModuleComplete}
      completedModules={completedModules}
      finishButtonText="Complete Lesson"
      completedButtonText="✓ Lesson Completed"
      continueButtonText="Continue"
      backButtonText="Previous"
      moduleId={lesson.moduleId}
      lessonId={lessonId} // FIXED: Added the missing lessonId prop
      speechBubbleMessages={[lesson.bubbleSpeech || lesson.title]}
      moduleTitle={lesson.title}
      moduleDescription={lesson.description}
      characterImage={lesson.module.image}
      iconImage="https://v.placeholder.com/32x32/3B82F6/FFFFFF?text=📚"
      timerDuration={lesson.timer || 10}
      timerColor="red"
      onExit={handleBackToDashboard}
    />
  );
}