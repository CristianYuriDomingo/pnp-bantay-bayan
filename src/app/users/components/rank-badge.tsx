import React, { useState } from 'react'
import Image from 'next/image'
import { PNPRank } from '@/types/rank'
import { getRankInfo } from '@/lib/rank-config'
import { Crown, TrendingUp, Trophy } from 'lucide-react'

interface RankBadgeProps {
  rank?: PNPRank | string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  showIcon?: boolean
  className?: string
}

export const PNPRankBadge: React.FC<RankBadgeProps> = ({ 
  rank, 
  size = 'md', 
  showName = false,
  showIcon = true,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  if (!rank) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full font-semibold border-2 text-gray-500 bg-gray-100 border-gray-300 text-xs px-2 py-0.5 ${className}`}>
        {showIcon && <Image src="/ranks/Pat.png" alt="Pat" width={16} height={16} className="object-contain" />}
        <span>Pat</span>
      </div>
    )
  }

  let rankInfo
  try {
    rankInfo = getRankInfo(rank as PNPRank)
  } catch (error) {
    rankInfo = getRankInfo('Pat' as PNPRank)
  }
  
  if (!rankInfo) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full font-semibold border-2 text-gray-500 bg-gray-100 border-gray-300 text-xs px-2 py-0.5 ${className}`}>
        {showIcon && <Image src="/ranks/Pat.png" alt="Pat" width={16} height={16} className="object-contain" />}
        <span>Pat</span>
      </div>
    )
  }
  
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
    xl: 'text-lg px-5 py-2.5'
  }

  const iconSizes = {
    xs: 18,
    sm: 22,
    md: 28,
    lg: 34,
    xl: 40
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-semibold border-2 ${rankInfo.color} ${rankInfo.bgColor} border-current ${sizeClasses[size]} ${className} relative`}>
      {showIcon && (
        <div 
          className="relative cursor-help"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Image 
            src={rankInfo.icon} 
            alt={rankInfo.code} 
            width={iconSizes[size]} 
            height={iconSizes[size]} 
            className="object-contain"
          />
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
              {rankInfo.name}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </div>
      )}
      <span>{rankInfo.code}</span>
      {showName && size !== 'xs' && <span className="font-normal">• {rankInfo.shortName}</span>}
    </div>
  )
}

// Position badge for leaderboard ranking
export const PositionBadge: React.FC<{ rank: number; size?: 'sm' | 'md' | 'lg' }> = ({ rank, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base'
  }

  if (rank === 1) {
    return (
      <div className={`${sizeClasses[size]} bg-yellow-400 rounded-full flex items-center justify-center shadow-sm`}>
        <Crown className="text-yellow-700" size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
      </div>
    )
  }

  if (rank === 2) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center shadow-sm`}>
        <Crown className="text-gray-600" size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
      </div>
    )
  }

  if (rank === 3) {
    return (
      <div className={`${sizeClasses[size]} bg-orange-400 rounded-full flex items-center justify-center shadow-sm`}>
        <Crown className="text-orange-700" size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center font-semibold text-gray-700 border-2 border-gray-200`}>
      {rank}
    </div>
  )
}

// Enhanced Rank Card with Duolingo-style UI
interface RankCardProps {
  rank?: PNPRank | string | null
  leaderboardPosition?: number
  totalXP?: number
  level?: number
  xpToNextLevel?: number
  percentToNextLevel?: number
  nextPNPRank?: PNPRank | null
  xpToNextRank?: number | null
  xpBehindNext?: number | null
  earnedBadges?: number
  totalBadges?: number
  className?: string
}

export const RankCard: React.FC<RankCardProps> = ({ 
  rank, 
  leaderboardPosition,
  totalXP = 0,
  level = 1,
  xpToNextLevel = 0,
  percentToNextLevel = 0,
  nextPNPRank = null,
  xpToNextRank = null,
  xpBehindNext = null,
  earnedBadges = 0,
  totalBadges = 0,
  className = '' 
}) => {
  if (!rank) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-200 ${className}`}>
        <div className="flex items-center gap-2">
          <Image src="/ranks/Pat.png" alt="Pat" width={28} height={28} className="object-contain" />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Rank Not Set</p>
            <p className="text-sm text-gray-500 mt-1">Calculating rank...</p>
          </div>
        </div>
      </div>
    )
  }

  let rankInfo
  try {
    rankInfo = getRankInfo(rank as PNPRank)
  } catch (error) {
    rankInfo = getRankInfo('Pat' as PNPRank)
  }
  
  if (!rankInfo) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-200 ${className}`}>
        <p className="text-gray-500 text-center">Invalid Rank Data</p>
      </div>
    )
  }

  const nextRankInfo = nextPNPRank ? getRankInfo(nextPNPRank) : null
  
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-200 max-w-lg mx-auto ${className}`}>
      {/* Header with Position and Rank */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Your Rank</p>
          <p className="text-4xl font-black text-gray-800">#{leaderboardPosition || '?'}</p>
        </div>
        <PNPRankBadge rank={rank} size="lg" showName={false} showIcon={true} />
      </div>

      {/* Level Display - Duolingo Style */}
      {level > 0 && (
        <div className="bg-blue-500 rounded-2xl px-6 py-4 mb-4 shadow-md">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-bold uppercase tracking-wide">Level</span>
            <span className="text-5xl font-black">{level}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* XP Progress - Clean Style */}
        {totalXP > 0 && (
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm font-bold text-gray-700">Total XP</span>
              <span className="text-3xl font-black text-blue-500">{totalXP}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${percentToNextLevel}%` }}
              ></div>
            </div>
            {xpToNextLevel > 0 && (
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {xpToNextLevel} XP to Level {level + 1}
              </p>
            )}
          </div>
        )}

        {/* Next Rank - Clean Style */}
        {nextPNPRank && xpToNextRank && nextRankInfo && (
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-700 flex items-center">
                <TrendingUp size={16} className="mr-2 text-blue-500" />
                Next Rank
              </p>
              <PNPRankBadge rank={nextPNPRank} size="sm" showIcon={true} />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Need <span className="text-blue-600 font-bold">{xpToNextRank} XP</span>
            </p>
          </div>
        )}

        {/* Badge Stats - Yellow Style like Duolingo */}
        {totalBadges > 0 && (
          <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-base font-bold text-gray-700">
                <Trophy size={20} className="mr-2 text-yellow-600" />
                Badges
              </span>
              <span className="font-black text-3xl text-gray-800">
                {earnedBadges}/{totalBadges}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}