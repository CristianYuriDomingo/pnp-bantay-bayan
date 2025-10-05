// FILE: src/app/admin/quiz/page.tsx - Updated with badge creation system
'use client';
import { useState, useEffect } from 'react';

// Types
interface Quiz {
  id: string;
  title: string;
  timer: number;
  parentId?: string | null;
  isParent: boolean;
  subjectDomain?: string;
  skillArea?: string;
  questions: Question[];
  children?: Quiz[];
}

interface Question {
  id: string;
  question: string;
  lesson: string;
  image?: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_mastery' | 'parent_quiz_mastery' | 'manual';
  triggerValue: string;
  prerequisites?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Badge Indicator Component
const BadgeIndicator = ({ 
  hasBadge, 
  badgeType, 
  onClick, 
  disabled = false,
  isClickable = true,
  disabledReason = ''
}: { 
  hasBadge: boolean; 
  badgeType: 'parent' | 'sub';
  onClick: () => void;
  disabled?: boolean;
  isClickable?: boolean;
  disabledReason?: string;
}) => {
  if (hasBadge) {
    return (
      <div className="flex items-center space-x-2 text-green-600 text-sm">
        <span className="text-lg">🏆</span>
        <span>{badgeType === 'parent' ? 'Master' : 'Mastery'} badge created</span>
        {isClickable && (
          <button 
            onClick={onClick}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Manage
          </button>
        )}
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="flex items-center space-x-2 text-gray-400 text-sm" title={disabledReason}>
        <span className="text-lg">⭐</span>
        <span>Create {badgeType === 'parent' ? 'master' : 'mastery'} badge</span>
        <span className="text-xs text-gray-500">({disabledReason})</span>
      </div>
    );
  }

  return (
    <button 
      onClick={onClick}
      className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 text-sm border border-orange-200 rounded-lg px-3 py-2 hover:bg-orange-50 transition-colors"
    >
      <span className="text-lg">⭐</span>
      <span>Create {badgeType === 'parent' ? 'master' : 'mastery'} badge</span>
    </button>
  );
};

// Sub-Quiz Mastery Badge Modal (Epic - 90%+)
const SubQuizMasteryBadgeModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  targetQuiz,
  existingBadge,
  parentQuiz
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (badge: Badge) => void;
  targetQuiz: Quiz | null;
  existingBadge?: Badge;
  parentQuiz?: Quiz;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetQuiz) {
      if (existingBadge) {
        setName(existingBadge.name);
        setDescription(existingBadge.description);
        setImagePreview(existingBadge.image);
      } else {
        setName(`${targetQuiz.title} Expert`);
        setDescription(`Achieve Gold or Perfect mastery (90%+) on ${targetQuiz.title}`);
      }
    }
  }, [isOpen, targetQuiz, existingBadge]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !imagePreview || !targetQuiz) {
      return alert('Please fill in all required fields and select an image');
    }
    
    setLoading(true);
    try {
      const badgeData = {
        ...(existingBadge?.id && { id: existingBadge.id }),
        name: name.trim(),
        description: description.trim(),
        image: imagePreview,
        category: parentQuiz?.title || targetQuiz.subjectDomain || 'Quiz Mastery',
        rarity: 'Epic' as const,
        triggerType: 'quiz_mastery' as const,
        triggerValue: targetQuiz.id,
        xpValue: 50, // ADD THIS LINE
      };
      
      const method = existingBadge ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/badges', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badgeData),
      });

      if (!response.ok) throw new Error('Failed to save badge');

      const savedBadge = await response.json();
      onSave(savedBadge);
      onClose();
      alert(`Sub-quiz mastery badge ${existingBadge ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('Error saving badge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !targetQuiz) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {existingBadge ? 'Edit' : 'Create'} Sub-Quiz Mastery Badge
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Epic Badge:</strong> Awarded when users score 90% or higher on this quiz (Gold or Perfect mastery)
            </p>
          </div>

          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>For Quiz:</strong> {targetQuiz.title}
            </p>
            {parentQuiz && (
              <p className="text-xs text-purple-700 mt-1">
                Parent Category: {parentQuiz.title}
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Badge Name *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Password Security Expert"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg h-20 focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what this badge represents..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Rarity</label>
              <input 
                type="text" 
                value="Epic"
                disabled
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Rarity is fixed for sub-quiz mastery badges</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Badge Image *</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="w-full border border-gray-300 p-3 rounded-lg"
              />
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (existingBadge ? 'Updating...' : 'Creating...') : (existingBadge ? 'Update Badge' : 'Create Badge')}
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Parent Quiz Master Badge Modal (Legendary - All sub-quizzes 90%+)
const ParentQuizMasterBadgeModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  targetQuiz,
  existingBadge
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (badge: Badge) => void;
  targetQuiz: Quiz | null;
  existingBadge?: Badge;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetQuiz) {
      if (existingBadge) {
        setName(existingBadge.name);
        setDescription(existingBadge.description);
        setImagePreview(existingBadge.image);
      } else {
        setName(`${targetQuiz.title} Master`);
        setDescription(`Master all quizzes in ${targetQuiz.title} with Gold or Perfect scores (90%+)`);
      }
    }
  }, [isOpen, targetQuiz, existingBadge]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !imagePreview || !targetQuiz) {
      return alert('Please fill in all required fields and select an image');
    }
    
    setLoading(true);
    try {
      const badgeData = {
        ...(existingBadge?.id && { id: existingBadge.id }),
        name: name.trim(),
        description: description.trim(),
        image: imagePreview,
        category: targetQuiz.title,
        rarity: 'Legendary' as const,
        triggerType: 'parent_quiz_mastery' as const,
        triggerValue: targetQuiz.id,
        xpValue: 100, // ADD THIS LINE
      };
      
      const method = existingBadge ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/badges', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badgeData),
      });

      if (!response.ok) throw new Error('Failed to save badge');

      const savedBadge = await response.json();
      onSave(savedBadge);
      onClose();
      alert(`Parent quiz master badge ${existingBadge ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('Error saving badge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !targetQuiz) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {existingBadge ? 'Edit' : 'Create'} Parent Quiz Master Badge
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Legendary Badge:</strong> Awarded when users achieve 90%+ on ALL sub-quizzes in this category
            </p>
          </div>

          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-800 font-medium mb-2">
              Sub-quizzes that must be mastered:
            </p>
            {targetQuiz.children && targetQuiz.children.length > 0 ? (
              <ul className="text-xs text-purple-700 space-y-1">
                {targetQuiz.children.map((child, index) => (
                  <li key={child.id}>
                    {index + 1}. {child.title} ({child.questions.length} questions)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-purple-700">No sub-quizzes yet</p>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Badge Name *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Cybersecurity Master"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg h-20 focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what this badge represents..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Rarity</label>
              <input 
                type="text" 
                value="Legendary"
                disabled
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Rarity is fixed for parent quiz master badges</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Badge Image *</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="w-full border border-gray-300 p-3 rounded-lg"
              />
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (existingBadge ? 'Updating...' : 'Creating...') : (existingBadge ? 'Update Badge' : 'Create Badge')}
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Parent Quiz Creation Modal
const ParentQuizModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (parentQuiz: { title: string }) => void;
}) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      return alert('Please enter a parent quiz title');
    }
    
    setLoading(true);
    try {
      await onSave({
        title: title.trim()
      });
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Error saving parent quiz:', error);
      alert('Error saving parent quiz');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Create Parent Quiz Category</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Parent quizzes are containers that group related sub-quizzes together. They don't contain questions themselves.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Cybersecurity Fundamentals, Crime Prevention Basics"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Parent Quiz'}
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => 
  isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Quiz Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        {children}
      </div>
    </div>
  ) : null;

// Updated Quiz Card with Badge Indicators
const QuizCard = ({ 
  quiz, 
  onView, 
  onDelete,
  onAddSubQuiz,
  badges,
  onManageSubQuizBadge,
  onManageParentBadge,
  level = 0,
  showAsStandalone = false
}: { 
  quiz: Quiz; 
  onView: (quiz: Quiz) => void; 
  onDelete: (quizId: string) => void;
  onAddSubQuiz?: (parentQuiz: Quiz) => void;
  badges: Badge[];
  onManageSubQuizBadge: (quiz: Quiz) => void;
  onManageParentBadge: (quiz: Quiz) => void;
  level?: number;
  showAsStandalone?: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const uniqueLessons = quiz.isParent ? [] : [...new Set(quiz.questions.map(q => q.lesson))];
  
  // Get badges for this quiz
  const subQuizBadge = !quiz.isParent ? badges.find(badge => 
    badge.triggerType === 'quiz_mastery' && badge.triggerValue === quiz.id
  ) : null;

  const parentQuizBadge = quiz.isParent ? badges.find(badge => 
    badge.triggerType === 'parent_quiz_mastery' && badge.triggerValue === quiz.id
  ) : null;

  const canCreateParentBadge = quiz.isParent && (quiz.children?.length || 0) > 0;

  const cardWidth = level === 0 ? 'w-80' : 'w-72';
  const cardMargin = level > 0 ? 'ml-8 mt-4' : '';

  return (
    <>
      <div className={`bg-white rounded-lg shadow border overflow-hidden ${cardWidth} ${cardMargin}`}>
        <div className={`h-48 flex items-center justify-center ${
          quiz.isParent 
            ? 'bg-gradient-to-br from-purple-50 to-purple-100' 
            : showAsStandalone
            ? 'bg-gradient-to-br from-orange-50 to-orange-100'
            : 'bg-gradient-to-br from-blue-50 to-indigo-100'
        }`}>
          <div className="text-center">
            <div className={`text-4xl mb-2 ${
              quiz.isParent 
                ? 'text-purple-500' 
                : showAsStandalone 
                ? 'text-orange-500'
                : 'text-indigo-500'
            }`}>
              {quiz.isParent ? '📂' : showAsStandalone ? '📝' : '🧠'}
            </div>
            <div className={`text-xs px-2 py-1 rounded ${
              quiz.isParent 
                ? 'bg-purple-100 text-purple-800' 
                : showAsStandalone
                ? 'bg-orange-100 text-orange-800'
                : 'bg-indigo-100 text-indigo-800'
            }`}>
              {quiz.isParent ? 'PARENT CATEGORY' : showAsStandalone ? 'STANDALONE QUIZ' : 'SUB QUIZ'}
            </div>
            {showAsStandalone && (
              <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-1">
                NOT IN CATEGORY
              </div>
            )}
            {quiz.subjectDomain && (
              <div className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded mt-1">
                {quiz.subjectDomain.replace('_', ' ').toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg flex-1">{quiz.title}</h3>
            {quiz.isParent && quiz.children && quiz.children.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <svg 
                  className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600 mb-3">
            {quiz.isParent ? (
              <>
                <div>📁 {quiz.children?.length || 0} sub-quizzes</div>
                <div>📚 Total questions: {quiz.children?.reduce((sum, child) => sum + child.questions.length, 0) || 0}</div>
              </>
            ) : (
              <>
                <div>📚 {uniqueLessons.length > 1 ? `${uniqueLessons.length} lessons` : uniqueLessons[0] || 'No lessons'}</div>
                <div>⏱️ {quiz.timer}s per question</div>
                <div>❓ {quiz.questions.length} questions</div>
                {quiz.skillArea && (
                  <div className="text-xs text-blue-600 mt-1">🎯 {quiz.skillArea.replace('_', ' ')}</div>
                )}
              </>
            )}
          </div>
          
          {/* Badge Indicator Section */}
          <div className="mb-4">
            {quiz.isParent ? (
              <BadgeIndicator 
                hasBadge={!!parentQuizBadge}
                badgeType="parent"
                onClick={() => onManageParentBadge(quiz)}
                disabled={!canCreateParentBadge}
                disabledReason={!canCreateParentBadge ? 'needs sub-quizzes' : ''}
              />
            ) : (
              <BadgeIndicator 
                hasBadge={!!subQuizBadge}
                badgeType="sub"
                onClick={() => onManageSubQuizBadge(quiz)}
                disabled={false}
              />
            )}
          </div>
          
          <div className="flex space-x-2">
            {quiz.isParent ? (
              <>
                <button 
                  onClick={() => onAddSubQuiz && onAddSubQuiz(quiz)} 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded font-medium transition-colors text-sm"
                >
                  Add Sub-Quiz
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium transition-colors text-sm"
                >
                  View
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium transition-colors"
              >
                View Quiz
              </button>
            )}
          </div>
        </div>
      </div>

      {quiz.isParent && isExpanded && quiz.children && (
        <div className="ml-4 mt-2 space-y-4">
          {quiz.children.map((subQuiz) => (
            <QuizCard 
              key={subQuiz.id}
              quiz={subQuiz}
              onView={onView}
              onDelete={onDelete}
              badges={badges}
              onManageSubQuizBadge={onManageSubQuizBadge}
              onManageParentBadge={onManageParentBadge}
              level={level + 1}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">{quiz.title}</h3>
          
          {quiz.isParent ? (
            <>
              <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Parent Quiz Category</h4>
                <div className="text-sm text-purple-700 space-y-1">
                  <p>Sub-quizzes: {quiz.children?.length || 0}</p>
                  <p>Total questions: {quiz.children?.reduce((sum, child) => sum + child.questions.length, 0) || 0}</p>
                  {quiz.subjectDomain && <p>Subject Domain: {quiz.subjectDomain.replace('_', ' ')}</p>}
                  {quiz.skillArea && <p>Skill Area: {quiz.skillArea.replace('_', ' ')}</p>}
                </div>
              </div>

              <div className="mb-4">
                <BadgeIndicator 
                  hasBadge={!!parentQuizBadge}
                  badgeType="parent"
                  onClick={() => { onManageParentBadge(quiz); setIsModalOpen(false); }}
                  disabled={!canCreateParentBadge}
                  disabledReason={!canCreateParentBadge ? 'needs sub-quizzes' : ''}
                />
              </div>

              {quiz.children && quiz.children.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Sub-Quizzes:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {quiz.children.map((subQuiz) => (
                      <div key={subQuiz.id} className="border rounded p-3 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{subQuiz.title}</p>
                            <p className="text-sm text-gray-600">{subQuiz.questions.length} questions</p>
                          </div>
                          <button
                            onClick={() => { onView(subQuiz); setIsModalOpen(false); }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Lessons:</strong> {uniqueLessons.join(', ')}</p>
                  <p><strong>Timer:</strong> {quiz.timer} seconds per question</p>
                  <p><strong>Questions:</strong> {quiz.questions.length}</p>
                </div>
                <div>
                  {quiz.subjectDomain && (
                    <p><strong>Subject Domain:</strong> {quiz.subjectDomain.replace('_', ' ')}</p>
                  )}
                  {quiz.skillArea && (
                    <p><strong>Skill Area:</strong> {quiz.skillArea.replace('_', ' ')}</p>
                  )}
                  {quiz.parentId ? (
                    <p><strong>Parent Category:</strong> Yes</p>
                  ) : (
                    <p><strong>Status:</strong> <span className="text-orange-600 font-medium">Standalone (not in category)</span></p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <BadgeIndicator 
                  hasBadge={!!subQuizBadge}
                  badgeType="sub"
                  onClick={() => { onManageSubQuizBadge(quiz); setIsModalOpen(false); }}
                  disabled={false}
                />
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Questions Preview:</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {quiz.questions.slice(0, 3).map((q, index) => (
                    <div key={q.id} className="border rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">{index + 1}. {q.question}</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{q.lesson}</span>
                      </div>
                      <div className="text-sm space-y-1">
                        {q.options.map((option, optIndex) => (
                          <div key={optIndex} className={`${optIndex === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                            {String.fromCharCode(65 + optIndex)}. {option} {optIndex === q.correctAnswer && <span className="text-green-600">✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {quiz.questions.length > 3 && (
                    <p className="text-gray-500 text-center">... and {quiz.questions.length - 3} more questions</p>
                  )}
                </div>
              </div>
            </>
          )}
          
          <div className="flex space-x-3">
            {!quiz.isParent && (
              <button onClick={() => { onView(quiz); setIsModalOpen(false); }} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
                Edit Quiz
              </button>
            )}
            <button onClick={() => { 
              if (confirm(`Are you sure you want to delete "${quiz.title}"${quiz.isParent ? ' and all its sub-quizzes' : ''}?`)) { 
                onDelete(quiz.id); 
                setIsModalOpen(false); 
              } 
            }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors">
              Delete {quiz.isParent ? 'Category' : 'Quiz'}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const FormField = ({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
    {children}
  </div>
);

const QuestionForm = ({ question, onSave, onCancel, questionNumber }: { 
  question?: Question; 
  onSave: (question: Question) => void; 
  onCancel: () => void; 
  questionNumber: number;
}) => {
  const [questionText, setQuestionText] = useState(question?.question || '');
  const [lesson, setLesson] = useState(question?.lesson || '');
  const [options, setOptions] = useState(question?.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || 0);
  const [explanation, setExplanation] = useState(question?.explanation || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(question?.image || '');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!questionText.trim()) return alert('Please enter a question');
    if (!lesson.trim()) return alert('Please enter a lesson');
    if (options.some(opt => !opt.trim())) return alert('Please fill all options');
    
    onSave({
      id: question?.id || Date.now().toString(),
      question: questionText.trim(),
      lesson: lesson.trim(),
      image: imagePreview,
      options: options.map(opt => opt.trim()),
      correctAnswer,
      explanation: explanation.trim()
    });
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-gray-50">
      <h4 className="font-semibold mb-4">Question {questionNumber}</h4>
      
      <FormField label="Question" required>
        <textarea 
          value={questionText} 
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question here..."
          className="w-full border border-gray-300 p-2 rounded h-20 resize-none"
        />
      </FormField>
      
      <FormField label="Lesson" required>
        <input 
          type="text"
          value={lesson} 
          onChange={(e) => setLesson(e.target.value)}
          placeholder="Enter lesson name (e.g., Crime Prevention, Cyber Security, etc.)"
          className="w-full border border-gray-300 p-2 rounded"
        />
      </FormField>
      
      <FormField label="Question Image (Optional)">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange}
          className="w-full border border-gray-300 p-2 rounded"
        />
        {imagePreview && (
          <img src={imagePreview} alt="Question Preview" className="mt-2 w-32 h-20 object-cover rounded border" />
        )}
      </FormField>
      
      <FormField label="Options" required>
        {options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="radio"
              name={`correct-${questionNumber}`}
              checked={correctAnswer === index}
              onChange={() => setCorrectAnswer(index)}
              className="mr-2"
            />
            <span className="mr-2 font-medium">{String.fromCharCode(65 + index)}.</span>
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              className="flex-1 border border-gray-300 p-2 rounded"
            />
            {correctAnswer === index && <span className="ml-2 text-green-600 font-medium">✓ Correct</span>}
          </div>
        ))}
      </FormField>
      
      <FormField label="Explanation (Optional)">
        <textarea 
          value={explanation} 
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain why this is the correct answer..."
          className="w-full border border-gray-300 p-2 rounded h-16 resize-none"
        />
      </FormField>
      
      <div className="flex space-x-2">
        <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm">
          Save Question
        </button>
        <button onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
};

const AddQuizForm = ({ 
  onClose, 
  onSave, 
  initialQuiz,
  parentQuizzes,
  selectedParent 
}: { 
  onClose: () => void; 
  onSave: (quiz: Quiz) => void; 
  initialQuiz?: Quiz;
  parentQuizzes: Quiz[];
  selectedParent?: Quiz;
}) => {
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [timer, setTimer] = useState(initialQuiz?.timer || 30);
  const [parentId, setParentId] = useState(initialQuiz?.parentId || selectedParent?.id || '');
  const [questions, setQuestions] = useState<Question[]>(initialQuiz?.questions || []);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSaveQuestion = (question: Question) => {
    if (editingIndex !== null) {
      const newQuestions = [...questions];
      newQuestions[editingIndex] = question;
      setQuestions(newQuestions);
      setEditingIndex(null);
      setEditingQuestion(null);
    } else {
      setQuestions([...questions, question]);
    }
    setShowAddQuestion(false);
  };

  const handleEditQuestion = (question: Question, index: number) => {
    setEditingQuestion(question);
    setEditingIndex(index);
    setShowAddQuestion(true);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSaveQuiz = async () => {
    if (!title.trim() || questions.length === 0) {
      return alert('Please fill in the quiz title and add at least one question');
    }
    
    setLoading(true);
    
    try {
      const quizData = {
        title: title.trim(),
        timer,
        parentId: parentId || null,
        isParent: false,
        questions
      };
      
      const response = await fetch(
        initialQuiz ? `/api/admin/quizzes/${initialQuiz.id}` : '/api/admin/quizzes',
        {
          method: initialQuiz ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quizData),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to save quiz');
      }
      
      const savedQuiz = await response.json();
      onSave(savedQuiz);
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialQuiz ? 'Edit Sub-Quiz' : 'Add New Sub-Quiz'}
      </h3>
      
      {selectedParent && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            Adding sub-quiz to: <strong>{selectedParent.title}</strong>
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormField label="Sub-Quiz Title" required>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Password Security Quiz, Phishing Prevention Quiz"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </FormField>
        
        <FormField label="Timer per Question (seconds)">
          <input 
            type="number" 
            value={timer} 
            onChange={(e) => setTimer(Number(e.target.value))}
            min="10"
            max="300"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </FormField>

        {!selectedParent && (
          <FormField label="Parent Category (Optional)">
            <select 
              value={parentId} 
              onChange={(e) => setParentId(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="">Select parent category</option>
              {parentQuizzes.filter(p => p.isParent).map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.title}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {/* REMOVED Subject Domain and Skill Area fields */}
      </div>
      
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Badge System:</strong> After creating this quiz, you can create a mastery badge that is automatically awarded when users score 90% or higher (Epic rarity).
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold">Questions ({questions.length})</h4>
          <button 
            onClick={() => setShowAddQuestion(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
          >
            + Add Question
          </button>
        </div>
        
        {questions.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center text-gray-500">
            No questions added yet. Add at least one question to create the quiz.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{index + 1}. {question.question}</p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">{question.lesson}</span>
                    </div>
                    {question.image && (
                      <img src={question.image} alt="Question" className="w-32 h-20 object-cover rounded border mb-2" />
                    )}
                    <div className="text-sm space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className={`${optIndex === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                          {String.fromCharCode(65 + optIndex)}. {option} {optIndex === question.correctAnswer && <span className="text-green-600">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button 
                      onClick={() => handleEditQuestion(question, index)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteQuestion(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showAddQuestion && (
        <QuestionForm 
          question={editingQuestion || undefined}
          onSave={handleSaveQuestion}
          onCancel={() => { setShowAddQuestion(false); setEditingQuestion(null); setEditingIndex(null); }}
          questionNumber={editingIndex !== null ? editingIndex + 1 : questions.length + 1}
        />
      )}
      
      <div className="flex space-x-3">
        <button 
          onClick={handleSaveQuiz} 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Saving...' : (initialQuiz ? 'Update Sub-Quiz' : 'Save Sub-Quiz')}
        </button>
        <button 
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedParent, setSelectedParent] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  // NEW: Badge modal states
  const [showSubQuizBadgeModal, setShowSubQuizBadgeModal] = useState(false);
  const [showParentQuizBadgeModal, setShowParentQuizBadgeModal] = useState(false);
  const [selectedQuizForBadge, setSelectedQuizForBadge] = useState<Quiz | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const quizzesResponse = await fetch('/api/admin/quizzes');
      if (quizzesResponse.ok) {
        const data = await quizzesResponse.json();
        setQuizzes(data);
      }

      const badgesResponse = await fetch('/api/admin/badges');
      if (badgesResponse.ok) {
        const data = await badgesResponse.json();
        setBadges(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
        setBadges(badges.filter(badge => badge.triggerValue !== quizId));
      } else {
        alert('Failed to delete quiz');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  const handleSaveQuiz = (savedQuiz: Quiz) => {
    if (editingQuiz) {
      setQuizzes(quizzes.map(quiz => quiz.id === savedQuiz.id ? savedQuiz : quiz));
      setEditingQuiz(null);
    } else {
      setQuizzes([savedQuiz, ...quizzes]);
    }
    setShowAddQuiz(false);
    setSelectedParent(null);
    fetchData();
  };

  const handleSaveParentQuiz = async (parentData: { title: string }) => {
    try {
      const response = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: parentData.title,
          isParent: true,
          timer: 30
          // Removed: subjectDomain and skillArea
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create parent quiz');
      }
      
      const savedParent = await response.json();
      setQuizzes([savedParent, ...quizzes]);
      setShowParentModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving parent quiz:', error);
      throw error;
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowAddQuiz(true);
  };

  const handleCloseForm = () => {
    setShowAddQuiz(false);
    setEditingQuiz(null);
    setSelectedParent(null);
  };

  const handleAddSubQuiz = (parentQuiz: Quiz) => {
    setSelectedParent(parentQuiz);
    setShowAddQuiz(true);
  };

  // NEW: Sub-quiz badge management
  const handleManageSubQuizBadge = (quiz: Quiz) => {
    if (quiz.isParent) {
      alert('This function is for sub-quizzes only.');
      return;
    }
    setSelectedQuizForBadge(quiz);
    setShowSubQuizBadgeModal(true);
  };

  // NEW: Parent quiz badge management
  const handleManageParentBadge = (quiz: Quiz) => {
    if (!quiz.isParent) {
      alert('This function is for parent quizzes only.');
      return;
    }
    if (!quiz.children || quiz.children.length === 0) {
      alert('Please add sub-quizzes first before creating a master badge.');
      return;
    }
    setSelectedQuizForBadge(quiz);
    setShowParentQuizBadgeModal(true);
  };

  // NEW: Save badge handler
  const handleSaveBadge = (savedBadge: Badge) => {
    const existingIndex = badges.findIndex(b => b.id === savedBadge.id);
    if (existingIndex >= 0) {
      setBadges(badges.map((b, i) => i === existingIndex ? savedBadge : b));
    } else {
      setBadges([...badges, savedBadge]);
    }
    
    setShowSubQuizBadgeModal(false);
    setShowParentQuizBadgeModal(false);
    setSelectedQuizForBadge(null);
  };

  // Helper functions to get badges
  const getSubQuizBadge = (quizId: string) => {
    return badges.find(badge => 
      badge.triggerType === 'quiz_mastery' && badge.triggerValue === quizId
    );
  };

  const getParentQuizBadge = (quizId: string) => {
    return badges.find(badge => 
      badge.triggerType === 'parent_quiz_mastery' && badge.triggerValue === quizId
    );
  };

  const parentQuizzes = quizzes.filter(quiz => quiz.isParent);
  const standaloneSubQuizzes = quizzes.filter(quiz => !quiz.isParent && !quiz.parentId);
  
  const quizHierarchy = parentQuizzes.map(parentQuiz => ({
    ...parentQuiz,
    children: quizzes.filter(q => q.parentId === parentQuiz.id)
  }));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quiz Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            Create parent categories and sub-quizzes with automatic mastery badge system.
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowParentModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Category</span>
          </button>
          <button 
            onClick={() => setShowAddQuiz(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Sub-Quiz</span>
          </button>
        </div>
      </div>

      {showAddQuiz && (
        <AddQuizForm 
          onClose={handleCloseForm}
          onSave={handleSaveQuiz}
          initialQuiz={editingQuiz || undefined}
          parentQuizzes={quizzes}
          selectedParent={selectedParent || undefined}
        />
      )}

      <ParentQuizModal 
        isOpen={showParentModal}
        onClose={() => setShowParentModal(false)}
        onSave={handleSaveParentQuiz}
      />

      {/* NEW: Sub-Quiz Mastery Badge Modal */}
      <SubQuizMasteryBadgeModal 
        isOpen={showSubQuizBadgeModal}
        onClose={() => {
          setShowSubQuizBadgeModal(false);
          setSelectedQuizForBadge(null);
        }}
        onSave={handleSaveBadge}
        targetQuiz={selectedQuizForBadge}
        existingBadge={selectedQuizForBadge ? getSubQuizBadge(selectedQuizForBadge.id) : undefined}
        parentQuiz={selectedQuizForBadge?.parentId ? quizzes.find(q => q.id === selectedQuizForBadge.parentId) : undefined}
      />

      {/* NEW: Parent Quiz Master Badge Modal */}
      <ParentQuizMasterBadgeModal 
        isOpen={showParentQuizBadgeModal}
        onClose={() => {
          setShowParentQuizBadgeModal(false);
          setSelectedQuizForBadge(null);
        }}
        onSave={handleSaveBadge}
        targetQuiz={selectedQuizForBadge}
        existingBadge={selectedQuizForBadge ? getParentQuizBadge(selectedQuizForBadge.id) : undefined}
      />

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Quiz Categories & Sub-Quizzes</h2>
        </div>
        <div className="p-6">
          {quizHierarchy.length === 0 && standaloneSubQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📂</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes created yet</h3>
              <p className="text-gray-600 mb-6">Create your first parent category or standalone quiz</p>
              <div className="flex justify-center space-x-3">
                <button 
                  onClick={() => setShowParentModal(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded"
                >
                  Create Category
                </button>
                <button 
                  onClick={() => setShowAddQuiz(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
                >
                  Create Sub-Quiz
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-6">
                {quizHierarchy.map((quiz) => (
                  <QuizCard 
                    key={quiz.id} 
                    quiz={quiz} 
                    onView={handleEditQuiz}
                    onDelete={handleDeleteQuiz}
                    onAddSubQuiz={handleAddSubQuiz}
                    badges={badges}
                    onManageSubQuizBadge={handleManageSubQuizBadge}
                    onManageParentBadge={handleManageParentBadge}
                  />
                ))}

                {standaloneSubQuizzes.length > 0 && (
                  <>
                    <div className="border-t pt-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Standalone Sub-Quizzes</h3>
                        <p className="text-sm text-yellow-700">
                          These sub-quizzes are not assigned to any parent category. Consider organizing them under appropriate categories for better user experience.
                        </p>
                      </div>
                      
                      {standaloneSubQuizzes.map((quiz) => (
                        <QuizCard 
                          key={quiz.id} 
                          quiz={quiz} 
                          onView={handleEditQuiz}
                          onDelete={handleDeleteQuiz}
                          badges={badges}
                          onManageSubQuizBadge={handleManageSubQuizBadge}
                          onManageParentBadge={handleManageParentBadge}
                          showAsStandalone={true}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Quiz Badge System Guide</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• <strong>Parent Categories:</strong> Organize related quizzes under meaningful categories</p>
                  <p>• <strong>Sub-Quiz Mastery Badges (Epic):</strong> Create badges awarded when users score 90%+ on individual quizzes</p>
                  <p>• <strong>Parent Master Badges (Legendary):</strong> Create ultimate badges awarded when users master ALL sub-quizzes in a category</p>
                  <p>• <strong>Badge Creation:</strong> Click the orange "Create Badge" button on any quiz card to set up mastery rewards</p>
                  <p>• <strong>Requirements:</strong> Parent master badges require at least 1 sub-quiz to be created first</p>
                  <p>• <strong>Auto-Award:</strong> All badges are automatically awarded based on user performance - no manual intervention needed</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}