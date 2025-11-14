'use client';
import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Eye, Calendar, Clock, Target, ChevronLeft, Play, Settings } from 'lucide-react';

// Types
interface Quest {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  title: string;
  type: 'Puzzle' | 'True/False' | 'Matching' | 'Inspection' | 'Line-Up';
  description: string;
  thumbnail: string;
  status: 'Published' | 'Draft';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: number; // in minutes
  contentCount: number; // questions, levels, items, etc.
}

// Initial quest data
const initialQuests: Quest[] = [
  {
    id: 'quest-monday',
    day: 'Monday',
    title: 'Suspect Line-Up',
    type: 'Line-Up',
    description: 'Identify the correct suspects based on descriptions',
    thumbnail: '/Quest/questFriday/suspect1.png',
    status: 'Published',
    difficulty: 'Hard',
    estimatedTime: 6,
    contentCount: 3
  },
  {
    id: 'quest-tuesday',
    day: 'Tuesday',
    title: 'Safety True or False',
    type: 'True/False',
    description: 'Test your knowledge about safety and crime prevention',
    thumbnail: '/Quest/questTuesday/free.png',
    status: 'Published',
    difficulty: 'Easy',
    estimatedTime: 3,
    contentCount: 5
  },
  {
    id: 'quest-wednesday',
    day: 'Wednesday',
    title: 'Guess the Rank',
    type: 'Matching',
    description: 'Match Pibi with the correct Police Corporal rank',
    thumbnail: '/Quest/questWednesday/pibiBack.png',
    status: 'Published',
    difficulty: 'Easy',
    estimatedTime: 2,
    contentCount: 3
  },
  {
    id: 'quest-thursday',
    day: 'Thursday',
    title: 'Inspection Game',
    type: 'Inspection',
    description: 'Decide which items should be confiscated or allowed',
    thumbnail: '/Quest/questThursday/mascot.png',
    status: 'Published',
    difficulty: 'Medium',
    estimatedTime: 4,
    contentCount: 5
  },
  {
    id: 'quest-friday',
    day: 'Friday',
    title: 'Code the Call',
    type: 'Puzzle',
    description: 'Arrange the digits to form a valid PNP mobile number',
    thumbnail: '/Quest/questWednesday/pibiBack.png',
    status: 'Published',
    difficulty: 'Medium',
    estimatedTime: 5,
    contentCount: 11
  }
];

// Helper functions
const getDayColor = (day: string) => {
  const colors: Record<string, string> = {
    Monday: 'from-blue-400 to-blue-500',
    Tuesday: 'from-green-400 to-green-500',
    Wednesday: 'from-purple-400 to-purple-500',
    Thursday: 'from-orange-400 to-orange-500',
    Friday: 'from-pink-400 to-pink-500'
  };
  return colors[day] || 'from-gray-400 to-gray-500';
};

const getDayBadgeColor = (day: string) => {
  const colors: Record<string, string> = {
    Monday: 'bg-blue-100 text-blue-700 border-blue-300',
    Tuesday: 'bg-green-100 text-green-700 border-green-300',
    Wednesday: 'bg-purple-100 text-purple-700 border-purple-300',
    Thursday: 'bg-orange-100 text-orange-700 border-orange-300',
    Friday: 'bg-pink-100 text-pink-700 border-pink-300'
  };
  return colors[day] || 'bg-gray-100 text-gray-700 border-gray-300';
};

const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, string> = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700'
  };
  return colors[difficulty] || 'bg-gray-100 text-gray-700';
};

