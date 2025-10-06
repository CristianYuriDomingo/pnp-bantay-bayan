'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Award, Plus, Edit2, Trash2, AlertCircle, CheckCircle, Info, X, RefreshCw, Image as ImageIcon } from 'lucide-react';

// Types
interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  xpValue: number;
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_mastery' | 'parent_quiz_mastery' | 'manual';
  triggerValue: string;
  prerequisites?: string[];
  masteryLevel?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Module {
  id: string;
  title: string;
  image: string;
  lessonCount?: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  tips?: any[];
  module?: {
    id: string;
    title: string;
  };
}

interface Quiz {
  id: string;
  title: string;
  timer: number;
}

interface OrphanedBadge {
  id: string;
  name: string;
  triggerValue: string;
  type: string;
  reason: string;
}

// Toast Component
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-in slide-in-from-top ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`}>
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-4 hover:opacity-80">
      <X className="w-4 h-4" />
    </button>
  </div>
);

// Modal Component
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'lg'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title?: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Rarity Badge Component
const RarityBadge = ({ rarity, xpValue }: { rarity: string; xpValue: number }) => {
  const colors = {
    Common: 'bg-gray-100 text-gray-700 border-gray-300',
    Rare: 'bg-blue-100 text-blue-700 border-blue-300',
    Epic: 'bg-purple-100 text-purple-700 border-purple-300',
    Legendary: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${colors[rarity as keyof typeof colors] || colors.Common}`}>
      <span className="font-semibold text-sm">{rarity}</span>
      <span className="text-xs opacity-75">•</span>
      <span className="text-sm">{xpValue} XP</span>
    </div>
  );
};

