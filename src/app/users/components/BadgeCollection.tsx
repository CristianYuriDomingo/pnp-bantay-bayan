import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Trophy, Star, Award, Crown, Zap, TrendingUp, Share2 } from 'lucide-react';

// Import your actual hooks and types
import { useAllBadges, BadgeWithProgress } from '@/hooks/use-all-badges';
import { useBadgeNotifications } from '@/hooks/use-user-badges';

interface BadgeCategory {
  name: string;
  badges: BadgeWithProgress[];
  earnedCount: number;
  totalCount: number;
  totalXP: number;
  earnedXP: number;
}

const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'Common': return 'text-gray-600 bg-gray-100 border-gray-300';
    case 'Rare': return 'text-blue-600 bg-blue-100 border-blue-300';
    case 'Epic': return 'text-purple-600 bg-purple-100 border-purple-300';
    case 'Legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    default: return 'text-gray-600 bg-gray-100 border-gray-300';
  }
};

const getRarityBgGradient = (rarity: string): string => {
  switch (rarity) {
    case 'Common': return 'from-gray-50 to-gray-100';
    case 'Rare': return 'from-blue-50 to-blue-100';
    case 'Epic': return 'from-purple-50 to-purple-100';
    case 'Legendary': return 'from-yellow-50 to-yellow-100';
    default: return 'from-gray-50 to-gray-100';
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

// Badge Detail Modal Component
interface BadgeModalProps {
  badge: BadgeWithProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

const BadgeDetailModal: React.FC<BadgeModalProps> = ({ badge, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !badge || !mounted) return null;

  const handleShare = () => {
    const text = `I just earned the "${badge.name}" badge! 🏆`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <>
      {/* Full Page Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className={`bg-gradient-to-br ${getRarityBgGradient(badge.rarity)} rounded-2xl shadow-2xl max-w-sm w-full transform transition-all relative`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-8">
            {/* Badge Image Container */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg border-4 border-white">
                  <img
                    src={badge.image}
                    alt={badge.name}
                    className={`w-full h-full object-cover ${
                      badge.isEarned ? '' : 'grayscale opacity-60'
                    }`}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="fallback-icon absolute inset-0 bg-gray-100 items-center justify-center text-gray-400" style={{ display: 'none' }}>
                    <Trophy size={64} />
                  </div>
                </div>

                {!badge.isEarned && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image 
                      src="/Profile/BadgeLockedIcon.png" 
                      alt="Locked"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                )}

                {badge.isEarned && (
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-400 to-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-4 border-white">
                    <span className="text-lg">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* Badge Name */}
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              {badge.name}
            </h2>

            {/* Rarity Badge */}
            <div className="flex justify-center mb-4">
              <span className={`px-4 py-1 text-sm font-semibold rounded-full border-2 ${getRarityColor(badge.rarity)}`}>
                {badge.rarity}
              </span>
            </div>

            {/* Description */}
            <p className="text-center text-gray-700 mb-6 text-sm leading-relaxed">
              {badge.description}
            </p>

            {/* Stats Section */}
            <div className="bg-white bg-opacity-70 rounded-xl p-4 mb-6 space-y-3">
              {/* XP Value */}
              {(badge as any).xpValue > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700">
                    <Zap size={18} className="text-yellow-500 mr-2" />
                    <span className="font-medium">XP Reward</span>
                  </div>
                  <span className="font-bold text-yellow-600">+{(badge as any).xpValue}</span>
                </div>
              )}

              {/* Category */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-700">
                  <Award size={18} className="text-blue-500 mr-2" />
                  <span className="font-medium">Category</span>
                </div>
                <span className="font-semibold text-gray-600">{badge.category}</span>
              </div>

              {/* Earned Date */}
              {badge.isEarned && badge.earnedAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700">
                    <Trophy size={18} className="text-green-500 mr-2" />
                    <span className="font-medium">Earned</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {/* Lock Reason for Unearn badges */}
              {!badge.isEarned && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700 gap-2">
                    <Image 
                      src="/Profile/BadgeLockedIcon.png" 
                      alt="Locked"
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                    <span className="font-medium">Status</span>
                  </div>
                  <span className="font-semibold text-red-600">Locked</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
              {badge.isEarned && (
                <button
                  onClick={handleShare}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  {copied ? 'Copied!' : 'Share'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

const BadgeCollection: React.FC = () => {
  const { badges, statistics, loading, error } = useAllBadges();
  const { newBadges, showNotification, dismissNotification } = useBadgeNotifications();
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithProgress | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'learning' | 'quiz'>('learning');

  // Separate quiz badges from learning badges
  const quizBadges = React.useMemo(() => {
    return badges.filter(badge => 
      badge.triggerType === 'quiz_mastery' || 
      badge.triggerType === 'parent_quiz_mastery'
    );
  }, [badges]);
  
  const learningBadges = React.useMemo(() => {
    return badges.filter(badge => 
      badge.triggerType === 'lesson_complete' || 
      badge.triggerType === 'module_complete'
    );
  }, [badges]);

  // Calculate XP statistics
  const xpStats = React.useMemo(() => {
    const totalXP = badges.reduce((sum, badge) => sum + ((badge as any).xpValue || 0), 0);
    const earnedXP = badges
      .filter(b => b.isEarned)
      .reduce((sum, badge) => sum + ((badge as any).xpValue || 0), 0);
    
    const quizXP = quizBadges
      .filter(b => b.isEarned)
      .reduce((sum, badge) => sum + ((badge as any).xpValue || 0), 0);
    
    const learningXP = learningBadges
      .filter(b => b.isEarned)
      .reduce((sum, badge) => sum + ((badge as any).xpValue || 0), 0);

    return {
      total: totalXP,
      earned: earnedXP,
      quiz: quizXP,
      learning: learningXP,
      percentage: totalXP > 0 ? Math.round((earnedXP / totalXP) * 100) : 0
    };
  }, [badges, quizBadges, learningBadges]);

  // Group learning badges by category with XP
  const learningBadgeCategories: BadgeCategory[] = React.useMemo(() => {
    if (!learningBadges.length) return [];

    const categoryMap = new Map<string, BadgeWithProgress[]>();
    
    learningBadges.forEach(badge => {
      if (!categoryMap.has(badge.category)) {
        categoryMap.set(badge.category, []);
      }
      categoryMap.get(badge.category)?.push(badge);
    });

    return Array.from(categoryMap.entries()).map(([name, categoryBadges]) => ({
      name,
      badges: categoryBadges.sort((a, b) => {
        if (a.isEarned !== b.isEarned) return b.isEarned ? 1 : -1;
        const rarityOrder: Record<string, number> = { 'Legendary': 0, 'Epic': 1, 'Rare': 2, 'Common': 3 };
        return (rarityOrder[a.rarity] || 3) - (rarityOrder[b.rarity] || 3);
      }),
      earnedCount: categoryBadges.filter(b => b.isEarned).length,
      totalCount: categoryBadges.length,
      totalXP: categoryBadges.reduce((sum, b) => sum + ((b as any).xpValue || 0), 0),
      earnedXP: categoryBadges.filter(b => b.isEarned).reduce((sum, b) => sum + ((b as any).xpValue || 0), 0)
    }));
  }, [learningBadges]);

  const filteredCategories = selectedCategory === 'All' 
    ? learningBadgeCategories 
    : learningBadgeCategories.filter(cat => cat.name === selectedCategory);

  const BadgeIcon: React.FC<{ badge: BadgeWithProgress; size?: number }> = ({ badge, size = 64 }) => {
    const isEarned = badge.isEarned;
    
    return (
      <div
        className="relative transition-transform hover:scale-105 cursor-pointer group"
        style={{ width: size, height: size }}
        onClick={() => setSelectedBadge(badge)}
      >
        <div className={`w-full h-full rounded-lg overflow-hidden ${
          isEarned ? 'shadow-md' : ''
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
          
          <div className="fallback-icon absolute inset-0 bg-gray-100 items-center justify-center text-gray-400" style={{ display: 'none' }}>
            <Trophy size={size / 2} />
          </div>
        </div>

        {!isEarned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
            <img 
              src="/Profile/BadgeLockedIcon.png" 
              alt="Locked"
              className="w-full h-full object-contain p-2"
            />
          </div>
        )}

        {isEarned && (
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>
    );
  };

  const BadgeNotification: React.FC = () => {
    if (!showNotification || !newBadges.length) return null;

    return (
      <div className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
        <div className="flex items-center space-x-2">
          <Trophy size={20} />
          <div>
            <p className="font-bold">New Badge Earned!</p>
            <p className="text-sm">{newBadges[0].name}</p>
            {(newBadges[0] as any).xpValue > 0 && (
              <p className="text-xs flex items-center mt-1">
                <Zap size={12} className="mr-1" />
                +{(newBadges[0] as any).xpValue} XP
              </p>
            )}
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
      <BadgeDetailModal 
        badge={selectedBadge} 
        isOpen={!!selectedBadge} 
        onClose={() => setSelectedBadge(null)} 
      />
      
      {/* Header with statistics */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Badge Collection</h2>
        
        {/* Rarity Breakdown */}
        <div className="bg-white bg-opacity-60 rounded-lg p-4 shadow-sm mb-4">
          <h3 className="font-semibold text-gray-700 mb-3">Collection by Rarity</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700">{statistics?.rarityBreakdown.Common}</div>
              <div className="text-xs text-gray-500 flex items-center justify-center">
                <Award size={12} className="mr-1" />
                Common
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{statistics?.rarityBreakdown.Rare}</div>
              <div className="text-xs text-blue-500 flex items-center justify-center">
                <Star size={12} className="mr-1" />
                Rare
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{statistics?.rarityBreakdown.Epic}</div>
              <div className="text-xs text-purple-500 flex items-center justify-center">
                <Trophy size={12} className="mr-1" />
                Epic
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{statistics?.rarityBreakdown.Legendary}</div>
              <div className="text-xs text-yellow-500 flex items-center justify-center">
                <Crown size={12} className="mr-1" />
                Legendary
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6 border-b-2 border-blue-200">
        <button
          onClick={() => setActiveTab('learning')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'learning'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
              : 'text-gray-600 hover:text-blue-500'
          }`}
        >
          Learning Badges
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'quiz'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
              : 'text-gray-600 hover:text-blue-500'
          }`}
        >
          Quiz Badges
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'learning' && (
        <div>
          {/* Category filter */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Learning Path Badges</h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="All">All Categories</option>
              {learningBadgeCategories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-6">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12 bg-white bg-opacity-60 rounded-lg">
                <Trophy size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No learning badges yet</h3>
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
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                    {category.badges.map((badge) => (
                      <div key={badge.id} className="flex flex-col items-center">
                        <BadgeIcon badge={badge} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'quiz' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Quiz Mastery Badges</h3>
          </div>

          {quizBadges.length === 0 ? (
            <div className="text-center py-12 bg-white bg-opacity-60 rounded-lg">
              <Trophy size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz badges yet</h3>
              <p className="text-gray-600">Complete quizzes to earn mastery badges!</p>
            </div>
          ) : (
            <div className="bg-white bg-opacity-60 rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {quizBadges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center">
                    <BadgeIcon badge={badge} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;