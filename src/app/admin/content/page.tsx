// app/admin/content/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  xpValue: number; // ADD THIS LINE
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

// Updated Badge indicator component with navigation
const BadgeIndicator = ({ 
  hasBadge, 
  badgeType, 
  onClick, 
  disabled = false,
  isClickable = true 
}: { 
  hasBadge: boolean; 
  badgeType: 'module' | 'lesson';
  onClick: () => void;
  disabled?: boolean;
  isClickable?: boolean;
}) => {
  if (hasBadge) {
    return (
      <div className="flex items-center space-x-2 text-green-600 text-sm">
        <span className="text-lg">🏆</span>
        <span>{badgeType === 'module' ? 'Completion' : 'Lesson'} badge created</span>
        {isClickable && (
          <button 
            onClick={onClick}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Manage Badge
          </button>
        )}
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="flex items-center space-x-2 text-gray-400 text-sm">
        <span className="text-lg">⭐</span>
        <span>Add {badgeType === 'module' ? 'completion' : 'lesson'} badge (requires lessons)</span>
      </div>
    );
  }

  if (!isClickable) {
    return (
      <div className="flex items-center space-x-2 text-orange-600 text-sm">
        <span className="text-lg">⭐</span>
        <span>No {badgeType === 'module' ? 'completion' : 'lesson'} badge</span>
      </div>
    );
  }

  return (
    <button 
      onClick={onClick}
      className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 text-sm border border-orange-200 rounded-lg px-3 py-2 hover:bg-orange-50 transition-colors"
    >
      <span className="text-lg">⭐</span>
      <span>Create {badgeType === 'module' ? 'completion' : 'lesson'} badge</span>
    </button>
  );
};

// Add this helper function at the top of your file (outside components)
const calculateLessonBadgeMetrics = (tipCount: number) => {
  if (tipCount >= 1 && tipCount <= 3) {
    return { rarity: 'Common' as const, xpValue: 10 };
  } else if (tipCount >= 4) {
    return { rarity: 'Rare' as const, xpValue: 25 };
  }
  return { rarity: 'Common' as const, xpValue: 10 }; // default
};

