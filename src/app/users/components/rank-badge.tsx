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

// Enhanced Rank Card with full UI
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
      <div className={`bg-gray-100 rounded-2xl p-5 shadow-sm border-2 border-gray-300 ${className}`}>
        <div className="flex items-center gap-2">
          <Image src="/ranks/Pat.png" alt="Pat" width={28} height={28} className="object-contain" />
          <div>
            <p className="text-xs font-medium text-gray-600 uppercase">Rank Not Set</p>
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
      <div className={`bg-gray-100 rounded-2xl p-5 shadow-sm border-2 border-gray-300 ${className}`}>
        <p className="text-gray-500 text-center">Invalid Rank Data</p>
      </div>
    )
  }

  const nextRankInfo = nextPNPRank ? getRankInfo(nextPNPRank) : null
  
  return (
    <div className={`bg-blue-50 rounded-2xl p-5 shadow-sm border-2 border-blue-200 ${className}`}>
      {/* Position and PNP Rank Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {leaderboardPosition && <PositionBadge rank={leaderboardPosition} size="lg" />}
          <div>
            <p className="text-xs font-medium text-gray-500">Your Position</p>
            <p className="text-2xl font-semibold text-gray-800">#{leaderboardPosition || '?'}</p>
          </div>
        </div>
        <div className="text-right">
          <PNPRankBadge rank={rank} size="md" showName={false} showIcon={true} />
          <p className="text-xs font-medium text-gray-600 mt-1">{rankInfo.name}</p>
        </div>
      </div>

      {/* Level Display */}
      {level > 0 && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl px-4 py-3 mb-3 shadow-sm">
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-medium">Level</span>
            <span className="text-2xl font-bold">{level}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* XP Progress */}
        {totalXP > 0 && (
          <div className="bg-white rounded-xl p-3 border border-blue-200">
            <div className="flex justify-between text-xs mb-2 font-medium">
              <span className="text-gray-700">XP Progress</span>
              <span className="text-blue-600 font-semibold">{totalXP} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all shadow-sm"
                style={{ width: `${percentToNextLevel}%` }}
              ></div>
            </div>
            {xpToNextLevel > 0 && (
              <p className="text-xs text-gray-600 mt-1 font-medium">
                {xpToNextLevel} XP to Level {level + 1}
              </p>
            )}
          </div>
        )}

        {/* Rank Progression */}
        {nextPNPRank && xpToNextRank && nextRankInfo && (
          <div className="bg-white rounded-xl p-3 border border-blue-200">
            <p className="text-xs font-semibold mb-2 flex items-center text-gray-700">
              <TrendingUp size={14} className="mr-1 text-blue-500" />
              Next Rank: {nextRankInfo.shortName}
            </p>
            <div className="flex items-center justify-between">
              <PNPRankBadge rank={nextPNPRank} size="xs" showIcon={true} />
              <span className="text-xs font-medium text-gray-600">
                Need <span className="text-blue-600 font-semibold">{xpToNextRank} XP</span>
              </span>
            </div>
          </div>
        )}

        {/* Climb to next position */}
        {xpBehindNext !== null && xpBehindNext > 0 && (
          <div className="bg-white rounded-xl p-3 border border-blue-200">
            <p className="text-xs font-semibold mb-1 flex items-center text-gray-700">
              <TrendingUp size={14} className="mr-1 text-blue-500" />
              Catch the next player!
            </p>
            <p className="text-xs font-medium text-gray-600">
              Need <span className="text-blue-600 font-semibold">{xpBehindNext} more XP</span>
            </p>
          </div>
        )}

        {/* Badge stats */}
        {totalBadges > 0 && (
          <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-blue-200">
            <span className="flex items-center text-sm font-medium text-gray-700">
              <Trophy size={16} className="mr-2 text-blue-500" />
              Badges
            </span>
            <span className="font-semibold text-base text-gray-800">
              {earnedBadges}/{totalBadges}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}