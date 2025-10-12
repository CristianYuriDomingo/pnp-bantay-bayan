// app/users/leaderboard/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { useLeaderboard, useUserRank } from '@/hooks/use-leaderboard'
import { LeaderboardEntry, LeaderboardPaginationLimit } from '@/types/leaderboard'
import { Trophy, Crown, Medal, TrendingUp, Zap, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useRightColumn } from '../layout'

// Rank badge component
const RankBadge: React.FC<{ rank: number; size?: 'sm' | 'md' | 'lg' }> = ({ rank, size = 'md' }) => {
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
        <Medal className="text-gray-600" size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
      </div>
    )
  }

  if (rank === 3) {
    return (
      <div className={`${sizeClasses[size]} bg-orange-400 rounded-full flex items-center justify-center shadow-sm`}>
        <Medal className="text-orange-700" size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center font-semibold text-gray-700 border-2 border-gray-200`}>
      {rank}
    </div>
  )
}

// User avatar component with fallback
const UserAvatar: React.FC<{ image: string | null; name: string; size?: number }> = ({ image, name, size = 48 }) => {
  const [imgError, setImgError] = useState(false)

  if (!image || imgError) {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    return (
      <div 
        className="bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold"
        style={{ width: size, height: size, fontSize: size / 2.5 }}
      >
        {initials}
      </div>
    )
  }

  return (
    <Image
      src={image}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover"
      onError={() => setImgError(true)}
    />
  )
}

// Top 3 Podium Display
const PodiumDisplay: React.FC<{ topThree: LeaderboardEntry[]; currentUserId?: string }> = ({ topThree, currentUserId }) => {
  if (topThree.length === 0) return null

  const [first, second, third] = topThree

  return (
    <div className="bg-blue-50 rounded-2xl p-6 shadow-sm mb-6 border-2 border-blue-200">
      <div className="flex items-end justify-center gap-4 md:gap-8">
        {/* Second Place */}
        {second && (
          <div className={`flex flex-col items-center ${currentUserId === second.userId ? 'ring-2 ring-blue-500 rounded-2xl p-3 bg-white' : ''}`}>
            <div className="mb-2 relative">
              <UserAvatar image={second.image} name={second.displayName} size={56} />
              {currentUserId === second.userId && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  YOU
                </div>
              )}
            </div>
            <RankBadge rank={2} size="md" />
            <div className="mt-2 text-center">
              <p className="font-semibold text-gray-800 text-sm truncate max-w-[80px]">{second.displayName}</p>
              <div className="flex items-center justify-center mt-1 text-blue-600">
                <Zap size={12} fill="currentColor" />
                <span className="text-xs font-semibold ml-1">{second.totalXP}</span>
              </div>
            </div>
            <div className="mt-3 bg-gray-200 h-20 w-16 rounded-t-lg flex items-center justify-center">
              <span className="text-gray-600 text-lg font-semibold">2</span>
            </div>
          </div>
        )}

        {/* First Place */}
        {first && (
          <div className={`flex flex-col items-center ${currentUserId === first.userId ? 'ring-2 ring-blue-500 rounded-2xl p-3 bg-white' : ''}`}>
            <div className="mb-2 relative">
              <UserAvatar image={first.image} name={first.displayName} size={68} />
              {currentUserId === first.userId && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  YOU
                </div>
              )}
            </div>
            <RankBadge rank={1} size="lg" />
            <div className="mt-2 text-center">
              <p className="font-semibold text-gray-800 text-base truncate max-w-[100px]">{first.displayName}</p>
              <div className="flex items-center justify-center mt-1 text-blue-600">
                <Zap size={14} fill="currentColor" />
                <span className="text-sm font-semibold ml-1">{first.totalXP}</span>
              </div>
            </div>
            <div className="mt-3 bg-yellow-400 h-28 w-20 rounded-t-lg flex items-center justify-center shadow-sm">
              <span className="text-yellow-700 text-2xl font-semibold">1</span>
            </div>
          </div>
        )}

        {/* Third Place */}
        {third && (
          <div className={`flex flex-col items-center ${currentUserId === third.userId ? 'ring-2 ring-blue-500 rounded-2xl p-3 bg-white' : ''}`}>
            <div className="mb-2 relative">
              <UserAvatar image={third.image} name={third.displayName} size={56} />
              {currentUserId === third.userId && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  YOU
                </div>
              )}
            </div>
            <RankBadge rank={3} size="md" />
            <div className="mt-2 text-center">
              <p className="font-semibold text-gray-800 text-sm truncate max-w-[80px]">{third.displayName}</p>
              <div className="flex items-center justify-center mt-1 text-blue-600">
                <Zap size={12} fill="currentColor" />
                <span className="text-xs font-semibold ml-1">{third.totalXP}</span>
              </div>
            </div>
            <div className="mt-3 bg-orange-300 h-16 w-16 rounded-t-lg flex items-center justify-center">
              <span className="text-orange-700 text-lg font-semibold">3</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Leaderboard Info Card (similar to LearnCard2)
const LeaderboardInfoCard: React.FC = () => {
  return (
    <div className="p-6">
      {/* Inner card with rounded corners and border */}
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        {/* Header */}
        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-4 text-center tracking-wide">
          ABOUT LEADERBOARD
        </h2>

        {/* Main content */}
        <div className="flex items-center">
          {/* Character image */}
          <div className="w-20 h-20 relative mr-4 flex-shrink-0">
            <Image
              src="/MainImage/leaderboard.png"
              alt="Leaderboard mascot"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>

          {/* Text Content */}
          <div className="flex-1">
            {/* Bold statement */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              Compete. Climb. <br />
              Be the best.
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Earn XP to climb the ranks and compete with other learners.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// User's current rank card
const UserRankCard: React.FC = () => {
  const { rankInfo, loading, error } = useUserRank()
  const { user } = useCurrentUser()

  if (!user || loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 animate-pulse">
        <div className="h-24 bg-gray-100 rounded-xl"></div>
      </div>
    )
  }

  if (error || !rankInfo) {
    return null
  }

  return (
    <div className="bg-blue-50 rounded-2xl p-5 shadow-sm mb-4 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <RankBadge rank={rankInfo.rank} size="lg" />
          <div>
            <p className="text-xs font-medium text-gray-500">Your Rank</p>
            <p className="text-2xl font-semibold text-gray-800">#{rankInfo.rank}</p>
          </div>
        </div>
        <div className="text-right bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl px-4 py-2 shadow-sm">
          <p className="text-xs font-medium text-blue-100">Level</p>
          <p className="text-xl font-semibold text-white">{rankInfo.level}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* XP Progress */}
        <div className="bg-white rounded-xl p-3 border border-blue-200">
          <div className="flex justify-between text-xs mb-2 font-medium">
            <span className="text-gray-700">XP Progress</span>
            <span className="text-blue-600 font-semibold">{rankInfo.totalXP} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all shadow-sm"
              style={{ width: `${rankInfo.percentToNextLevel}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1 font-medium">
            {rankInfo.xpToNextLevel} XP to Level {rankInfo.level + 1}
          </p>
        </div>

        {/* Climb to next rank */}
        {rankInfo.xpBehindNext !== null && (
          <div className="bg-white rounded-xl p-3 border border-blue-200">
            <p className="text-xs font-semibold mb-1 flex items-center text-gray-700">
              <TrendingUp size={14} className="mr-1 text-blue-500" />
              Catch the next player!
            </p>
            <p className="text-xs font-medium text-gray-600">
              Need <span className="text-blue-600 font-semibold">{rankInfo.xpBehindNext} more XP</span>
            </p>
          </div>
        )}

        {/* Badge stats */}
        <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-blue-200">
          <span className="flex items-center text-sm font-medium text-gray-700">
            <Trophy size={16} className="mr-2 text-blue-500" />
            Badges
          </span>
          <span className="font-semibold text-base text-gray-800">{rankInfo.earnedBadges}/{rankInfo.totalBadges}</span>
        </div>
      </div>
    </div>
  )
}