const getTypeIcon = (type: string) => {
  return '';
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

// Quest Card Component
const QuestCard = ({ 
  quest, 
  onManage,
  onPreview,
  onDelete,
  onToggleStatus
}: { 
  quest: Quest;
  onManage: (quest: Quest) => void;
  onPreview: (quest: Quest) => void;
  onDelete: (questId: string) => void;
  onToggleStatus: (questId: string) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group">
        {/* Gradient Header */}
        <div className={`h-2 bg-gradient-to-r ${getDayColor(quest.day)}`}></div>
        
        {/* Quest Image */}
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {!imageError ? (
            <img 
              src={quest.thumbnail} 
              alt={quest.title} 
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" 
              onError={() => setImageError(true)} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200"></div>
          )}
          
          {/* Day Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full border-2 font-bold text-sm ${getDayBadgeColor(quest.day)}`}>
            {quest.day}
          </div>
        </div>
        
        <div className="p-5">
          {/* Title & Type */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{quest.title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {quest.type}
              </span>
            </div>
          </div>
          

          
          {/* Action Button */}
          <button 
            onClick={() => setShowModal(true)} 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 rounded-xl font-medium transition-all shadow-sm"
          >
            Manage Quest
          </button>
        </div>
      </div>

      {/* Quest Actions Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={quest.title} size="sm">
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button 
              onClick={() => { 
                onManage(quest); 
                setShowModal(false); 
              }} 
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-colors font-medium"
            >
              <Settings className="w-5 h-5" />
              Edit Quest Content
            </button>
            
            <button 
              onClick={() => { 
                if (confirm(`Delete "${quest.title}"? This action cannot be undone.`)) { 
                  onDelete(quest.id); 
                  setShowModal(false); 
                } 
              }} 
              className="w-full inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl transition-colors font-medium"
            >
              <Trash2 className="w-5 h-5" />
              Delete Quest
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Main Component
export default function QuestManagementPage() {
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleManageQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setShowEditor(true);
  };

  const handlePreviewQuest = (quest: Quest) => {
    alert(`Preview functionality for ${quest.title} would open here!`);
  };

  const handleDeleteQuest = (questId: string) => {
    setQuests(quests.filter(q => q.id !== questId));
  };

  const handleToggleStatus = (questId: string) => {
    setQuests(quests.map(q => 
      q.id === questId 
        ? { ...q, status: q.status === 'Published' ? 'Draft' : 'Published' } 
        : q
    ));
  };

  // If editing a quest, show editor placeholder
  if (showEditor && selectedQuest) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Editor Header */}
          <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border">
            <button 
              onClick={() => { setShowEditor(false); setSelectedQuest(null); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Quests
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getDayBadgeColor(selectedQuest.day)}`}>
                  {selectedQuest.day}
                </span>
                <h1 className="text-2xl font-bold text-gray-900">{selectedQuest.title}</h1>
              </div>
              <p className="text-sm text-gray-600 mt-1">Quest Type: {selectedQuest.type}</p>
            </div>
          </div>

          {/* Editor Content Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quest Editor Coming Soon!</h2>
            <p className="text-gray-600 mb-6">
              This is where you'll edit the content for <strong>{selectedQuest.title}</strong>
            </p>
            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 max-w-2xl mx-auto">
              The editor will include fields specific to the <strong>{selectedQuest.type}</strong> quest type,
              allowing you to manage questions, images, descriptions, and all content for this quest.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quest Management</h1>
          <p className="text-gray-600">
            Manage all weekly quests and their content. Click on any quest card to edit its details.
          </p>
        </div>

        {/* Weekly Timeline Visualization */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Weekly Quest Timeline
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-1">
            {quests.map((quest, index) => (
              <div key={quest.id} className="flex-1 flex items-center gap-1">
                <div className={`flex-1 rounded-lg p-3 text-center transition-all cursor-pointer hover:scale-105 ${
                  quest.status === 'Published' 
                    ? `bg-gradient-to-r ${getDayColor(quest.day)} text-white shadow-md` 
                    : 'bg-gray-100 text-gray-500'
                }`}
                onClick={() => handleManageQuest(quest)}
                >
                  <div className="font-bold text-sm">{quest.day.slice(0, 3)}</div>
                  <div className="text-xs mt-1 truncate">{quest.title}</div>
                </div>
                {index < quests.length - 1 && (
                  <div className="hidden sm:block text-gray-300 text-xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quest Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {quests.map((quest) => (
            <QuestCard 
              key={quest.id} 
              quest={quest}
              onManage={handleManageQuest}
              onPreview={handlePreviewQuest}
              onDelete={handleDeleteQuest}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}