// Badge Card Component
const BadgeCard = ({ 
  badge, 
  modules, 
  lessons,
  quizzes,
  onEdit, 
  onDelete,
  isHighlighted = false,
  isOrphaned = false
}: { 
  badge: Badge; 
  modules: Module[]; 
  lessons: Lesson[];
  quizzes: Quiz[];
  onEdit: (badge: Badge) => void; 
  onDelete: (badgeId: string) => void; 
  isHighlighted?: boolean;
  isOrphaned?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);

  const getTriggerDescription = () => {
    switch (badge.triggerType) {
      case 'module_complete':
        const module = modules.find(m => m.id === badge.triggerValue);
        return {
          icon: '📚',
          text: module?.title || 'Unknown Module',
          subtitle: 'Complete all lessons'
        };
      case 'lesson_complete':
        const lesson = lessons.find(l => l.id === badge.triggerValue);
        return {
          icon: '📖',
          text: lesson?.title || 'Unknown Lesson',
          subtitle: lesson?.module ? `${lesson.module.title} module` : 'Complete lesson'
        };
      case 'quiz_mastery':
        const quiz = quizzes.find(q => q.id === badge.triggerValue);
        return {
          icon: '🎯',
          text: quiz?.title || 'Unknown Quiz',
          subtitle: 'Achieve 90%+ mastery'
        };
      case 'parent_quiz_mastery':
        const parentQuiz = quizzes.find(q => q.id === badge.triggerValue);
        return {
          icon: '🏆',
          text: parentQuiz?.title || 'Unknown Category',
          subtitle: 'Master all sub-quizzes (90%+)'
        };
      case 'manual':
        return {
          icon: '👤',
          text: 'Manual Award',
          subtitle: 'Admin granted'
        };
      default:
        return {
          icon: '❓',
          text: 'Unknown',
          subtitle: ''
        };
    }
  };

  const trigger = getTriggerDescription();

  return (
    <div className={`bg-white rounded-xl border-2 hover:shadow-lg transition-all duration-200 overflow-hidden ${
      isHighlighted ? 'border-blue-500 ring-2 ring-blue-200' : isOrphaned ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {!imageError ? (
              <img 
                src={badge.image} 
                alt={badge.name} 
                className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200" 
                onError={() => setImageError(true)} 
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-gray-200">
                <Award className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg text-gray-900">{badge.name}</h3>
              <div className="flex space-x-2 ml-4">
                <button 
                  onClick={() => onEdit(badge)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                  title="Edit badge"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Delete "${badge.name}"? This cannot be undone.`)) {
                      onDelete(badge.id);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete badge"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
            
            <div className="mb-3">
              <RarityBadge rarity={badge.rarity} xpValue={badge.xpValue} />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{trigger.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{trigger.text}</p>
                  <p className="text-xs text-gray-600">{trigger.subtitle}</p>
                </div>
              </div>
            </div>

            {(isHighlighted || isOrphaned) && (
              <div className="mt-3">
                {isHighlighted && (
                  <span className="inline-flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    <Info className="w-3 h-3" />
                    <span>Selected from Content Management</span>
                  </span>
                )}
                {isOrphaned && (
                  <span className="inline-flex items-center space-x-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    <span>Orphaned - Content deleted</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Badge Form Modal
const BadgeFormModal = ({ 
  isOpen,
  onClose, 
  onSave, 
  modules, 
  lessons,
  quizzes,
  badges, 
  initialBadge,
  preselectedLessonId
}: { 
  isOpen: boolean;
  onClose: () => void; 
  onSave: (badge: Badge) => Promise<void>; 
  modules: Module[]; 
  lessons: Lesson[];
  quizzes: Quiz[];
  badges: Badge[]; 
  initialBadge?: Badge;
  preselectedLessonId?: string;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [rarity, setRarity] = useState<Badge['rarity']>('Common');
  const [triggerType, setTriggerType] = useState<Badge['triggerType']>('module_complete');
  const [triggerValue, setTriggerValue] = useState('');
  const [xpValue, setXpValue] = useState(10);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialBadge) {
        setName(initialBadge.name);
        setDescription(initialBadge.description);
        setCategory(initialBadge.category);
        setRarity(initialBadge.rarity);
        setTriggerType(initialBadge.triggerType);
        setTriggerValue(initialBadge.triggerValue);
        setXpValue(initialBadge.xpValue);
        setImagePreview(initialBadge.image);
      } else if (preselectedLessonId) {
        const selectedLesson = lessons.find(l => l.id === preselectedLessonId);
        if (selectedLesson) {
          const tipCount = selectedLesson.tips?.length || 0;
          const calculatedRarity = tipCount >= 1 && tipCount <= 3 ? 'Common' : 'Rare';
          const calculatedXP = calculatedRarity === 'Common' ? 10 : 25;

          setName(`${selectedLesson.title} Reader`);
          setDescription(`Completed the ${selectedLesson.title} lesson`);
          setCategory('Lesson Completion');
          setRarity(calculatedRarity);
          setXpValue(calculatedXP);
          setTriggerType('lesson_complete');
          setTriggerValue(preselectedLessonId);
        }
      } else {
        setName('');
        setDescription('');
        setCategory('');
        setRarity('Common');
        setTriggerType('module_complete');
        setTriggerValue('');
        setXpValue(10);
        setImagePreview('');
      }
    }
  }, [isOpen, initialBadge, preselectedLessonId, lessons]);

  useEffect(() => {
    if (!initialBadge && isOpen) {
      if (triggerType === 'module_complete') {
        setRarity('Epic');
        setXpValue(50);
      } else if (triggerType === 'quiz_mastery') {
        setRarity('Epic');
        setXpValue(50);
      } else if (triggerType === 'parent_quiz_mastery') {
        setRarity('Legendary');
        setXpValue(100);
      }
    }
  }, [triggerType, initialBadge, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !category.trim() || !triggerValue.trim() || (!imagePreview && !initialBadge)) {
      alert('Please fill in all required fields and select an image');
      return;
    }
    
    setLoading(true);
    try {
      const badgeData = {
        id: initialBadge?.id,
        name: name.trim(),
        description: description.trim(),
        image: imagePreview,
        category: category.trim(),
        rarity,
        xpValue,
        triggerType,
        triggerValue: triggerValue.trim(),
      };
      
      await onSave(badgeData as Badge);
      onClose();
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('Error saving badge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set([
    ...modules.map(m => m.title), 
    'General', 
    'Quiz Mastery', 
    'Performance',
    'Lesson Completion'
  ]));

  const isAutoCalculated = !initialBadge && (
    (triggerType === 'lesson_complete' && preselectedLessonId) ||
    triggerType === 'module_complete' ||
    triggerType === 'quiz_mastery' ||
    triggerType === 'parent_quiz_mastery'
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialBadge ? 'Edit Badge' : 'Create New Badge'} size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badge Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g., Cybersecurity Expert" 
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea 
              placeholder="What this badge represents..." 
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badge Image <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden"
                id="badge-image-input"
              />
              <label htmlFor="badge-image-input" className="cursor-pointer">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl mx-auto border-2 border-gray-200" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload image</span>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Award Trigger <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={triggerType} 
              onChange={(e) => {
                setTriggerType(e.target.value as Badge['triggerType']);
                if (!preselectedLessonId) setTriggerValue('');
              }}
              disabled={!!preselectedLessonId && !initialBadge}
            >
              <option value="module_complete">Complete Module</option>
              <option value="lesson_complete">Complete Lesson</option>
              <option value="quiz_mastery">Quiz Mastery (90%+)</option>
              <option value="parent_quiz_mastery">Category Mastery</option>
              <option value="manual">Manual Award</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Content <span className="text-red-500">*</span>
            </label>
            {triggerType === 'module_complete' ? (
              <select 
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={triggerValue} 
                onChange={(e) => setTriggerValue(e.target.value)}
              >
                <option value="">Select Module</option>
                {modules.map(module => (
                  <option key={module.id} value={module.id}>{module.title}</option>
                ))}
              </select>
            ) : triggerType === 'lesson_complete' ? (
              <select 
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={triggerValue} 
                onChange={(e) => setTriggerValue(e.target.value)}
                disabled={!!preselectedLessonId && !initialBadge}
              >
                <option value="">Select Lesson</option>
                {lessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} {lesson.module ? `(${lesson.module.title})` : ''}
                  </option>
                ))}
              </select>
            ) : ['quiz_mastery', 'parent_quiz_mastery'].includes(triggerType) ? (
              <select 
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={triggerValue} 
                onChange={(e) => setTriggerValue(e.target.value)}
              >
                <option value="">Select Quiz</option>
                {quizzes.map(quiz => (
                  <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                ))}
              </select>
            ) : (
              <input 
                type="text" 
                placeholder="Manual award identifier" 
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={triggerValue}
                onChange={(e) => setTriggerValue(e.target.value)}
              />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rarity & XP Value
            </label>
            {isAutoCalculated ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <RarityBadge rarity={rarity} xpValue={xpValue} />
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-blue-700">
                  {triggerType === 'lesson_complete' && preselectedLessonId
                    ? 'Auto-calculated based on lesson tips'
                    : 'Auto-assigned for this trigger type'}
                </p>
              </div>
            ) : (
              <select 
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={rarity} 
                onChange={(e) => {
                  const newRarity = e.target.value as Badge['rarity'];
                  setRarity(newRarity);
                  if (newRarity === 'Common') setXpValue(10);
                  else if (newRarity === 'Rare') setXpValue(25);
                  else if (newRarity === 'Epic') setXpValue(50);
                  else if (newRarity === 'Legendary') setXpValue(100);
                }}
              >
                <option value="Common">Common (10 XP)</option>
                <option value="Rare">Rare (25 XP)</option>
                <option value="Epic">Epic (50 XP)</option>
                <option value="Legendary">Legendary (100 XP)</option>
              </select>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Badge Rules</span>
            </h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Module badges: Epic (50 XP)</li>
              <li>• Lesson badges: Auto-calculated by tips</li>
              <li>• Quiz mastery: Epic (50 XP)</li>
              <li>• Category mastery: Legendary (100 XP)</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex space-x-3 pt-6 border-t">
        <button 
          onClick={handleSave} 
          disabled={loading} 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (initialBadge ? 'Updating...' : 'Creating...') : (initialBadge ? 'Update Badge' : 'Create Badge')}
        </button>
        <button 
          onClick={onClose} 
          className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

// Main Component
export default function BadgeManagementPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showAddBadge, setShowAddBadge] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterRarity, setFilterRarity] = useState<string>('');
  const [orphanedBadges, setOrphanedBadges] = useState<OrphanedBadge[]>([]);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const searchParams = useSearchParams();
  const preselectedLessonId = searchParams.get('lessonId');

  useEffect(() => {
    if (preselectedLessonId && !showAddBadge && !editingBadge) {
      setShowAddBadge(true);
    }
  }, [preselectedLessonId, showAddBadge, editingBadge]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [modulesRes, lessonsRes, quizzesRes, badgesRes] = await Promise.all([
        fetch('/api/admin/modules'),
        fetch('/api/admin/lessons'),
        fetch('/api/admin/quizzes'),
        fetch('/api/admin/badges')
      ]);

      if (modulesRes.ok) setModules(await modulesRes.json());
      if (lessonsRes.ok) setLessons(await lessonsRes.json());
      if (quizzesRes.ok) setQuizzes(await quizzesRes.json());
      if (badgesRes.ok) setBadges(await badgesRes.json());

      await checkOrphanedBadges();
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error loading data. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkOrphanedBadges = async () => {
    try {
      setCleanupLoading(true);
      const response = await fetch('/api/admin/badges/cleanup');
      if (response.ok) {
        const data = await response.json();
        const orphaned = data.orphanedBadges || [];
        setOrphanedBadges(orphaned);
        
        if (orphaned.length > 0) {
          showToast(`Found ${orphaned.length} orphaned badge${orphaned.length !== 1 ? 's' : ''}. Click "Clean Up" to remove.`, 'error');
        }
      }
    } catch (error) {
      console.error('Error checking orphaned badges:', error);
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleCleanupOrphanedBadges = async () => {
    if (!confirm(`Delete ${orphanedBadges.length} orphaned badge${orphanedBadges.length !== 1 ? 's' : ''}? This cannot be undone.`)) {
      return;
    }

    try {
      setCleanupLoading(true);
      const response = await fetch('/api/admin/badges/cleanup', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        showToast(data.message);
        
        const badgesResponse = await fetch('/api/admin/badges');
        if (badgesResponse.ok) {
          setBadges(await badgesResponse.json());
        }
        
        await checkOrphanedBadges();
      } else {
        const errorData = await response.json();
        showToast(`Error: ${errorData.error}`, 'error');
      }
    } catch (error) {
      console.error('Error cleaning up badges:', error);
      showToast('Error cleaning up badges', 'error');
    } finally {
      setCleanupLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSaveBadge = async (badgeData: Badge) => {
    try {
      const isEditing = !!badgeData.id;
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch('/api/admin/badges', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(badgeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save badge');
      }

      const savedBadge = await response.json();

      if (isEditing) {
        setBadges(badges.map(badge => badge.id === savedBadge.id ? savedBadge : badge));
        setEditingBadge(null);
      } else {
        setBadges([savedBadge, ...badges]);
        setShowAddBadge(false);
      }

      await checkOrphanedBadges();
      showToast(`Badge ${isEditing ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving badge:', error);
      throw error;
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    try {
      const response = await fetch(`/api/admin/badges?id=${badgeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete badge');
      }

      setBadges(badges.filter(badge => badge.id !== badgeId));
      await checkOrphanedBadges();
      showToast('Badge deleted successfully!');
    } catch (error) {
      console.error('Error deleting badge:', error);
      showToast('Error deleting badge', 'error');
    }
  };

  const handleCloseForm = () => {
    setShowAddBadge(false);
    setEditingBadge(null);
  };

  const categories = Array.from(new Set([
    ...modules.map(m => m.title), 
    'General', 
    'Quiz Mastery', 
    'Performance',
    'Lesson Completion'
  ]));

  const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];

  const filteredBadges = badges.filter(badge => {
    const categoryMatch = !filterCategory || badge.category === filterCategory;
    const rarityMatch = !filterRarity || badge.rarity === filterRarity;
    return categoryMatch && rarityMatch;
  });

  const preselectedLessonBadge = preselectedLessonId ? badges.find(b => 
    b.triggerType === 'lesson_complete' && b.triggerValue === preselectedLessonId
  ) : null;

  const preselectedLesson = preselectedLessonId ? lessons.find(l => l.id === preselectedLessonId) : null;

  const orphanedBadgeIds = new Set(orphanedBadges.map(b => b.id));

  const badgesByCategory = filteredBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Badge Management</h1>
            <p className="text-gray-600 mt-1">Create and manage achievement badges for your learning platform</p>
            {preselectedLessonId && (
              <div className="mt-3 inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
                <Info className="w-4 h-4" />
                <span className="text-sm">
                  <strong>Selected:</strong> {preselectedLesson?.title || 'Loading...'}
                  {preselectedLessonBadge ? ' (Badge exists)' : ' (Create badge)'}
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowAddBadge(true)} 
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Create Badge</span>
          </button>
        </div>

        {orphanedBadges.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    {orphanedBadges.length} Orphaned Badge{orphanedBadges.length !== 1 ? 's' : ''} Found
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    These badges reference deleted content and should be removed
                  </p>
                  <div className="mt-2 space-y-1">
                    {orphanedBadges.slice(0, 3).map((orphan) => (
                      <p key={orphan.id} className="text-xs text-red-600">
                        • {orphan.name} - {orphan.reason}
                      </p>
                    ))}
                    {orphanedBadges.length > 3 && (
                      <p className="text-xs text-red-600">
                        • And {orphanedBadges.length - 3} more...
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={checkOrphanedBadges}
                  disabled={cleanupLoading}
                  className="inline-flex items-center space-x-1 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${cleanupLoading ? 'animate-spin' : ''}`} />
                  <span>Re-check</span>
                </button>
                <button
                  onClick={handleCleanupOrphanedBadges}
                  disabled={cleanupLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors font-medium disabled:opacity-50"
                >
                  Clean Up
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rarity</label>
              <select 
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={filterRarity} 
                onChange={(e) => setFilterRarity(e.target.value)}
              >
                <option value="">All Rarities</option>
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchData}
                className="w-full inline-flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <BadgeFormModal 
          isOpen={showAddBadge || !!editingBadge}
          onClose={handleCloseForm} 
          onSave={handleSaveBadge}
          modules={modules}
          lessons={lessons}
          quizzes={quizzes}
          badges={badges}
          initialBadge={editingBadge || undefined}
          preselectedLessonId={preselectedLessonId || undefined}
        />

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                All Badges ({filteredBadges.length})
              </h2>
              <div className="text-sm text-gray-600">
                <span className="inline-flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{badges.length} total</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <span className="text-gray-600">Loading badges...</span>
              </div>
            ) : filteredBadges.length === 0 ? (
              <div className="text-center py-16">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {badges.length === 0 ? 'No badges created yet' : 'No badges match your filters'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {badges.length === 0 ? 'Create your first achievement badge to get started' : 'Try adjusting your filter criteria'}
                </p>
                {badges.length === 0 && (
                  <button 
                    onClick={() => setShowAddBadge(true)} 
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create First Badge</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
                  <div key={category}>
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                      <span className="text-sm text-gray-500">({categoryBadges.length})</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {categoryBadges.map((badge) => (
                        <BadgeCard 
                          key={badge.id} 
                          badge={badge} 
                          modules={modules}
                          lessons={lessons}
                          quizzes={quizzes}
                          onEdit={setEditingBadge} 
                          onDelete={handleDeleteBadge}
                          isHighlighted={preselectedLessonBadge?.id === badge.id}
                          isOrphaned={orphanedBadgeIds.has(badge.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span>Badge System Guide</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p><strong>Module Badges:</strong> Epic rarity, 50 XP - Complete all lessons</p>
              <p><strong>Lesson Badges:</strong> Auto-calculated by tip count (10-25 XP)</p>
            </div>
            <div className="space-y-2">
              <p><strong>Quiz Mastery:</strong> Epic rarity, 50 XP - Score 90%+</p>
              <p><strong>Category Mastery:</strong> Legendary, 100 XP - Master all quizzes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}