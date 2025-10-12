import React from 'react'
import { PNPRank } from '@/types/rank'
import { getRankInfo } from '@/lib/rank-config'
import { Crown, Star, Shield, Award } from 'lucide-react'

interface RankBadgeProps {
  rank: PNPRank
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
  const rankInfo = getRankInfo(rank)
  
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
    xl: 'text-lg px-5 py-2.5'
  }

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20
  }

  const getRankIcon = () => {
    if (rank === 'PGEN') return <Crown size={iconSizes[size]} className="text-yellow-500" />
    if (rankInfo.category === 'Officer') return <Star size={iconSizes[size]} className="text-blue-500" />
    return <Shield size={iconSizes[size]} className="text-gray-500" />
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-semibold border-2 ${rankInfo.color} ${rankInfo.bgColor} border-current ${sizeClasses[size]} ${className}`}>
      {showIcon && getRankIcon()}
      <span>{rankInfo.code}</span>
      {showName && size !== 'xs' && <span className="font-normal">• {rankInfo.shortName}</span>}
    </div>
  )
}

// Detailed rank card component
interface RankCardProps {
  rank: PNPRank
  leaderboardPosition?: number
  className?: string
}

export const RankCard: React.FC<RankCardProps> = ({ 
  rank, 
  leaderboardPosition,
  className = '' 
}) => {
  const rankInfo = getRankInfo(rank)
  
  return (
    <div className={`bg-gradient-to-br ${rankInfo.bgColor} to-white rounded-xl p-4 border-2 ${rankInfo.color} border-opacity-30 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {rank === 'PGEN' ? (
            <Crown className={`${rankInfo.color}`} size={24} />
          ) : rankInfo.category === 'Officer' ? (
            <Star className={`${rankInfo.color}`} size={24} />
          ) : (
            <Shield className={`${rankInfo.color}`} size={24} />
          )}
          <div>
            <p className="text-xs font-medium text-gray-600 uppercase">Current Rank</p>
            <h3 className={`text-xl font-bold ${rankInfo.color}`}>{rankInfo.code}</h3>
          </div>
        </div>
        {leaderboardPosition && (
          <div className="text-right">
            <p className="text-xs font-medium text-gray-600">Position</p>
            <p className="text-2xl font-bold text-gray-800">#{leaderboardPosition}</p>
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 pt-2 mt-2">
        <p className={`font-semibold ${rankInfo.color}`}>{rankInfo.name}</p>
        <p className="text-xs text-gray-600 mt-1">
          {rankInfo.category === 'Officer' ? '⭐ Commissioned Officer' : '🛡️ Non-Commissioned Officer'}
        </p>
      </div>
    </div>
  )
}