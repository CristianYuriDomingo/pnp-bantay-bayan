import React, { useState } from 'react';
import { Lock } from 'lucide-react';

// TypeScript interfaces
interface Badge {
  id: number;
  name: string;
  imageUrl: string;
  earned: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface BadgeCategory {
  name: string;
  count: number;
  badges: Badge[];
}

// Sample badge data structure with actual image paths
const badgeCategories: BadgeCategory[] = [
  {
    name: "Crime Prevention",
    count: 5,
    badges: [
      {
        id: 1,
        name: "Vehicle Protection...",
        imageUrl: "/BadgeImage/CrimePrevention/anti-carnapping.png",
        earned: true,
        rarity: "common"
      },
      {
        id: 2,
        name: "Theft Prevention...",
        imageUrl: "/BadgeImage/CrimePrevention/anti-theft.png",
        earned: true,
        rarity: "common"
      },
      {
        id: 3,
        name: "Firearm Safety Advocate",
        imageUrl: "/BadgeImage/CrimePrevention/illegal-firearms.png",
        earned: false,
        rarity: "rare"
      },
      {
        id: 4,
        name: "Responsible Gaming...",
        imageUrl: "/BadgeImage/CrimePrevention/anti-gambling.png",
        earned: false,
        rarity: "rare"
      },
      {
        id: 5,
        name: "Sexual Assault Prevention...",
        imageUrl: "/BadgeImage/CrimePrevention/anti-rape.png",
        earned: false,
        rarity: "common"
      }
    ]
  },
  {
    name: "Cyber Security",
    count: 5,
    badges: [
      {
        id: 6,
        name: "Data Guardian",
        imageUrl: "/BadgeImage/CyberSecurity/data-protection.png",
        earned: false,
        rarity: "common"
      },
      {
        id: 7,
        name: "Privacy Protector",
        imageUrl: "/BadgeImage/CyberSecurity/privacy-protection.png",
        earned: false,
        rarity: "common"
      },
      {
        id: 8,
        name: "Informed Citizen",
        imageUrl: "/BadgeImage/CyberSecurity/media-literacy.png",
        earned: false,
        rarity: "rare"
      },
      {
        id: 9,
        name: "Digital Safety Advocate",
        imageUrl: "/BadgeImage/CyberSecurity/internet-safety.png",
        earned: false,
        rarity: "rare"
      },
      {
        id: 10,
        name: "Fraud Prevention...",
        imageUrl: "/BadgeImage/CyberSecurity/scam-awareness.png",
        earned: false,
        rarity: "rare"
      }
    ]
  },
  {
    name: "Emergency Preparedness",
    count: 5,
    badges: [
      {
        id: 11,
        name: "Disaster Response...",
        imageUrl: "/BadgeImage/EmergencyPreparedness/disaster-response.png",
        earned: false,
        rarity: "epic"
      },
      {
        id: 12,
        name: "Evacuation Safety Expert",
        imageUrl: "/BadgeImage/EmergencyPreparedness/evacuation-expert.png",
        earned: false,
        rarity: "rare"
      },
      {
        id: 13,
        name: "Drill Preparedness...",
        imageUrl: "/BadgeImage/EmergencyPreparedness/drill-preparedness.png",
        earned: false,
        rarity: "rare"
      },
      {
        id: 14,
        name: "First Aid Responder",
        imageUrl: "/BadgeImage/EmergencyPreparedness/first-aid.png",
        earned: false,
        rarity: "legendary"
      },
      {
        id: 15,
        name: "Disaster Preparedness...",
        imageUrl: "/BadgeImage/EmergencyPreparedness/disaster-preparedness.png",
        earned: false,
        rarity: "epic"
      }
    ]
  }
];

const BadgeCollection: React.FC = () => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const getRarityColor = (rarity: Badge['rarity']): string => {
    switch (rarity) {
      case 'legendary': return 'bg-purple-500';
      case 'epic': return 'bg-pink-500';
      case 'rare': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  const BadgeIcon: React.FC<{ badge: Badge; size?: number }> = ({ badge, size = 64 }) => {
    const baseClasses = "relative transition-transform hover:scale-105 cursor-pointer";

    return (
      <div
        className={baseClasses}
        style={{ width: size, height: size }}
        onClick={() => setSelectedBadge(badge)}
      >
        <img
          src={badge.imageUrl}
          alt={badge.name}
          className={`w-full h-full object-contain drop-shadow-md ${
            badge.earned ? '' : 'grayscale opacity-50'
          }`}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.target as HTMLImageElement;
            target.src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxjaXJjbGUgY3g9IjEyIiBjeT0iOCIgcj0iNyI+PC9jaXJjbGU+Cjxwb2x5bGluZSBwb2ludHM9IjguMjEgMTMuODkgNyAyMyAxMiAyMCAxNyAyMyAxNS43OSAxMy44OCI+PC9wb2x5bGluZT4KPC9zdmc+Cjwvc3ZnPgo=';
          }}
        />

        {/* Lock icon overlay for unearned badges */}
        {!badge.earned && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock size={size / 3} className="text-gray-500" />
          </div>
        )}

        {/* Rarity indicator dot */}
        <div
          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getRarityColor(
            badge.rarity
          )}`}
        ></div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 p-6 min-h-[400px] rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">
        Badge Collection
      </h2>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center">
              <BadgeIcon badge={selectedBadge} size={96} />
              <h3 className="text-xl font-bold text-center mb-2 mt-4">
                {selectedBadge.name}
              </h3>
              <p className="text-gray-600 text-center mb-3">
                {selectedBadge.earned
                  ? `Congratulations! You've earned this badge.`
                  : `Complete the required modules to earn this badge.`}
              </p>
              <span
                className={`mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                  selectedBadge.rarity === 'legendary'
                    ? 'bg-purple-100 text-purple-800'
                    : selectedBadge.rarity === 'epic'
                    ? 'bg-pink-100 text-pink-800'
                    : selectedBadge.rarity === 'rare'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {selectedBadge.rarity.charAt(0).toUpperCase() +
                  selectedBadge.rarity.slice(1)}
              </span>
              <div className="mt-6 flex gap-3">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  onClick={() => setSelectedBadge(null)}
                >
                  Close
                </button>
                <button
                  className={`px-4 py-2 text-white rounded-md transition-colors ${
                    selectedBadge.earned
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {selectedBadge.earned ? 'View Details' : 'Start Module'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Categories */}
      <div className="space-y-8">
        {badgeCategories.map((category) => (
          <div
            key={category.name}
            className="bg-white bg-opacity-60 rounded-lg p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-blue-200 pb-2">
              {category.name} ({category.count})
            </h3>

            <div className="grid grid-cols-5 gap-6">
              {category.badges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center">
                  <BadgeIcon badge={badge} />
                  <span className="text-center text-xs text-gray-700 mt-2 max-w-[80px] leading-tight">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rarity Legend */}
      <div className="mt-6 p-3 bg-white bg-opacity-60 rounded-lg flex flex-wrap justify-center gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-xs text-gray-700">Common</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-xs text-gray-700">Rare</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
          <span className="text-xs text-gray-700">Epic</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-xs text-gray-700">Legendary</span>
        </div>
      </div>
    </div>
  );
};

export default BadgeCollection;
