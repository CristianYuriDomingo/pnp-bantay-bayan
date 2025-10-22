'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Edit2, Trash2, Award, BookOpen, Clock, MessageSquare, Image as ImageIcon, ChevronLeft, Check, AlertCircle } from 'lucide-react';

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
  xpValue: number;
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_complete' | 'manual';
  triggerValue: string;
  prerequisites?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper function
const calculateLessonBadgeMetrics = (tipCount: number) => {
  if (tipCount >= 1 && tipCount <= 3) {
    return { rarity: 'Common' as const, xpValue: 10 };
  } else if (tipCount >= 4) {
    return { rarity: 'Rare' as const, xpValue: 25 };
  }
  return { rarity: 'Common' as const, xpValue: 10 };
};

// Badge Status Component
const BadgeStatus = ({ 
  hasBadge, 
  onClick, 
  disabled = false 
}: { 
  hasBadge: boolean; 
  onClick: () => void;
  disabled?: boolean;
}) => {
  if (hasBadge) {
    return (
      <button 
        onClick={onClick}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
      >
        <Award className="w-4 h-4" />
        <span>Badge Created - Click to Edit</span>
      </button>
    );
  }

  if (disabled) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-sm">
        <Award className="w-4 h-4" />
        <span>Add lessons first</span>
      </div>
    );
  }

  return (
    <button 
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors border border-orange-200"
    >
      <Award className="w-4 h-4" />
      <span>Create Badge</span>
    </button>
  );
};

