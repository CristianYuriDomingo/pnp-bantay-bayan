'use client';
import { useState, useEffect } from 'react';
import { Module, Lesson, Tip } from '../types';

// Badge interface (you'll add this to your types file later)
interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_score' | 'manual';
  triggerValue: string; // module ID, lesson count, score threshold, etc.
  prerequisites?: string[]; // array of badge IDs that must be earned first
  createdAt: Date;
  updatedAt: Date;
}

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => 
  isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md max-h-[90vh] overflow-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10">×</button>
        {children}
      </div>
    </div>
  ) : null;

const ModuleCard = ({ module, onViewLessons, onDelete }: { module: Module; onViewLessons: (module: Module) => void; onDelete: (moduleId: string) => void }) => {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              {(module.lessonCount || 0)} Lessons {(module.lessonCount || 0) > 0 ? `1/${module.lessonCount || 0}` : ''}
            </span>
          </div>
          
          <button onClick={() => setIsModalOpen(true)} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-full font-medium transition-colors">
            Review
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{module.title}</h2>
          <div className="mb-6">
            <img src={module.image} alt={module.title} className="w-full h-32 object-cover rounded-lg mb-4" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <p className="text-gray-600 mb-4"><strong>Lessons:</strong> {module.lessonCount || 0}</p>
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

const FormField = ({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label} {required && '*'}</label>
    {children}
  </div>
);

// Badge Management Components
const BadgeCard = ({ badge, modules, onEdit, onDelete }: { 
  badge: Badge; 
  modules: Module[]; 
  onEdit: (badge: Badge) => void; 
  onDelete: (badgeId: string) => void; 
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
        return `Complete ${badge.triggerValue} lessons`;
      case 'quiz_score':
        return `Score ${badge.triggerValue}% or higher on quiz`;
      case 'manual':
        return 'Manually awarded by admin';
      default:
        return 'Unknown trigger';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
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
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Trigger:</strong> {getTriggerDescription(badge)}
                </p>
                
                {badge.prerequisites && badge.prerequisites.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>Prerequisites:</strong> {badge.prerequisites.length} badge(s) required
                  </p>
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
    </div>
  );
};

const AddBadgeForm = ({ 
  onClose, 
  onSave, 
  modules, 
  badges, 
  initialBadge 
}: { 
  onClose: () => void; 
  onSave: (badge: Badge) => void; 
  modules: Module[]; 
  badges: Badge[]; 
  initialBadge?: Badge;
}) => {
  const [name, setName] = useState(initialBadge?.name || '');
  const [description, setDescription] = useState(initialBadge?.description || '');
  const [category, setCategory] = useState(initialBadge?.category || '');
  const [rarity, setRarity] = useState<Badge['rarity']>(initialBadge?.rarity || 'Common');
  const [triggerType, setTriggerType] = useState<Badge['triggerType']>(initialBadge?.triggerType || 'module_complete');
  const [triggerValue, setTriggerValue] = useState(initialBadge?.triggerValue || '');
  const [prerequisites, setPrerequisites] = useState<string[]>(initialBadge?.prerequisites || []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialBadge?.image || '');
  const [loading, setLoading] = useState(false);

  const categories = Array.from(new Set(modules.map(m => m.title)));

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
    if (!name.trim() || !description.trim() || !category.trim() || (!imagePreview && !initialBadge)) {
      return alert('Please fill in all required fields and select an image');
    }
    
    setLoading(true);
    try {
      // Simulate API call - replace with actual API call later
      const newBadge: Badge = {
        id: initialBadge?.id || Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        image: imagePreview,
        category: category.trim(),
        rarity,
        triggerType,
        triggerValue: triggerValue.trim(),
        prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
        createdAt: initialBadge?.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(newBadge);
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('Error saving badge');
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
              <option value="General">General</option>
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
              onChange={(e) => setTriggerType(e.target.value as Badge['triggerType'])}
            >
              <option value="module_complete">Complete Module</option>
              <option value="lesson_complete">Complete X Lessons</option>
              <option value="quiz_score">Quiz Score Threshold</option>
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
              <input 
                type="number" 
                placeholder="Number of lessons" 
                min="1"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={triggerValue} 
                onChange={(e) => setTriggerValue(e.target.value)} 
              />
            ) : triggerType === 'quiz_score' ? (
              <input 
                type="number" 
                placeholder="Score percentage (e.g., 90)" 
                min="0" 
                max="100"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={triggerValue} 
                onChange={(e) => setTriggerValue(e.target.value)} 
              />
            ) : (
              <input 
                type="text" 
                placeholder="Manual award (no trigger needed)" 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value="manual"
                disabled
              />
            )}
          </FormField>
          
          {badges.length > 0 && (
            <FormField label="Prerequisites (Optional)">
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">Select badges that must be earned first:</p>
                {badges
                  .filter(b => b.id !== initialBadge?.id)
                  .map(badge => (
                    <label key={badge.id} className="flex items-center space-x-2 text-sm py-1">
                      <input 
                        type="checkbox" 
                        checked={prerequisites.includes(badge.id)}
                        onChange={(e) => handlePrerequisiteChange(badge.id, e.target.checked)}
                        className="rounded"
                      />
                      <span>{badge.name}</span>
                    </label>
                  ))
                }
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

const BadgeManagement = ({ modules, onBack }: { modules: Module[]; onBack: () => void }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showAddBadge, setShowAddBadge] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterRarity, setFilterRarity] = useState<string>('');

  // Simulate fetching badges (replace with actual API call later)
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockBadges: Badge[] = [
          {
            id: '1',
            name: 'Crime Prevention Expert',
            description: 'Complete all Crime Prevention lessons',
            image: '/badge-crime-expert.png',
            category: 'Crime Prevention',
            rarity: 'Epic',
            triggerType: 'module_complete',
            triggerValue: 'crime-prevention-id',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            name: 'Quick Learner',
            description: 'Complete your first lesson',
            image: '/badge-first-lesson.png',
            category: 'General',
            rarity: 'Common',
            triggerType: 'lesson_complete',
            triggerValue: '1',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        setBadges(mockBadges);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBadges();
  }, []);

  const handleSaveBadge = (savedBadge: Badge) => {
    if (editingBadge) {
      setBadges(badges.map(badge => badge.id === savedBadge.id ? savedBadge : badge));
      setEditingBadge(null);
    } else {
      setBadges([...badges, savedBadge]);
      setShowAddBadge(false);
    }
  };

  const handleDeleteBadge = (badgeId: string) => {
    setBadges(badges.filter(badge => badge.id !== badgeId));
  };

  const handleCloseForm = () => {
    setShowAddBadge(false);
    setEditingBadge(null);
  };

  const categories = Array.from(new Set([...modules.map(m => m.title), 'General']));
  const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];

  const filteredBadges = badges.filter(badge => {
    const categoryMatch = !filterCategory || badge.category === filterCategory;
    const rarityMatch = !filterRarity || badge.rarity === filterRarity;
    return categoryMatch && rarityMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack} 
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to Content
          </button>
          <div>
            <h1 className="text-2xl font-bold">Badge Management</h1>
            <p className="text-gray-600">Create and manage achievement badges</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddBadge(true)} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>🏆</span>
          <span>Add Badge</span>
        </button>
      </div>

      {(showAddBadge || editingBadge) && (
        <AddBadgeForm 
          onClose={handleCloseForm} 
          onSave={handleSaveBadge}
          modules={modules}
          badges={badges}
          initialBadge={editingBadge || undefined}
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
                  onEdit={setEditingBadge} 
                  onDelete={handleDeleteBadge} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Rest of your existing components remain the same...
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

const AddTipModal = ({ onClose, onSave, tipNumber, initialTip }: { 
  onClose: () => void; 
  onSave: (tip: { title: string; description: string; image?: string }) => void; 
  tipNumber: number; 
  initialTip?: { title: string; description: string; image?: string };
}) => {
  const [tipTitle, setTipTitle] = useState(initialTip?.title || '');
  const [tipDescription, setTipDescription] = useState(initialTip?.description || '');
  const [imagePreview, setImagePreview] = useState<string>(initialTip?.image || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!tipTitle.trim() || !tipDescription.trim()) return alert('Please fill in both tip title and description');
    
    onSave({ title: tipTitle.trim(), description: tipDescription.trim(), image: imagePreview });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full mx-4">
        <h4 className="text-lg font-semibold mb-4">{initialTip ? 'Edit' : 'Add'} Tip #{tipNumber}</h4>
        <div className="space-y-4">
          <FormField label="Tip Title" required>
            <input type="text" placeholder="e.g., Be Mindful of Your Belongings" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={tipTitle} onChange={(e) => setTipTitle(e.target.value)} />
          </FormField>
          <FormField label="Tip Description" required>
            <textarea placeholder="Detailed description for this tip" className="w-full border border-gray-300 p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={tipDescription} onChange={(e) => setTipDescription(e.target.value)} />
          </FormField>
          <FormField label="Tip Image (Optional)">
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
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
            {initialTip ? 'Update' : 'Add'} Tip
          </button>
          <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AddLessonForm = ({ module, onClose, onSave, initialLesson }: { 
  module: Module; 
  onClose: () => void; 
  onSave: (lesson: Lesson) => void; 
  initialLesson?: Lesson;
}) => {
  const [title, setTitle] = useState(initialLesson?.title || '');
  const [description, setDescription] = useState(initialLesson?.description || '');
  const [bubbleSpeech, setBubbleSpeech] = useState(initialLesson?.bubbleSpeech || '');
  const [timer, setTimer] = useState(initialLesson?.timer ?? 5); // Changed default to 5 seconds
  const [tips, setTips] = useState<Tip[]>(initialLesson?.tips || []);
  const [showAddTip, setShowAddTip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editTipIndex, setEditTipIndex] = useState<number | null>(null);

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || tips.length === 0) return alert('Please fill in all required fields and add at least one tip');
    
    setLoading(true);
    try {
      const url = initialLesson ? `/api/admin/lessons?id=${initialLesson.id}` : '/api/admin/lessons';
      const method = initialLesson ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          bubbleSpeech: bubbleSpeech.trim(),
          timer,
          moduleId: module.id,
          tips: tips.map(tip => ({ title: tip.title, description: tip.description, image: tip.image }))
        }),
      });
      
      if (response.ok) {
        onSave(await response.json());
      } else {
        alert(`Error ${initialLesson ? 'updating' : 'creating'} lesson`);
      }
    } catch (error) {
      console.error(`Error ${initialLesson ? 'updating' : 'creating'} lesson:`, error);
      alert(`Error ${initialLesson ? 'updating' : 'creating'} lesson`);
    } finally {
      setLoading(false);
    }
  };

  const handleTipSave = (newTip: any) => {
    if (editTipIndex !== null) {
      setTips(tips.map((tip, idx) => idx === editTipIndex ? { ...tip, ...newTip } : tip));
      setEditTipIndex(null);
    } else {
      setTips([...tips, { id: Date.now().toString() + Math.random(), ...newTip }]);
    }
    setShowAddTip(false);
  };

  const closeTipModal = () => {
    setShowAddTip(false);
    setEditTipIndex(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialLesson ? 'Edit' : 'Add New'} Lesson {initialLesson ? `"${initialLesson.title}"` : `to "${module.title}"`}
      </h3>
      <div className="space-y-4">
        <FormField label="Lesson Title" required>
          <input type="text" placeholder="e.g., Anti-Theft & Robbery Awareness" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Lesson Description" required>
          <textarea placeholder="Brief description of what this lesson covers" className="w-full border border-gray-300 p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
        <FormField label="Bubble Speech Text">
          <input type="text" placeholder="e.g., Enjoy Reading!" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={bubbleSpeech} onChange={(e) => setBubbleSpeech(e.target.value)} />
        </FormField>
        <FormField label="Timer (seconds)">
          <input type="number" placeholder="e.g., 300 (5 minutes)" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={timer} onChange={(e) => setTimer(Number(e.target.value))} />
        </FormField>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Tips for Carousel *</label>
            <button type="button" onClick={() => setShowAddTip(true)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
              + Add Tip
            </button>
          </div>
          {tips.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center text-gray-500">
              No tips added yet. Add at least one tip for the carousel.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4">
              {tips.map((tip, index) => (
                <div key={tip.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm mb-1">Tip {index + 1}: {tip.title}</h5>
                      <p className="text-xs text-gray-600">{tip.description}</p>
                      {tip.image && <img src={tip.image} alt="Tip preview" className="w-20 h-20 object-cover rounded border mt-2" />}
                    </div>
                    <div className="flex flex-col space-y-1 ml-2">
                      <button onClick={() => { setEditTipIndex(index); setShowAddTip(true); }} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setTips(tips.filter(t => t.id !== tip.id))} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {(showAddTip || editTipIndex !== null) && (
        <AddTipModal 
          onClose={closeTipModal}
          onSave={handleTipSave}
          tipNumber={editTipIndex !== null ? editTipIndex + 1 : tips.length + 1}
          initialTip={editTipIndex !== null ? tips[editTipIndex] : undefined}
        />
      )}
      
      <div className="mt-6 flex space-x-3">
        <button onClick={handleSave} disabled={loading} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50">
          {loading ? (initialLesson ? 'Updating...' : 'Saving...') : (initialLesson ? 'Update Lesson' : 'Save Lesson')}
        </button>
        <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
};

const LessonManagement = ({ module, onBack }: { module: Module; onBack: () => void }) => {
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
      if (response.ok) setLessons(lessons.filter(lesson => lesson.id !== lessonId));
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
        <AddLessonForm 
          module={module} 
          onClose={handleCloseForm} 
          onSave={handleSaveLesson}
          initialLesson={editingLesson || undefined}
        />
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
              {lessons.map((lesson) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ContentManagement() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showModuleLessons, setShowModuleLessons] = useState(false);
  const [showBadgeManagement, setShowBadgeManagement] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('/api/admin/modules');
        if (response.ok) setModules(await response.json());
      } catch (error) {
        console.error('Error fetching modules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  const handleDeleteModule = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/admin/modules?id=${moduleId}`, { method: 'DELETE' });
      if (response.ok) setModules(modules.filter(module => module.id !== moduleId));
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  if (showBadgeManagement) {
    return <BadgeManagement modules={modules} onBack={() => setShowBadgeManagement(false)} />;
  }

  if (showModuleLessons && selectedModule) {
    return <LessonManagement module={selectedModule} onBack={() => { setShowModuleLessons(false); setSelectedModule(null); }} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Content Management</h2>
        <div className="flex space-x-3">
          <button onClick={() => setShowBadgeManagement(true)} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors">
            🏆 Manage Badges
          </button>
          <button onClick={() => setShowAddModule(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Add Module
          </button>
        </div>
      </div>
      
      {showAddModule && (
        <AddModuleForm 
          onClose={() => setShowAddModule(false)} 
          onSave={(newModule) => { 
            setModules([...modules, newModule]); 
            setShowAddModule(false); 
          }} 
        />
      )}
      
      <div className="flex flex-wrap gap-6 justify-start">
        {loading ? (
          <div className="w-full text-center">Loading modules...</div>
        ) : modules.length === 0 ? (
          <div className="w-full bg-white p-8 rounded-lg shadow border-2 border-dashed border-gray-300 text-center">
            <div className="text-gray-400 text-4xl mb-2">📚</div>
            <p className="text-gray-500">No modules created yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first learning module</p>
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
            />
          ))
        )}
      </div>
    </div>
  );
}