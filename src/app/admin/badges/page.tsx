// app/admin/badges/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Types
interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_complete' | 'manual';
  triggerValue: string;
  prerequisites?: string[];
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
  module?: {
    id: string;
    title: string;
  };
}

interface OrphanedBadge {
  id: string;
  name: string;
  triggerValue: string;
  type: string;
  reason: string;
}

const FormField = ({ label, required = false, children }: { 
  label: string; 
  required?: boolean; 
  children: React.ReactNode 
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const CleanupWidget = ({ 
  orphanedBadges, 
  onCleanup, 
  onCheck,
  loading 
}: { 
  orphanedBadges: OrphanedBadge[];
  onCleanup: () => void;
  onCheck: () => void;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
          <span className="text-sm text-yellow-800">Checking for orphaned badges...</span>
        </div>
      </div>
    );
  }

  if (orphanedBadges.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-sm text-green-800 font-medium">No orphaned badges found</span>
          </div>
          <button
            onClick={onCheck}
            className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-xs transition-colors"
          >
            Re-check
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-red-600 mr-2">⚠️</span>
          <span className="text-sm text-red-800 font-medium">
            {orphanedBadges.length} orphaned badge{orphanedBadges.length !== 1 ? 's' : ''} found
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onCheck}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-xs transition-colors"
          >
            Re-check
          </button>
          <button
            onClick={onCleanup}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
          >
            Clean Up
          </button>
        </div>
      </div>
      
      <div className="max-h-32 overflow-y-auto">
        {orphanedBadges.map((badge) => (
          <div key={badge.id} className="text-xs text-red-700 py-1 border-b border-red-100 last:border-b-0">
            <strong>{badge.name}</strong> - {badge.reason}
          </div>
        ))}
      </div>
    </div>
  );
};

