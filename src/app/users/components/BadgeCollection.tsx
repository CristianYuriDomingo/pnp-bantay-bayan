import React, { useState, useEffect } from 'react';
import { Lock, Trophy, Star, Award, Crown } from 'lucide-react';

// Import your actual hooks
import { useAllBadges, groupBadgesByCategory } from '@/hooks/use-all-badges';
import { useBadgeNotifications } from '@/hooks/use-user-badges';

// TypeScript interfaces to match your backend
interface BadgeWithProgress {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_complete' | 'manual';
  triggerValue: string;
  prerequisites?: string[];
  earnedAt: Date | null;
  isEarned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BadgeCategory {
  name: string;
  badges: BadgeWithProgress[];
  earnedCount: number;
  totalCount: number;
}

interface BadgeStats {
  totalEarned: number;
  totalAvailable: number;
  completionPercentage: number;
  rarityBreakdown: {
    Common: number;
    Rare: number;
    Epic: number;
    Legendary: number;
  };
  latestBadge: BadgeWithProgress | null;
}

// Remove mock hook implementations - use your actual hooks instead
// const useCurrentUserId = () => {
//   return "mock-user-id";
// };

// const useCurrentUser = () => {
//   return {
//     user: {
//       email: "user@example.com"
//     }
//   };
// };

// const useAllBadges = () => {
//   // Mock implementation - remove this
// };

// const useBadgeNotifications = () => {
//   // Mock implementation - remove this
// };

// Utility functions
const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'Common': return 'text-gray-600 bg-gray-100 border-gray-300';
    case 'Rare': return 'text-blue-600 bg-blue-100 border-blue-300';
    case 'Epic': return 'text-purple-600 bg-purple-100 border-purple-300';
    case 'Legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    default: return 'text-gray-600 bg-gray-100 border-gray-300';
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'Common': return <Award size={16} className="text-gray-500" />;
    case 'Rare': return <Star size={16} className="text-blue-500" />;
    case 'Epic': return <Trophy size={16} className="text-purple-500" />;
    case 'Legendary': return <Crown size={16} className="text-yellow-500" />;
    default: return <Award size={16} className="text-gray-500" />;
  }
};

