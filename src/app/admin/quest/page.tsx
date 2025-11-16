//app/admin/quest/page.tsx
'use client';
import { useRouter } from 'next/navigation';

// Types
interface Quest {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  title: string;
  type: 'Puzzle' | 'True/False' | 'Matching' | 'Inspection' | 'Line-Up';
  thumbnail: string;
}

// Quest data
const quests: Quest[] = [
  {
    id: 'quest-monday',
    day: 'Monday',
    title: 'Suspect Line-Up',
    type: 'Line-Up',
    thumbnail: '/Quest/Admin/mondayIcon.png',
  },
  {
    id: 'quest-tuesday',
    day: 'Tuesday',
    title: 'Safety True or False',
    type: 'True/False',
    thumbnail: '/Quest/Admin/tuesdayIcon.png',
  },
  {
    id: 'quest-wednesday',
    day: 'Wednesday',
    title: 'Code the Call',
    type: 'Puzzle',
    thumbnail: '/Quest/Admin/wednesdayIcon.png',
  },
  {
    id: 'quest-thursday',
    day: 'Thursday',
    title: 'Inspection Game',
    type: 'Inspection',
    thumbnail: '/Quest/Admin/thursdayIcon.png',
  },
  {
    id: 'quest-friday',
    day: 'Friday',
    title: 'Guess the Rank ',
    type: 'Matching',
    thumbnail: '/Quest/Admin/fridayIcon.png',
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

// Quest Card Component
const QuestCard = ({ quest }: { quest: Quest }) => {
  const router = useRouter();

  const handleNavigate = () => {
    // Navigate to specific quest page
    router.push(`/admin/quest/${quest.day.toLowerCase()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer" onClick={handleNavigate}>
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${getDayColor(quest.day)}`}></div>
      
      {/* Quest Image */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img 
          src={quest.thumbnail} 
          alt={quest.title} 
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" 
        />
        
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
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 rounded-xl font-medium transition-all shadow-sm"
        >
          Manage Quest
        </button>
      </div>
    </div>
  );
};

// Main Component
export default function QuestManagementPage() {
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
                <div 
                  className={`flex-1 rounded-lg p-3 text-center transition-all cursor-pointer hover:scale-105 bg-gradient-to-r ${getDayColor(quest.day)} text-white shadow-md`}
                  onClick={() => window.location.href = `/admin/quest/${quest.day.toLowerCase()}`}
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
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      </div>
    </div>
  );
}