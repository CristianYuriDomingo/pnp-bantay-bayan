'use client';
import { useState, useEffect } from 'react';
import { Module } from '../types';

// Badge interface
interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  triggerType: 'module_complete' | 'lesson_complete' | 'manual';
  triggerValue: string;
  prerequisites?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FormField = ({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label} {required && '*'}</label>
    {children}
  </div>
);

const BadgeCard = ({ badge, modules, badges, onEdit, onDelete }: { 
  badge: Badge; 
  modules: Module[]; 
  badges: Badge[];
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
    if (!name.trim() || !description.trim() || !category.trim() || (!imagePreview && !initialBadge)) {
      return alert('Please fill in all required fields and select an image');
    }
    
    setLoading(true);
    try {
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

export default function BadgeManagement() {
  const [modules, setModules] = useState<Module[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showAddBadge, setShowAddBadge] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterRarity, setFilterRarity] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch modules
        const modulesResponse = await fetch('/api/admin/modules');
        if (modulesResponse.ok) {
          setModules(await modulesResponse.json());
        }

        // Mock badges data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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
        <div>
          <h1 className="text-2xl font-bold">Badge Management</h1>
          <p className="text-gray-600">Create and manage achievement badges</p>
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
                  badges={badges}
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
}