// Updated Badge creation modal component with better pre-fill and XP logic
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

  // NEW: XP and tip count state
  const [xpValue, setXpValue] = useState(existingBadge?.xpValue || 0);
  const [tipCount, setTipCount] = useState(0);

  useEffect(() => {
    if (isOpen && targetItem) {
      if (existingBadge) {
        setName(existingBadge.name);
        setDescription(existingBadge.description);
        setRarity(existingBadge.rarity);
        setImagePreview(existingBadge.image);
        setXpValue(existingBadge.xpValue || 0);
        setTipCount(
          badgeType === 'lesson' && (targetItem as Lesson).tips
            ? (targetItem as Lesson).tips.length
            : 0
        );
      } else {
        if (badgeType === 'module') {
          setName(`${targetItem.title} Master`);
          setDescription(`Complete all lessons in the ${targetItem.title} module to earn this badge`);
          setRarity('Epic');
          setXpValue(50);
          setTipCount(0);
        } else {
          // CALCULATE TIP COUNT from the lesson
          const lessonTipCount = (targetItem as Lesson).tips?.length || 0;
          setTipCount(lessonTipCount);

          // AUTO-CALCULATE rarity and XP based on tip count
          const { rarity: calculatedRarity, xpValue } = calculateLessonBadgeMetrics(lessonTipCount);

          setName(`${targetItem.title} Reader`);
          setDescription(`Completed the ${targetItem.title} lesson and learned about important safety topics`);
          setRarity(calculatedRarity);
          setXpValue(xpValue);
        }
        setImagePreview('');
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
        ...(existingBadge?.id && { id: existingBadge.id }),
        name: name.trim(),
        description: description.trim(),
        image: imagePreview,
        category: badgeType === 'module' ? targetItem.title : 'Lesson Completion',
        rarity,
        xpValue, // ADD THIS
        triggerType: badgeType === 'module' ? 'module_complete' : 'lesson_complete',
        triggerValue: targetItem.id,
      };
      
      const method = existingBadge ? 'PUT' : 'POST';
      
      const response = await fetch('/api/admin/badges', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(badgeData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to save badge';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error('Empty response from server');
      }

      let savedBadge;
      try {
        savedBadge = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      onSave(savedBadge);
      onClose();
      alert(`Badge ${existingBadge ? 'updated' : 'created'} successfully!`);
    } catch (error: any) {
      console.error('Error saving badge:', error);
      alert(`Error saving badge: ${error.message}`);
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

          {/* Optional: Prominent tip count display for lesson badges */}
          {badgeType === 'lesson' && !existingBadge && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    This lesson has {tipCount} tip{tipCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Auto-assigned: {rarity} rarity ({xpValue} XP)
                  </p>
                </div>
                <span className="text-2xl">💡</span>
              </div>
            </div>
          )}

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
            
            {/* Rarity and XP UI */}
            {badgeType === 'lesson' && !existingBadge ? (
              // READ-ONLY display for lesson badges (auto-calculated)
              <div>
                <label className="block text-sm font-medium mb-1">Rarity (Auto-calculated) *</label>
                <div className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{rarity}</span>
                    <span className="text-sm text-gray-600">{xpValue} XP</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on {tipCount} tip{tipCount !== 1 ? 's' : ''} in this lesson
                  </p>
                </div>
              </div>
            ) : badgeType === 'module' && !existingBadge ? (
              // READ-ONLY display for module badges (always Epic/50 XP)
              <div>
                <label className="block text-sm font-medium mb-1">Rarity (Fixed) *</label>
                <div className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Epic</span>
                    <span className="text-sm text-gray-600">50 XP</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Module completion badges are always Epic rarity
                  </p>
                </div>
              </div>
            ) : (
              // Regular dropdown ONLY for editing existing badges
              <div>
                <label className="block text-sm font-medium mb-1">Rarity *</label>
                <select 
                  value={rarity} 
                  onChange={(e) => {
                    const newRarity = e.target.value as Badge['rarity'];
                    setRarity(newRarity);
                    // Update XP based on rarity
                    if (newRarity === 'Common') setXpValue(10);
                    else if (newRarity === 'Rare') setXpValue(25);
                    else if (newRarity === 'Epic') setXpValue(50);
                    else if (newRarity === 'Legendary') setXpValue(100);
                  }}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Common">Common (10 XP)</option>
                  <option value="Rare">Rare (25 XP)</option>
                  <option value="Epic">Epic (50 XP)</option>
                  <option value="Legendary">Legendary (100 XP)</option>
                </select>
              </div>
            )}

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

// Add Tip Modal Component
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
          <div>
            <label className="block text-sm font-medium mb-1">Tip Title *</label>
            <input 
              type="text" 
              placeholder="e.g., Be Mindful of Your Belongings" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={tipTitle} 
              onChange={(e) => setTipTitle(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tip Description *</label>
            <textarea 
              placeholder="Detailed description for this tip" 
              className="w-full border border-gray-300 p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={tipDescription} 
              onChange={(e) => setTipDescription(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tip Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="w-full border border-gray-300 p-3 rounded-lg" 
            />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <img src={imagePreview} alt="Preview" className="w-32 h-20 object-cover rounded border" />
              </div>
            )}
          </div>
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

// Add Lesson Form Component
const AddLessonForm = ({ module, onClose, onSave, initialLesson }: { 
  module: Module; 
  onClose: () => void; 
  onSave: (lesson: Lesson) => void; 
  initialLesson?: Lesson;
}) => {
  const [title, setTitle] = useState(initialLesson?.title || '');
  const [description, setDescription] = useState(initialLesson?.description || '');
  const [bubbleSpeech, setBubbleSpeech] = useState(initialLesson?.bubbleSpeech || '');
  const [timer, setTimer] = useState(initialLesson?.timer ?? 5);
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
        <div>
          <label className="block text-sm font-medium mb-1">Lesson Title *</label>
          <input 
            type="text" 
            placeholder="e.g., Anti-Theft & Robbery Awareness" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lesson Description *</label>
          <textarea 
            placeholder="Brief description of what this lesson covers" 
            className="w-full border border-gray-300 p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bubble Speech Text</label>
          <input 
            type="text" 
            placeholder="e.g., Enjoy Reading!" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={bubbleSpeech} 
            onChange={(e) => setBubbleSpeech(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Timer (seconds)</label>
          <input 
            type="number" 
            placeholder="e.g., 300 (5 minutes)" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={timer} 
            onChange={(e) => setTimer(Number(e.target.value))} 
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Tips for Carousel *</label>
            <button 
              type="button" 
              onClick={() => setShowAddTip(true)} 
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
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
                      <button 
                        onClick={() => { setEditTipIndex(index); setShowAddTip(true); }} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setTips(tips.filter(t => t.id !== tip.id))} 
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
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
        <button 
          onClick={handleSave} 
          disabled={loading} 
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (initialLesson ? 'Updating...' : 'Saving...') : (initialLesson ? 'Update Lesson' : 'Save Lesson')}
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

// Updated Lesson Management Component with navigation
const LessonManagement = ({ 
  module, 
  onBack,
  badges,
  onBadgeUpdate 
}: { 
  module: Module; 
  onBack: () => void;
  badges: Badge[];
  onBadgeUpdate: () => void;
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        onBadgeUpdate();
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
    onBadgeUpdate();
  };

  const handleCloseForm = () => {
    setShowAddLesson(false);
    setEditingLesson(null);
  };

  // Updated function to handle lesson badge navigation
  const handleLessonBadgeClick = (lesson: Lesson) => {
    // Navigate to badge management page with lesson ID as query parameter
    router.push(`/admin/badges?lessonId=${lesson.id}`);
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
              {lessons.map((lesson) => {
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
                        
                        {/* Updated Lesson badge indicator - now clickable and navigates to badges page */}
                        <div className="mb-3">
                          <BadgeIndicator 
                            hasBadge={!!lessonBadge}
                            badgeType="lesson"
                            onClick={() => handleLessonBadgeClick(lesson)}
                            isClickable={true}
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
  
  const moduleBadge = badges.find(badge => 
    badge.triggerType === 'module_complete' && badge.triggerValue === module.id
  );

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

// Main Content Management Page
export default function ContentManagementPage() {
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

  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const modulesResponse = await fetch('/api/admin/modules');
      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        setModules(modulesData);
      }

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

  const handleSaveBadge = (savedBadge: Badge) => {
    if (editingBadge) {
      setBadges(badges.map(badge => badge.id === savedBadge.id ? savedBadge : badge));
    } else {
      setBadges([...badges, savedBadge]);
    }
    
    setShowBadgeModal(false);
    setEditingBadge(null);
    setSelectedTargetItem(null);
    
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
            fetchData();
          }} 
        />
      )}
      
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
      
      {modules.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Badge System Guide</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Module Completion Badges:</strong> Awarded when a user completes ALL lessons in a module</p>
            <p>• <strong>Lesson Performance Badges:</strong> Awarded immediately when a user finishes a specific lesson</p>
            <p>• All badges are stored in your database and can be managed in the Badge Management section</p>
            <p>• Orange indicators show modules/lessons without badges - click to create them</p>
            <p>• Module badges require at least one lesson to be created first</p>
            <p>• Lesson badge indicators are clickable and will navigate you to the Badge Management page</p>
          </div>
        </div>
      )}
    </div>
  );
}