const BadgeCollection: React.FC = () => {
  const { badges, statistics, loading, error } = useAllBadges();
  const { newBadges, showNotification, dismissNotification } = useBadgeNotifications();
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithProgress | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Group badges by category - FIXED: Changed Badge[] to BadgeWithProgress[]
  const badgeCategories: BadgeCategory[] = React.useMemo(() => {
    if (!badges.length) return [];

    const categoryMap = new Map<string, BadgeWithProgress[]>();
    
    badges.forEach(badge => {
      if (!categoryMap.has(badge.category)) {
        categoryMap.set(badge.category, []);
      }
      categoryMap.get(badge.category)?.push(badge);
    });

    return Array.from(categoryMap.entries()).map(([name, categoryBadges]) => ({
      name,
      badges: categoryBadges.sort((a, b) => {
        // Sort earned badges first, then by rarity
        if (a.isEarned !== b.isEarned) return b.isEarned ? 1 : -1;
        
        const rarityOrder: Record<string, number> = { 'Legendary': 0, 'Epic': 1, 'Rare': 2, 'Common': 3 };
        return (rarityOrder[a.rarity] || 3) - (rarityOrder[b.rarity] || 3);
      }),
      earnedCount: categoryBadges.filter(b => b.isEarned).length,
      totalCount: categoryBadges.length
    }));
  }, [badges]);

  const filteredCategories = selectedCategory === 'All' 
    ? badgeCategories 
    : badgeCategories.filter(cat => cat.name === selectedCategory);

  const BadgeIcon: React.FC<{ badge: BadgeWithProgress; size?: number }> = ({ badge, size = 64 }) => {
    const isEarned = badge.isEarned;
    
    return (
      <div
        className="relative transition-transform hover:scale-105 cursor-pointer group"
        style={{ width: size, height: size }}
        onClick={() => setSelectedBadge(badge)}
      >
        <div className={`w-full h-full rounded-lg border-2 overflow-hidden ${
          isEarned ? 'border-green-300 shadow-md' : 'border-gray-200'
        }`}>
          <img
            src={badge.image}
            alt={badge.name}
            className={`w-full h-full object-cover ${
              isEarned ? '' : 'grayscale opacity-50'
            }`}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          
          {/* Fallback icon */}
          <div className="fallback-icon absolute inset-0 bg-gray-100 items-center justify-center text-gray-400" style={{ display: 'none' }}>
            <Trophy size={size / 2} />
          </div>
        </div>

        {/* Lock overlay for unearned badges */}
        {!isEarned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
            <Lock size={size / 3} className="text-gray-600" />
          </div>
        )}

        {/* Rarity indicator */}
        <div className="absolute -top-1 -right-1">
          {getRarityIcon(badge.rarity)}
        </div>

        {/* Earned indicator */}
        {isEarned && (
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}

        {/* Hover tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {badge.name}
        </div>
      </div>
    );
  };

  // Badge notification component
  const BadgeNotification: React.FC = () => {
    if (!showNotification || !newBadges.length) return null;

    return (
      <div className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
        <div className="flex items-center space-x-2">
          <Trophy size={20} />
          <div>
            <p className="font-bold">New Badge Earned!</p>
            <p className="text-sm">{newBadges[0].name}</p>
          </div>
          <button onClick={dismissNotification} className="ml-2 text-white hover:text-gray-200">
            ×
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 p-6 min-h-[400px] rounded-lg shadow-sm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your badges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 min-h-[400px] rounded-lg shadow-sm flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading badges</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 p-6 min-h-[400px] rounded-lg shadow-sm">
      <BadgeNotification />
      
      {/* Header with statistics */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Badge Collection</h2>
          {statistics && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{statistics.totalEarned} of {statistics.totalAvailable} earned</span>
              <span className="font-medium text-blue-600">{statistics.completionPercentage}% complete</span>
            </div>
          )}
        </div>
        
        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="All">All Categories</option>
          {badgeCategories.map(category => (
            <option key={category.name} value={category.name}>
              {category.name} ({category.earnedCount}/{category.totalCount})
            </option>
          ))}
        </select>
      </div>

      {/* Statistics overview */}
      {statistics && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Progress Overview</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700">{statistics.rarityBreakdown.Common}</div>
              <div className="text-xs text-gray-500 flex items-center justify-center">
                <Award size={12} className="mr-1" />
                Common
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{statistics.rarityBreakdown.Rare}</div>
              <div className="text-xs text-blue-500 flex items-center justify-center">
                <Star size={12} className="mr-1" />
                Rare
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{statistics.rarityBreakdown.Epic}</div>
              <div className="text-xs text-purple-500 flex items-center justify-center">
                <Trophy size={12} className="mr-1" />
                Epic
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{statistics.rarityBreakdown.Legendary}</div>
              <div className="text-xs text-yellow-500 flex items-center justify-center">
                <Crown size={12} className="mr-1" />
                Legendary
              </div>
            </div>
          </div>
        </div>
      )}

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
                {selectedBadge.description}
              </p>
              
              {selectedBadge.earnedAt && (
                <p className="text-sm text-green-600 mb-2">
                  Earned on {selectedBadge.earnedAt.toLocaleDateString()}
                </p>
              )}
              
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRarityColor(selectedBadge.rarity)}`}>
                {selectedBadge.rarity}
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
                    selectedBadge.isEarned
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {selectedBadge.isEarned ? 'View Progress' : 'Start Learning'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Categories */}
      <div className="space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
            <p className="text-gray-600">Start learning to earn your first badges!</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.name}
              className="bg-white bg-opacity-60 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4 border-b border-blue-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-700">
                  {category.name}
                </h3>
                <span className="text-sm text-gray-500">
                  {category.earnedCount}/{category.totalCount} earned
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {category.badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center">
                    <BadgeIcon badge={badge} />
                    <span className="text-center text-xs text-gray-700 mt-2 max-w-[80px] leading-tight">
                      {badge.name}
                    </span>
                    {badge.isEarned && (
                      <span className="text-xs text-green-600 mt-1">
                        Earned {badge.earnedAt?.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BadgeCollection;