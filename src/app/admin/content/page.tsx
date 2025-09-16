'use client';
import { useState, useEffect } from 'react';

// Types
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
  bubbleSpeech: string;
  timer: number;
  moduleId: string;
  tips: Tip[];
  module?: {
    id: string;
    title: string;
  };
}

interface Tip {
  id: string;
  title: string;
  description: string;
  image?: string;
}

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

// Modal component
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => 
  isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md max-h-[90vh] overflow-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10">×</button>
        {children}
      </div>
    </div>
  ) : null;

// Badge indicator component
const BadgeIndicator = ({ hasBadge, badgeType, onClick, disabled = false }: { 
  hasBadge: boolean; 
  badgeType: 'module' | 'lesson';
  onClick: () => void;
  disabled?: boolean;
}) => {
  if (hasBadge) {
    return (
      <div className="flex items-center space-x-2 text-green-600 text-sm">
        <span className="text-lg">🏆</span>
        <span>{badgeType === 'module' ? 'Completion' : 'Performance'} badge created</span>
        <button 
          onClick={onClick}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Edit
        </button>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="flex items-center space-x-2 text-gray-400 text-sm">
        <span className="text-lg">⭐</span>
        <span>Add {badgeType === 'module' ? 'completion' : 'performance'} badge (requires lessons)</span>
      </div>
    );
  }

  return (
    <button 
      onClick={onClick}
      className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 text-sm border border-orange-200 rounded-lg px-3 py-2 hover:bg-orange-50 transition-colors"
    >
      <span className="text-lg">⭐</span>
      <span>Add {badgeType === 'module' ? 'completion' : 'performance'} badge</span>
    </button>
  );
};