const BadgeCard = ({ 
  badge, 
  modules, 
  lessons,
  badges, 
  onEdit, 
  onDelete,
  isHighlighted = false,
  isOrphaned = false
}: { 
  badge: Badge; 
  modules: Module[]; 
  lessons: Lesson[];
  badges: Badge[];
  onEdit: (badge: Badge) => void; 
  onDelete: (badgeId: string) => void; 
  isHighlighted?: boolean;
  isOrphaned?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTriggerDescription = (badge: Badge) => {
    switch (badge.triggerType) {
      case 'module_complete':
        const module = modules.find(m => m.id === badge.triggerValue);
        return `Complete all lessons in "${module?.title || 'Unknown Module'}"`;
      case 'lesson_complete':
        const lesson = lessons.find(l => l.id === badge.triggerValue);
        if (lesson) {
          return `Complete "${lesson.title}" lesson ${lesson.module ? `(${lesson.module.title} module)` : ''}`;
        }
        const numericValue = parseInt(badge.triggerValue);
        if (!isNaN(numericValue)) {
          return `Complete ${badge.triggerValue} lessons`;
        }
        return `Complete lesson: ${badge.triggerValue}`;
      case 'quiz_complete':
        return `Successfully complete quiz with ID: ${badge.triggerValue}`;
      case 'manual':
        return 'Manually awarded by admin';
      default:
        return 'Unknown trigger';
    }
  };

  const getPrerequisiteBadges = (prerequisiteIds: string[] = []) => {
    return prerequisiteIds.map(id => badges.find(b => b.id === id)).filter(Boolean);
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
      isHighlighted ? 'ring-2 ring-blue-500' : ''
    } ${isOrphaned ? 'ring-2 ring-red-500 bg-red-50' : ''}`}>
      <div className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {!imageError ? (
              <img 
                src={badge.image} 
                alt={badge.name} 
                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200" 
                onError={() => setImageError(true)} 
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-lg border-2 border-gray-200">
                <span className="text-2xl">🏆</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 truncate">{badge.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                
                <div className="flex items-center space-x-3 mt-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRarityColor(badge.rarity)}`}>
                    {badge.rarity}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {badge.category}
                  </span>
                  {isOrphaned && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                      ⚠️ Orphaned
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Trigger:</strong> {getTriggerDescription(badge)}
                </p>
                
                {badge.prerequisites && badge.prerequisites.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    <strong>Prerequisites:</strong> {getPrerequisiteBadges(badge.prerequisites).map(b => b?.name).join(', ')}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button 
                  onClick={() => onEdit(badge)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${badge.name}"?`)) {
                      onDelete(badge.id);
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isHighlighted && (
        <div className="px-4 pb-3">
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800">
            <strong>📍 Selected Badge:</strong> This badge is linked to your selected lesson from Content Management.
          </div>
        </div>
      )}
      {isOrphaned && (
        <div className="px-4 pb-3">
          <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800">
            <strong>⚠️ Orphaned Badge:</strong> This badge references content that no longer exists and should be removed.
          </div>
        </div>
      )}
    </div>
  );
};

const AddBadgeForm = ({ 
  onClose, 
  onSave, 
  modules, 
  lessons,
  badges, 
  initialBadge,
  preselectedLessonId 
}: { 
  onClose: () => void; 
  onSave: (badge: Badge) => Promise<void>; 
  modules: Module[]; 
  lessons: Lesson[];
  badges: Badge[]; 
  initialBadge?: Badge;
  preselectedLessonId?: string;
}) => {
  const [name, setName] = useState(initialBadge?.name || '');
  const [description, setDescription] = useState(initialBadge?.description || '');
  const [category, setCategory] = useState(initialBadge?.category || '');
  const [rarity, setRarity] = useState<Badge['rarity']>(initialBadge?.rarity || 'Common');
  const [triggerType, setTriggerType] = useState<Badge['triggerType']>(initialBadge?.triggerType || (preselectedLessonId ? 'lesson_complete' : 'module_complete'));
  const [triggerValue, setTriggerValue] = useState(initialBadge?.triggerValue || preselectedLessonId || '');
  const [prerequisites, setPrerequisites] = useState<string[]>(initialBadge?.prerequisites || []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialBadge?.image || '');
  const [loading, setLoading] = useState(false);

  // Auto-populate form when lesson is preselected
  useEffect(() => {
    if (preselectedLessonId && !initialBadge) {
      const selectedLesson = lessons.find(l => l.id === preselectedLessonId);
      if (selectedLesson) {
        setName(`${selectedLesson.title} Champion`);
        setDescription(`Complete the "${selectedLesson.title}" lesson to earn this badge`);
        setCategory('Lesson Completion');
        setRarity('Common');
        setTriggerType('lesson_complete');
        setTriggerValue(preselectedLessonId);
      }
    }
  }, [preselectedLessonId, lessons, initialBadge]);

  const categories = Array.from(new Set([
    ...modules.map(m => m.title), 
    'General', 
    'Quiz Achievement', 
    'Performance',
    'Lesson Completion'
  ]));
  const availablePrerequisiteBadges = badges.filter(b => b.id !== initialBadge?.id);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !category.trim() || !triggerValue.trim() || (!imagePreview && !initialBadge)) {
      return alert('Please fill in all required fields and select an image');
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
        triggerType,
        triggerValue: triggerValue.trim(),
        prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
      };
      
      await onSave(badgeData as Badge);
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('Error saving badge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrerequisiteChange = (badgeId: string, checked: boolean) => {
    if (checked) {
      setPrerequisites([...prerequisites, badgeId]);
    } else {
      setPrerequisites(prerequisites.filter(id => id !== badgeId));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialBadge ? 'Edit Badge' : 'Add New Badge'}
        {preselectedLessonId && !initialBadge && (
          <span className="text-sm font-normal text-blue-600 ml-2">
            (Pre-selected lesson: {lessons.find(l => l.id === preselectedLessonId)?.title})
          </span>
        )}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FormField label="Badge Name" required>
            <input 
              type="text" 
              placeholder="e.g., Crime Prevention Expert" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </FormField>
          
          <FormField label="Description" required>
            <textarea 
              placeholder="What this badge represents..." 
              className="w-full border border-gray-300 p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </FormField>
          
          <FormField label="Category" required>
            <select 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </FormField>
          
          <FormField label="Rarity Level" required>
            <select 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={rarity} 
              onChange={(e) => setRarity(e.target.value as Badge['rarity'])}
            >
              <option value="Common">Common</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Epic</option>
              <option value="Legendary">Legendary</option>
            </select>
          </FormField>
        </div>
        
        <div className="space-y-4">
          <FormField label="Badge Image" required={!initialBadge}>
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
          </FormField>
          
          <FormField label="Trigger Type" required>
            <select 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={triggerType} 
              onChange={(e) => {
                setTriggerType(e.target.value as Badge['triggerType']);
                if (!preselectedLessonId) setTriggerValue('');
              }}
            >
              <option value="module_complete">Complete Module</option>
              <option value="lesson_complete">Complete Specific Lesson</option>
              <option value="quiz_complete">Complete Quiz</option>
              <option value="manual">Manual Award</option>
            </select>
          </FormField>
          
          <FormField label="Trigger Value" required>
            {triggerType === 'module_complete' ? (
              <select 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={triggerValue} 
                onChange={(e) => setTriggerValue(e.target.value)}
              >
                <option value="">Select Lesson</option>
                {lessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} {lesson.module ? `(${lesson.module.title})` : ''}
                  </option>
                ))}
              </select>
            ) : triggerType === 'quiz_complete' ? (
              <input 
                type="text" 
                placeholder="Quiz ID" 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={triggerValue} 
                onChange={(e) => setTriggerValue(e.target.value)} 
              />
            ) : (
              <input 
                type="text" 
                placeholder="Manual award (enter description)" 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={triggerValue}
                onChange={(e) => setTriggerValue(e.target.value)}
              />
            )}
          </FormField>
          
          {availablePrerequisiteBadges.length > 0 && (
            <FormField label="Prerequisites (Optional)">
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">Select badges that must be earned first:</p>
                {availablePrerequisiteBadges.map(badge => (
                  <label key={badge.id} className="flex items-center space-x-2 text-sm py-1">
                    <input 
                      type="checkbox" 
                      checked={prerequisites.includes(badge.id)}
                      onChange={(e) => handlePrerequisiteChange(badge.id, e.target.checked)}
                      className="rounded"
                    />
                    <span>{badge.name}</span>
                  </label>
                ))}
              </div>
            </FormField>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex space-x-3">
        <button 
          onClick={handleSave} 
          disabled={loading} 
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (initialBadge ? 'Updating...' : 'Creating...') : (initialBadge ? 'Update Badge' : 'Create Badge')}
        </button>
        <button 
          onClick={onClose} 
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default function BadgeManagementPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showAddBadge, setShowAddBadge] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterRarity, setFilterRarity] = useState<string>('');
  const [orphanedBadges, setOrphanedBadges] = useState<OrphanedBadge[]>([]);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  // Get URL parameters
  const searchParams = useSearchParams();
  const preselectedLessonId = searchParams.get('lessonId');

  // Auto-open form if lesson is preselected
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
      
      const modulesResponse = await fetch('/api/admin/modules');
      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        setModules(modulesData);
      }

      const lessonsResponse = await fetch('/api/admin/lessons');
      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData);
      }

      const badgesResponse = await fetch('/api/admin/badges');
      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        setBadges(badgesData);
      }

      // Check for orphaned badges after loading data
      await checkOrphanedBadges();
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data. Please refresh the page.');
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
        setOrphanedBadges(data.orphanedBadges || []);
      }
    } catch (error) {
      console.error('Error checking orphaned badges:', error);
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleCleanupOrphanedBadges = async () => {
    if (!confirm(`Are you sure you want to delete ${orphanedBadges.length} orphaned badge${orphanedBadges.length !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    try {
      setCleanupLoading(true);
      const response = await fetch('/api/admin/badges/cleanup', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        
        // Refresh badges and check again
        const badgesResponse = await fetch('/api/admin/badges');
        if (badgesResponse.ok) {
          const badgesData = await badgesResponse.json();
          setBadges(badgesData);
        }
        
        await checkOrphanedBadges();
      } else {
        const errorData = await response.json();
        alert(`Error cleaning up badges: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error cleaning up badges:', error);
      alert('Error cleaning up badges. Please try again.');
    } finally {
      setCleanupLoading(false);
    }
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

      // Re-check for orphaned badges after changes
      await checkOrphanedBadges();

      alert(`Badge ${isEditing ? 'updated' : 'created'} successfully!`);
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
      
      // Re-check for orphaned badges after deletion
      await checkOrphanedBadges();
      
      alert('Badge deleted successfully!');
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('Error deleting badge. Please try again.');
    }
  };

  const handleCloseForm = () => {
    setShowAddBadge(false);
    setEditingBadge(null);
  };

  const categories = Array.from(new Set([
    ...modules.map(m => m.title), 
    'General', 
    'Quiz Achievement', 
    'Performance',
    'Lesson Completion'
  ]));
  const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];

  const filteredBadges = badges.filter(badge => {
    const categoryMatch = !filterCategory || badge.category === filterCategory;
    const rarityMatch = !filterRarity || badge.rarity === filterRarity;
    return categoryMatch && rarityMatch;
  });

  // Find preselected lesson badge if it exists
  const preselectedLessonBadge = preselectedLessonId ? badges.find(b => 
    b.triggerType === 'lesson_complete' && b.triggerValue === preselectedLessonId
  ) : null;

  const preselectedLesson = preselectedLessonId ? lessons.find(l => l.id === preselectedLessonId) : null;

  // Create set of orphaned badge IDs for quick lookup
  const orphanedBadgeIds = new Set(orphanedBadges.map(b => b.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Badge Management</h1>
          <p className="text-gray-600">Create and manage achievement badges stored in your database</p>
          {preselectedLessonId && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected from Content Management:</strong> {preselectedLesson?.title || 'Loading lesson...'}
                {preselectedLessonBadge ? (
                  <span className="ml-2 text-green-600">(Badge already exists - highlighted below)</span>
                ) : (
                  <span className="ml-2 text-orange-600">(No badge created yet - form opened below)</span>
                )}
              </p>
            </div>
          )}
        </div>
        <button 
          onClick={() => setShowAddBadge(true)} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>🏆</span>
          <span>Add Badge</span>
        </button>
      </div>

      {/* Cleanup Widget */}
      <CleanupWidget 
        orphanedBadges={orphanedBadges}
        onCleanup={handleCleanupOrphanedBadges}
        onCheck={checkOrphanedBadges}
        loading={cleanupLoading}
      />

      {(showAddBadge || editingBadge) && (
        <AddBadgeForm 
          onClose={handleCloseForm} 
          onSave={handleSaveBadge}
          modules={modules}
          lessons={lessons}
          badges={badges}
          initialBadge={editingBadge || undefined}
          preselectedLessonId={preselectedLessonId || undefined}
        />
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Category</label>
            <select 
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
            <label className="block text-sm font-medium mb-1">Filter by Rarity</label>
            <select 
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={filterRarity} 
              onChange={(e) => setFilterRarity(e.target.value)}
            >
              <option value="">All Rarities</option>
              {rarities.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchData}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">All Badges ({filteredBadges.length})</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading badges...</span>
            </div>
          ) : filteredBadges.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏆</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {badges.length === 0 ? 'No badges created yet' : 'No badges match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {badges.length === 0 ? 'Create your first achievement badge' : 'Try adjusting your filter criteria'}
              </p>
              {badges.length === 0 && (
                <button 
                  onClick={() => setShowAddBadge(true)} 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Create First Badge
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBadges.map((badge) => (
                <BadgeCard 
                  key={badge.id} 
                  badge={badge} 
                  modules={modules}
                  lessons={lessons}
                  badges={badges}
                  onEdit={setEditingBadge} 
                  onDelete={handleDeleteBadge}
                  isHighlighted={preselectedLessonBadge?.id === badge.id}
                  isOrphaned={orphanedBadgeIds.has(badge.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Badge System Information</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Module Complete:</strong> Triggered when user completes all lessons in a specific module</p>
          <p>• <strong>Lesson Complete:</strong> Triggered when user completes a specific lesson</p>
          <p>• <strong>Quiz Complete:</strong> Triggered when user successfully passes a specific quiz</p>
          <p>• <strong>Manual:</strong> Manually awarded by administrators</p>
          <p>• All badges are stored in your database and properly linked to actual modules/lessons</p>
          <p>• <strong>Orphaned Badge Cleanup:</strong> The system automatically detects and can remove badges that reference deleted content</p>
          <p>• Lesson badges now show which module the lesson belongs to for better organization</p>
          {preselectedLessonId && (
            <p>• <strong>Navigation from Content Management:</strong> This page opened with a specific lesson pre-selected for badge creation</p>
          )}
        </div>
      </div>
    </div>
  );
}