// Modal Component
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200`}>
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

// Badge Creation Modal
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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rarity, setRarity] = useState<Badge['rarity']>('Common');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [xpValue, setXpValue] = useState(0);
  const [tipCount, setTipCount] = useState(0);

  useEffect(() => {
    if (isOpen && targetItem) {
      if (existingBadge) {
        // Editing existing badge
        setName(existingBadge.name);
        setDescription(existingBadge.description);
        setRarity(existingBadge.rarity);
        setImagePreview(existingBadge.image);
        setXpValue(existingBadge.xpValue || 0);
        setTipCount(badgeType === 'lesson' && (targetItem as Lesson).tips ? (targetItem as Lesson).tips.length : 0);
      } else {
        // Creating new badge
        if (badgeType === 'module') {
          setName(`${targetItem.title} Master`);
          setDescription(`Complete all lessons in the ${targetItem.title} module to earn this badge`);
          setRarity('Epic');
          setXpValue(50);
          setTipCount(0);
        } else {
          const lessonTipCount = (targetItem as Lesson).tips?.length || 0;
          setTipCount(lessonTipCount);
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
      alert('Please fill in all required fields and select an image');
      return;
    }
    
    setLoading(true);
    try {
      // Build the badge data payload
      const badgeData: any = {
        name: name.trim(),
        description: description.trim(),
        image: imagePreview,
        category: badgeType === 'module' ? targetItem.title : 'Lesson Completion',
        rarity,
        xpValue,
        triggerType: badgeType === 'module' ? 'module_complete' : 'lesson_complete',
        triggerValue: targetItem.id,
      };

      let url = '/api/admin/badges';
      let method = 'POST';

      // If editing existing badge, add ID and change method to PUT
      if (existingBadge?.id) {
        badgeData.id = existingBadge.id;
        method = 'PUT';
        url = `/api/admin/badges?id=${existingBadge.id}`;
      }
      
      console.log('Saving badge:', { method, url, badgeData }); // Debug log
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badgeData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Badge save error:', errorData);
        throw new Error(errorData.error || 'Failed to save badge');
      }

      const savedBadge = await response.json();
      console.log('Badge saved successfully:', savedBadge); // Debug log
      
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${existingBadge ? 'Edit' : 'Create'} ${badgeType === 'module' ? 'Module' : 'Lesson'} Badge`}>
      <div className="space-y-4">
        {existingBadge && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Edit2 className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  Editing Existing Badge
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Badge ID: {existingBadge.id}
                </p>
              </div>
            </div>
          </div>
        )}

        {badgeType === 'lesson' && !existingBadge && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  This lesson has {tipCount} tip{tipCount !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Auto-assigned: {rarity} rarity ({xpValue} XP)
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Badge Name *</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder="Enter badge name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
            placeholder="Describe what this badge represents"
          />
        </div>

        {badgeType === 'lesson' && !existingBadge ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rarity (Auto-calculated)</label>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">{rarity}</span>
              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">{xpValue} XP</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Based on {tipCount} tip{tipCount !== 1 ? 's' : ''} in this lesson</p>
          </div>
        ) : badgeType === 'module' && !existingBadge ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rarity (Fixed)</label>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Epic</span>
              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">50 XP</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Module completion badges are always Epic rarity</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rarity *</label>
            <select 
              value={rarity} 
              onChange={(e) => {
                const newRarity = e.target.value as Badge['rarity'];
                setRarity(newRarity);
                if (newRarity === 'Common') setXpValue(10);
                else if (newRarity === 'Rare') setXpValue(25);
                else if (newRarity === 'Epic') setXpValue(50);
                else if (newRarity === 'Legendary') setXpValue(100);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Common">Common (10 XP)</option>
              <option value="Rare">Rare (25 XP)</option>
              <option value="Epic">Epic (50 XP)</option>
              <option value="Legendary">Legendary (100 XP)</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Badge Image *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="hidden"
              id="badge-image"
            />
            <label htmlFor="badge-image" className="cursor-pointer">
              {imagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg mx-auto" />
                  <span className="text-xs text-gray-500">Click to change image</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                  <span className="text-sm text-gray-600">Click to upload image</span>
                </div>
              )}
            </label>
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : existingBadge ? 'Update Badge' : 'Create Badge'}
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Tip Modal
const AddTipModal = ({ 
  onClose, 
  onSave, 
  tipNumber, 
  initialTip 
}: { 
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
    <Modal isOpen={true} onClose={onClose} title={`${initialTip ? 'Edit' : 'Add'} Tip #${tipNumber}`} size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tip Title *</label>
          <input 
            type="text" 
            placeholder="e.g., Be Mindful of Your Belongings" 
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={tipTitle} 
            onChange={(e) => setTipTitle(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tip Description *</label>
          <textarea 
            placeholder="Detailed description for this tip" 
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
            value={tipDescription} 
            onChange={(e) => setTipDescription(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tip Image (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden"
              id="tip-image"
            />
            <label htmlFor="tip-image" className="cursor-pointer">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg mx-auto" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-xs text-gray-600">Click to upload</span>
                </div>
              )}
            </label>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button 
            onClick={handleSave} 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors"
          >
            {initialTip ? 'Update' : 'Add'} Tip
          </button>
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Lesson Form
const AddLessonForm = ({ 
  module, 
  onClose, 
  onSave, 
  initialLesson 
}: { 
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
    if (!title.trim() || !description.trim() || tips.length === 0) {
      return alert('Please fill in all required fields and add at least one tip');
    }
    
    setLoading(true);
    try {
      const url = initialLesson ? `/api/admin/lessons?id=${initialLesson.id}` : '/api/admin/lessons';
      const response = await fetch(url, {
        method: initialLesson ? 'PUT' : 'POST',
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
        alert('Error saving lesson');
      }
    } catch (error) {
      alert('Error saving lesson');
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

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-bold mb-6">
        {initialLesson ? 'Edit Lesson' : 'Create New Lesson'}
      </h3>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title *</label>
          <input 
            type="text" 
            placeholder="e.g., Anti-Theft & Robbery Awareness" 
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea 
            placeholder="Brief description of what this lesson covers" 
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bubble Speech</label>
            <input 
              type="text" 
              placeholder="e.g., Enjoy Reading!" 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={bubbleSpeech} 
              onChange={(e) => setBubbleSpeech(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timer (seconds)</label>
            <input 
              type="number" 
              placeholder="e.g., 300" 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={timer} 
              onChange={(e) => setTimer(Number(e.target.value))} 
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Tips for Carousel *</label>
            <button 
              type="button" 
              onClick={() => setShowAddTip(true)} 
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Tip
            </button>
          </div>
          
          {tips.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No tips added yet</p>
              <p className="text-sm text-gray-400 mt-1">Add at least one tip to continue</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {tips.map((tip, index) => (
                <div key={tip.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                          {index + 1}
                        </span>
                        <h5 className="font-semibold text-gray-900">{tip.title}</h5>
                      </div>
                      <p className="text-sm text-gray-600 ml-8">{tip.description}</p>
                      {tip.image && (
                        <img src={tip.image} alt="Tip" className="w-16 h-16 object-cover rounded-lg border mt-2 ml-8" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => { setEditTipIndex(index); setShowAddTip(true); }} 
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setTips(tips.filter(t => t.id !== tip.id))} 
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showAddTip && (
        <AddTipModal 
          onClose={() => { setShowAddTip(false); setEditTipIndex(null); }}
          onSave={handleTipSave}
          tipNumber={editTipIndex !== null ? editTipIndex + 1 : tips.length + 1}
          initialTip={editTipIndex !== null ? tips[editTipIndex] : undefined}
        />
      )}
      
      <div className="flex gap-3 mt-6 pt-6 border-t">
        <button 
          onClick={handleSave} 
          disabled={loading} 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : initialLesson ? 'Update Lesson' : 'Create Lesson'}
        </button>
        <button 
          onClick={onClose} 
          className="px-8 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Lesson Management
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
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

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
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
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

  const handleLessonBadgeClick = (lesson: Lesson) => {
    const lessonBadge = badges.find(badge => 
      badge.triggerType === 'lesson_complete' && badge.triggerValue === lesson.id
    );
    
    setSelectedLesson(lesson);
    setEditingBadge(lessonBadge || null);
    setShowBadgeModal(true);
  };

  const handleSaveBadge = (savedBadge: Badge) => {
    setShowBadgeModal(false);
    setSelectedLesson(null);
    setEditingBadge(null);
    onBadgeUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lesson Management</h1>
            <p className="text-sm text-gray-600 mt-1">Managing: <span className="font-semibold">{module.title}</span></p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddLesson(true)} 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Lesson
        </button>
      </div>

      {(showAddLesson || editingLesson) && (
        <AddLessonForm 
          module={module} 
          onClose={() => { setShowAddLesson(false); setEditingLesson(null); }} 
          onSave={handleSaveLesson}
          initialLesson={editingLesson || undefined}
        />
      )}

      {showBadgeModal && selectedLesson && (
        <QuickBadgeModal 
          isOpen={showBadgeModal}
          onClose={() => {
            setShowBadgeModal(false);
            setSelectedLesson(null);
            setEditingBadge(null);
          }}
          onSave={handleSaveBadge}
          badgeType="lesson"
          targetItem={selectedLesson}
          existingBadge={editingBadge || undefined}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <span className="text-gray-600">Loading lessons...</span>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16 px-6">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No lessons yet</h3>
            <p className="text-gray-600 mb-6">Start building your course by creating your first lesson</p>
            <button 
              onClick={() => setShowAddLesson(true)} 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create First Lesson
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">All Lessons ({lessons.length})</h2>
            {lessons.map((lesson) => {
              const lessonBadge = badges.find(badge => 
                badge.triggerType === 'lesson_complete' && badge.triggerValue === lesson.id
              );
              
              return (
                <div key={lesson.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{lesson.title}</h4>
                      <p className="text-gray-600 mb-4">{lesson.description}</p>
                      
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <MessageSquare className="w-4 h-4" />
                          <span>"{lesson.bubbleSpeech}"</span>
                        </div>
                        <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.timer}s</span>
                        </div>
                        <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <BookOpen className="w-4 h-4" />
                          <span>{lesson.tips.length} tip{lesson.tips.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <BadgeStatus 
                          hasBadge={!!lessonBadge}
                          onClick={() => handleLessonBadgeClick(lesson)}
                        />
                      </div>

                      {lesson.tips.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-blue-900 mb-2">Tips Preview:</p>
                          <div className="space-y-2">
                            {lesson.tips.slice(0, 3).map((tip, tipIndex) => (
                              <div key={tip.id} className="flex items-start gap-2 text-sm">
                                <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-200 text-blue-700 rounded-full text-xs font-bold flex-shrink-0 mt-0.5">
                                  {tipIndex + 1}
                                </span>
                                <div className="flex-1">
                                  <span className="font-medium text-blue-900">{tip.title}</span>
                                  {tip.image && (
                                    <img src={tip.image} alt={`Tip ${tipIndex + 1}`} className="w-12 h-12 object-cover rounded-lg border mt-1" />
                                  )}
                                </div>
                              </div>
                            ))}
                            {lesson.tips.length > 3 && (
                              <div className="text-sm text-blue-700 font-medium">+{lesson.tips.length - 3} more tips...</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex lg:flex-col gap-2">
                      <button 
                        onClick={() => setEditingLesson(lesson)} 
                        className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.id)} 
                        className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
};

// Module Card
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
      <div className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group w-full sm:w-80">
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
          {!imageError ? (
            <img 
              src={module.image} 
              alt={module.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              onError={() => setImageError(true)} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-blue-300" />
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-sm font-bold text-blue-600">{module.lessonCount || 0} Lessons</span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="font-bold text-xl mb-4 text-gray-900 line-clamp-2">{module.title}</h3>
          
          <div className="mb-4">
            <BadgeStatus 
              hasBadge={!!moduleBadge}
              onClick={() => onManageBadge(module)}
              disabled={!canCreateModuleBadge}
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm"
          >
            Manage Module
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={module.title} size="sm">
        <div className="space-y-4">
          <div className="relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
            {!imageError && (
              <img 
                src={module.image} 
                alt={module.title} 
                className="w-full h-full object-cover" 
                onError={() => setImageError(true)} 
              />
            )}
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Lessons</span>
              <span className="text-2xl font-bold text-blue-600">{module.lessonCount || 0}</span>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Module Badge Status:</p>
              <BadgeStatus 
                hasBadge={!!moduleBadge}
                onClick={() => {
                  if (canCreateModuleBadge) {
                    onManageBadge(module);
                    setIsModalOpen(false);
                  }
                }}
                disabled={!canCreateModuleBadge}
              />
              {!canCreateModuleBadge && (
                <p className="text-xs text-gray-500 mt-2">Add lessons first to enable badges</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <button 
              onClick={() => { onViewLessons(module); setIsModalOpen(false); }} 
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-colors font-medium"
            >
              <BookOpen className="w-5 h-5" />
              Manage Lessons
            </button>
            <button 
              onClick={() => { 
                if (confirm(`Delete "${module.title}"? This action cannot be undone.`)) { 
                  onDelete(module.id); 
                  setIsModalOpen(false); 
                } 
              }} 
              className="w-full inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl transition-colors font-medium"
            >
              <Trash2 className="w-5 h-5" />
              Delete Module
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Add Module Form
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
    if (!title.trim() || !imageFile) {
      return alert('Please fill in all required fields and select an image');
    }
    
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
      alert('Error creating module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
      <h3 className="text-xl font-bold mb-6">Create New Module</h3>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Module Title *</label>
          <input 
            type="text" 
            placeholder="e.g., Crime Prevention" 
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Module Image *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="hidden"
              id="module-image"
            />
            <label htmlFor="module-image" className="cursor-pointer">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                  <span className="text-sm text-gray-600">Click to upload image</span>
                  <span className="text-xs text-gray-400">PNG, JPG up to 10MB</span>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6 pt-6 border-t">
        <button 
          onClick={handleSave} 
          disabled={loading} 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Module'}
        </button>
        <button 
          onClick={onClose} 
          className="px-8 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Main Component
export default function ContentManagementPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showModuleLessons, setShowModuleLessons] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeModalType, setBadgeModalType] = useState<'module' | 'lesson'>('module');
  const [selectedTargetItem, setSelectedTargetItem] = useState<Module | Lesson | null>(null);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modulesResponse, badgesResponse] = await Promise.all([
        fetch('/api/admin/modules'),
        fetch('/api/admin/badges')
      ]);
      
      if (modulesResponse.ok) setModules(await modulesResponse.json());
      if (badgesResponse.ok) setBadges(await badgesResponse.json());
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
      const response = await fetch('/api/admin/badges');
      if (response.ok) setBadges(await response.json());
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
    fetchData();
  };

  if (showModuleLessons && selectedModule) {
    return (
      <LessonManagement 
        module={selectedModule} 
        onBack={() => { 
          setShowModuleLessons(false); 
          setSelectedModule(null); 
          fetchData();
        }}
        badges={badges}
        onBadgeUpdate={refreshBadges}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Content Management</h2>
            <p className="text-gray-600 text-sm mt-2">
              Create and manage learning modules, lessons, and achievement badges
            </p>
          </div>
          <button 
            onClick={() => setShowAddModule(true)} 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
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
          onClose={() => {
            setShowBadgeModal(false);
            setEditingBadge(null);
            setSelectedTargetItem(null);
          }}
          onSave={handleSaveBadge}
          badgeType={badgeModalType}
          targetItem={selectedTargetItem}
          existingBadge={editingBadge || undefined}
        />
        
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <span className="text-gray-600 font-medium">Loading modules...</span>
          </div>
        ) : modules.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No modules yet</h3>
            <p className="text-gray-600 mb-6">Start building your learning platform by creating your first module</p>
            <button 
              onClick={() => setShowAddModule(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Module
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {modules.map((module) => (
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
              ))}
            </div>
            
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-3">Badge System Guide</h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p><Check className="w-4 h-4 inline mr-2" /><strong>Module Badges:</strong> Earned when users complete all lessons in a module</p>
                    <p><Check className="w-4 h-4 inline mr-2" /><strong>Lesson Badges:</strong> Earned immediately upon completing a specific lesson</p>
                    <p><Check className="w-4 h-4 inline mr-2" /><strong>Auto-Calculation:</strong> Lesson badge rarity and XP are based on tip count</p>
                    <p><Check className="w-4 h-4 inline mr-2" /><strong>Quick Access:</strong> Click badge indicators to manage or create badges</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}