// Badge creation modal component
const QuickBadgeModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  badgeType,
  targetItem,
  existingBadge 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (badge: Badge) => void;
  badgeType: 'module' | 'lesson';
  targetItem: Module | Lesson | null;
  existingBadge?: Badge;
}) => {
  const [name, setName] = useState(existingBadge?.name || '');
  const [description, setDescription] = useState(existingBadge?.description || '');
  const [rarity, setRarity] = useState<Badge['rarity']>(existingBadge?.rarity || 'Common');
  const [imagePreview, setImagePreview] = useState(existingBadge?.image || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetItem && !existingBadge) {
      // Auto-populate based on target item
      if (badgeType === 'module') {
        setName(`${targetItem.title} Master`);
        setDescription(`Complete all lessons in the ${targetItem.title} module to earn this badge`);
        setRarity('Rare');
      } else {
        setName(`${targetItem.title} Champion`);
        setDescription(`Complete the ${targetItem.title} lesson to earn this badge`);
        setRarity('Common');
      }
    }
  }, [isOpen, targetItem, badgeType, existingBadge]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !imagePreview || !targetItem) {
      return alert('Please fill in all required fields and select an image');
    }
    
    setLoading(true);
    try {
      const badgeData = {
        id: existingBadge?.id,
        name: name.trim(),
        description: description.trim(),
        image: imagePreview,
        category: badgeType === 'module' ? targetItem.title : 'Lesson Completion',
        rarity,
        triggerType: badgeType === 'module' ? 'module_complete' : 'lesson_complete',
        triggerValue: targetItem.id,
      };
      
      // Make actual API call to save badge
      const method = existingBadge ? 'PUT' : 'POST';
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
      onSave(savedBadge);
      onClose();
      alert(`Badge ${existingBadge ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('Error saving badge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {existingBadge ? 'Edit' : 'Create'} {badgeType === 'module' ? 'Module Completion' : 'Lesson'} Badge
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Badge Name *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={badgeType === 'module' ? 'Module Completion Badge' : 'Lesson Achievement Badge'}
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
              <label className="block text-sm font-medium mb-1">Rarity *</label>
              <select 
                value={rarity} 
                onChange={(e) => setRarity(e.target.value as Badge['rarity'])}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Epic</option>
                <option value="Legendary">Legendary</option>
              </select>
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

// Lesson Management Component
const LessonManagement = ({ 
  module, 
  onBack,
  badges,
  onManageLessonBadge,
  onBadgeUpdate 
}: { 
  module: Module; 
  onBack: () => void;
  badges: Badge[];
  onManageLessonBadge: (lesson: Lesson) => void;
  onBadgeUpdate: () => void;
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`/api/admin/lessons?moduleId=${module.id}`);
        if (response.ok) setLessons(await response.json());
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [module.id]);

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/admin/lessons?id=${lessonId}`, { method: 'DELETE' });
      if (response.ok) {
        setLessons(lessons.filter(lesson => lesson.id !== lessonId));
        onBadgeUpdate(); // Refresh badges after lesson deletion
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleSaveLesson = (savedLesson: Lesson) => {
    if (editingLesson) {
      setLessons(lessons.map(lesson => lesson.id === savedLesson.id ? savedLesson : lesson));
      setEditingLesson(null);
    } else {
      setLessons([...lessons, savedLesson]);
      setShowAddLesson(false);
    }
    onBadgeUpdate(); // Refresh badges after lesson creation/update
  };

  const handleCloseForm = () => {
    setShowAddLesson(false);
    setEditingLesson(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
            ← Back to Modules
          </button>
          <div>
            <h1 className="text-2xl font-bold">Lesson Management</h1>
            <p className="text-gray-600">Managing lessons for: <strong>{module.title}</strong></p>
          </div>
        </div>
        <button onClick={() => setShowAddLesson(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
          <span>➕</span>
          <span>Add Lesson</span>
        </button>
      </div>

      {(showAddLesson || editingLesson) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">
            {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Note: A lesson performance badge will be automatically available after creating the lesson.
          </p>
          <div className="flex space-x-3">
            <button onClick={handleCloseForm} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Lessons in "{module.title}"</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading lessons...</span>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons created for this module yet</h3>
              <p className="text-gray-600 mb-6">Add your first lesson to get started</p>
              <button onClick={() => setShowAddLesson(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
                Create First Lesson
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => {
                // Check for lesson badge using lesson ID
                const lessonBadge = badges.find(badge => 
                  badge.triggerType === 'lesson_complete' && badge.triggerValue === lesson.id
                );
                
                return (
                  <div key={lesson.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{lesson.title}</h4>
                        <p className="text-gray-600 mb-3">{lesson.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                          <span className="flex items-center">💬 <span className="ml-1">"{lesson.bubbleSpeech}"</span></span>
                          <span className="flex items-center">⏱️ <span className="ml-1">{lesson.timer}s</span></span>
                          <span className="flex items-center">💡 <span className="ml-1">{lesson.tips.length} tip{lesson.tips.length !== 1 ? 's' : ''}</span></span>
                        </div>
                        
                        {/* Lesson badge indicator */}
                        <div className="mb-3">
                          <BadgeIndicator 
                            hasBadge={!!lessonBadge}
                            badgeType="lesson"
                            onClick={() => onManageLessonBadge(lesson)}
                          />
                        </div>

                        {lesson.tips.length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Tips Preview:</p>
                            <div className="space-y-1">
                              {lesson.tips.slice(0, 3).map((tip, tipIndex) => (
                                <div key={tip.id} className="text-sm text-gray-600">
                                  <span className="font-medium">Tip {tipIndex + 1}:</span> {tip.title}
                                  {tip.image && <img src={tip.image} alt={`Tip ${tipIndex + 1}`} className="w-16 h-16 object-cover rounded border mt-1" />}
                                </div>
                              ))}
                              {lesson.tips.length > 3 && (
                                <div className="text-sm text-gray-500 italic">+{lesson.tips.length - 3} more tips...</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button onClick={() => setEditingLesson(lesson)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                          Edit
                        </button>
                        <button onClick={() => {
                          if (confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
                            handleDeleteLesson(lesson.id);
                          }
                        }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Content Management Component
export default function ContentManagement() {
  const [modules, setModules] = useState<Module[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showModuleLessons, setShowModuleLessons] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Badge modal states
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeModalType, setBadgeModalType] = useState<'module' | 'lesson'>('module');
  const [selectedTargetItem, setSelectedTargetItem] = useState<Module | Lesson | null>(null);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

  // Real data fetching from database
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch modules
      const modulesResponse = await fetch('/api/admin/modules');
      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        setModules(modulesData);
      }

      // Fetch real badges from database
      const badgesResponse = await fetch('/api/admin/badges');
      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        setBadges(badgesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Function to refresh badge data
  const refreshBadges = async () => {
    try {
      const badgesResponse = await fetch('/api/admin/badges');
      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        setBadges(badgesData);
      }
    } catch (error) {
      console.error('Error refreshing badges:', error);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/admin/modules?id=${moduleId}`, { method: 'DELETE' });
      if (response.ok) {
        setModules(modules.filter(module => module.id !== moduleId));
        // Also refresh badges in case any were tied to this module
        refreshBadges();
      }
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const handleManageModuleBadge = (module: Module) => {
    const existingBadge = badges.find(badge => 
      badge.triggerType === 'module_complete' && badge.triggerValue === module.id
    );
    
    setSelectedTargetItem(module);
    setBadgeModalType('module');
    setEditingBadge(existingBadge || null);
    setShowBadgeModal(true);
  };

  const handleManageLessonBadge = (lesson: Lesson) => {
    const existingBadge = badges.find(badge => 
      badge.triggerType === 'lesson_complete' && badge.triggerValue === lesson.id
    );
    
    setSelectedTargetItem(lesson);
    setBadgeModalType('lesson');
    setEditingBadge(existingBadge || null);
    setShowBadgeModal(true);
  };

  // Handle badge save with real database updates
  const handleSaveBadge = (savedBadge: Badge) => {
    // Update local state immediately for UI responsiveness
    if (editingBadge) {
      setBadges(badges.map(badge => badge.id === savedBadge.id ? savedBadge : badge));
    } else {
      setBadges([...badges, savedBadge]);
    }
    
    // Close modal and reset states
    setShowBadgeModal(false);
    setEditingBadge(null);
    setSelectedTargetItem(null);
    
    // Refresh modules to update lesson counts if needed
    if (badgeModalType === 'lesson') {
      fetchData();
    }
  };

  const handleCloseBadgeModal = () => {
    setShowBadgeModal(false);
    setEditingBadge(null);
    setSelectedTargetItem(null);
  };

  if (showModuleLessons && selectedModule) {
    return (
      <LessonManagement 
        module={selectedModule} 
        onBack={() => { 
          setShowModuleLessons(false); 
          setSelectedModule(null); 
        }}
        badges={badges}
        onManageLessonBadge={handleManageLessonBadge}
        onBadgeUpdate={refreshBadges}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage your learning modules and lessons. Create completion badges for enhanced engagement.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModule(true)} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add Module
        </button>
      </div>
      
      {showAddModule && (
        <AddModuleForm 
          onClose={() => setShowAddModule(false)} 
          onSave={(newModule) => { 
            setModules([...modules, newModule]); 
            setShowAddModule(false); 
            // Refresh data to get updated lesson counts
            fetchData();
          }} 
        />
      )}
      
      {/* Badge Creation Modal */}
      <QuickBadgeModal 
        isOpen={showBadgeModal}
        onClose={handleCloseBadgeModal}
        onSave={handleSaveBadge}
        badgeType={badgeModalType}
        targetItem={selectedTargetItem}
        existingBadge={editingBadge || undefined}
      />
      
      <div className="flex flex-wrap gap-6 justify-start">
        {loading ? (
          <div className="w-full text-center">Loading modules...</div>
        ) : modules.length === 0 ? (
          <div className="w-full bg-white p-8 rounded-lg shadow border-2 border-dashed border-gray-300 text-center">
            <div className="text-gray-400 text-4xl mb-2">📚</div>
            <p className="text-gray-500">No modules created yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first learning module to get started</p>
          </div>
        ) : (
          modules.map((module) => (
            <ModuleCard 
              key={module.id} 
              module={module} 
              onViewLessons={(module) => { 
                setSelectedModule(module); 
                setShowModuleLessons(true); 
              }} 
              onDelete={handleDeleteModule}
              badges={badges}
              onManageBadge={handleManageModuleBadge}
            />
          ))
        )}
      </div>
      
      {/* Help text */}
      {modules.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Badge System Guide</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Module Completion Badges:</strong> Awarded when a user completes ALL lessons in a module</p>
            <p>• <strong>Lesson Performance Badges:</strong> Awarded immediately when a user finishes a specific lesson</p>
            <p>• All badges are stored in your database and can be managed in the Badge Management section</p>
            <p>• Orange indicators show modules/lessons without badges - click to create them</p>
            <p>• Module badges require at least one lesson to be created first</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Module card component
const ModuleCard = ({ 
  module, 
  onViewLessons, 
  onDelete,
  badges,
  onManageBadge 
}: { 
  module: Module; 
  onViewLessons: (module: Module) => void; 
  onDelete: (moduleId: string) => void;
  badges: Badge[];
  onManageBadge: (module: Module) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Check if module has a badge
  const moduleBadge = badges.find(badge => 
    badge.triggerType === 'module_complete' && badge.triggerValue === module.id
  );

  // Disable module badge creation if no lessons exist
  const canCreateModuleBadge = (module.lessonCount || 0) > 0;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow w-72">
        <div className="relative">
          {!imageError ? (
            <img src={module.image} alt={module.title} className="w-full h-48 object-cover rounded-t-2xl" onError={() => setImageError(true)} />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-t-2xl">
              <span className="text-4xl">📚</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="font-bold text-xl mb-3 text-gray-800">{module.title}</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-blue-500 font-medium text-sm">
              {(module.lessonCount || 0)} Lessons
            </span>
          </div>
          
          {/* Badge indicator */}
          <div className="mb-4">
            <BadgeIndicator 
              hasBadge={!!moduleBadge}
              badgeType="module"
              onClick={() => onManageBadge(module)}
              disabled={!canCreateModuleBadge}
            />
          </div>
          
          <button onClick={() => setIsModalOpen(true)} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-full font-medium transition-colors">
            Manage
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{module.title}</h2>
          <div className="mb-6">
            <img src={module.image} alt={module.title} className="w-full h-32 object-cover rounded-lg mb-4" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <p className="text-gray-600 mb-4"><strong>Lessons:</strong> {module.lessonCount || 0}</p>
            
            {/* Badge status in modal */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Module Badge Status:</p>
              <BadgeIndicator 
                hasBadge={!!moduleBadge}
                badgeType="module"
                onClick={() => {
                  if (canCreateModuleBadge) {
                    onManageBadge(module);
                    setIsModalOpen(false);
                  }
                }}
                disabled={!canCreateModuleBadge}
              />
              {!canCreateModuleBadge && (
                <p className="text-xs text-gray-500 mt-1">Create lessons first to enable module completion badges</p>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => { onViewLessons(module); setIsModalOpen(false); }} className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors">
              Manage Lessons
            </button>
            <button onClick={() => { 
              if (confirm(`Are you sure you want to delete "${module.title}"?`)) { 
                onDelete(module.id); 
                setIsModalOpen(false); 
              } 
            }} className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors">
              Delete Module
            </button>
            <button onClick={() => setIsModalOpen(false)} className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Form components
const FormField = ({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label} {required && '*'}</label>
    {children}
  </div>
);

const AddModuleForm = ({ onClose, onSave }: { onClose: () => void; onSave: (module: Module) => void }) => {
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
    if (!title.trim() || !imageFile) return alert('Please fill in all required fields and select an image');
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), image: imagePreview }),
      });
      
      if (response.ok) {
        onSave(await response.json());
      } else {
        alert('Error creating module');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Error creating module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h3 className="text-lg font-semibold mb-4">Add New Module</h3>
      <div className="space-y-4">
        <FormField label="Module Title" required>
          <input type="text" placeholder="e.g., Crime Prevention" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Module Image" required>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border border-gray-300 p-3 rounded-lg" />
          {imagePreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Preview:</p>
              <img src={imagePreview} alt="Preview" className="w-32 h-20 object-cover rounded border" />
            </div>
          )}
        </FormField>
      </div>
      <div className="mt-6 flex space-x-3">
        <button onClick={handleSave} disabled={loading} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Module'}
        </button>
        <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
};