// Main Leaderboard Page
export default function LeaderboardPage() {
  const [limit, setLimit] = useState<LeaderboardPaginationLimit>(25)
  const [page, setPage] = useState(1)
  const { user } = useCurrentUser()
  const { setRightColumnContent } = useRightColumn()
  
  const { 
    leaderboard, 
    currentUserEntry, 
    pagination,
    loading, 
    error,
    lastUpdated,
    refresh 
  } = useLeaderboard({ limit, page, autoRefresh: false })

  const topThree = leaderboard.slice(0, 3)
  const restOfLeaderboard = leaderboard.slice(3)

  // Set right column content
  useEffect(() => {
    setRightColumnContent(
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Leaderboard Info Card */}
        <div className="border-b border-gray-100 dark:border-gray-700">
          <LeaderboardInfoCard />
        </div>
        
        {/* User's Rank Card */}
        {user && (
          <div className="p-6">
            <UserRankCard />
          </div>
        )}
      </div>
    )

    // Cleanup
    return () => {
      setRightColumnContent(null)
    }
  }, [user, setRightColumnContent])

  const handleLimitChange = (newLimit: LeaderboardPaginationLimit) => {
    setLimit(newLimit)
    setPage(1)
  }

  const handleRefresh = () => {
    refresh()
  }

  if (loading && !leaderboard.length) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-20 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading leaderboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-20 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center max-w-md">
              <p className="text-red-600 dark:text-red-400 font-semibold text-lg mb-2">Oops!</p>
              <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-5 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-20 py-6">
        {/* Top 3 Podium */}
        <PodiumDisplay topThree={topThree} currentUserId={user?.id} />

        {/* Controls */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value) as LeaderboardPaginationLimit)}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white"
              >
                <option value={10}>Top 10</option>
                <option value={25}>Top 25</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {lastUpdated && (
                <p className="text-xs text-gray-500 font-medium">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-400">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Rank</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Player</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wide">Level</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wide">XP</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wide">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {restOfLeaderboard.map((entry) => {
                  const isCurrentUser = user?.id === entry.userId
                  return (
                    <tr 
                      key={entry.userId}
                      className={`hover:bg-blue-50 transition-colors ${
                        isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <RankBadge rank={entry.rank} size="sm" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <UserAvatar image={entry.image} name={entry.displayName} size={40} />
                            {isCurrentUser && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {entry.displayName}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
                                  YOU
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-semibold text-sm ${
                          isCurrentUser ? 'bg-blue-500 text-white' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {entry.level}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className={`flex items-center justify-center gap-1 font-semibold ${
                          isCurrentUser ? 'text-blue-600' : 'text-blue-600'
                        }`}>
                          <Zap size={14} fill="currentColor" />
                          {entry.totalXP}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-medium ${
                          isCurrentUser ? 'text-blue-700 font-semibold' : 'text-gray-700'
                        }`}>
                          {entry.earnedBadges}/{entry.totalBadges}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > limit && (
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 font-medium">
                  Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 bg-white"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!pagination.hasMore}
                    className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 bg-white"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Show current user if not in visible range */}
        {currentUserEntry && !leaderboard.find(e => e.userId === user?.id) && (
          <div className="bg-blue-50 border-2 border-blue-500 rounded-2xl p-4">
            <p className="text-sm text-blue-800 font-semibold mb-3 flex items-center">
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-2">YOU</span>
              Your Position
            </p>
            <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RankBadge rank={currentUserEntry.rank} size="md" />
                  <div className="relative">
                    <UserAvatar image={currentUserEntry.image} name={currentUserEntry.displayName} size={48} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{currentUserEntry.displayName}</p>
                    <p className="text-sm text-gray-600 font-medium">Rank #{currentUserEntry.rank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-blue-600 font-semibold">
                    <Zap size={16} fill="currentColor" />
                    {currentUserEntry.totalXP}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Level {currentUserEntry.level}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}