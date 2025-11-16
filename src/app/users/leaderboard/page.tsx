// app/users/leaderboard/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLeaderboard, useUserRank as useUserLeaderboardRank } from '@/hooks/use-leaderboard'
import { useUserRank } from '@/hooks/use-rank'
import { LeaderboardEntry, LeaderboardPaginationLimit } from '@/types/leaderboard'
import { TrendingUp, Zap, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useRightColumn } from '../layout'
import { PNPRankBadge } from '../components/rank-badge'
import { getRankInfo } from '@/lib/rank-config'

// Rank badge component for position
const PositionBadge: React.FC<{ rank: number; size?: 'sm' | 'md' | 'lg' }> = ({ rank, size = 'md' }) => {
  const sizeClasses = {
    sm: { container: 'w-10 h-10', text: 'text-sm' },
    md: { container: 'w-12 h-12', text: 'text-base' },
    lg: { container: 'w-16 h-16', text: 'text-xl' }
  }

  const getBgStyle = () => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-600'
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-500'
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-500 border-orange-600'
    return 'bg-white border-gray-300'
  }

  return (
    <div className={`${sizeClasses[size].container} ${getBgStyle()} rounded-full flex items-center justify-center font-bold border-2`}>
      <span className={`${sizeClasses[size].text} ${rank <= 3 ? 'text-white' : 'text-gray-700'}`}>
        {rank}
      </span>
    </div>
  )
}

// User avatar component
const UserAvatar: React.FC<{ 
  image: string | null
  name: string
  size?: number
  rank?: number
  customBorderColor?: string
}> = ({ image, name, size = 48, rank, customBorderColor }) => {
  const [imgError, setImgError] = useState(false)

  const getBorderStyle = () => {
    if (customBorderColor) {
      return `ring-4`
    }
    if (rank === 1) {
      return 'ring-4 ring-blue-500 animate-pulse-slow shining-border'
    }
    if (rank === 2) {
      return 'ring-4 ring-blue-400'
    }
    if (rank === 3) {
      return 'ring-4 ring-slate-400'
    }
    return ''
  }

  const avatarContent = !image || imgError ? (
    <div 
      className="bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
    </div>
  ) : (
    <Image
      src={image}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover"
      onError={() => setImgError(true)}
    />
  )

  if ((rank && rank <= 3) || customBorderColor) {
    return (
      <div 
        className={`rounded-full ${getBorderStyle()} p-1 bg-white`}
        style={customBorderColor ? { '--tw-ring-color': customBorderColor } as React.CSSProperties : undefined}
      >
        {avatarContent}
      </div>
    )
  }

  return avatarContent
}

// Top 3 Podium Display
const PodiumDisplay: React.FC<{ topThree: LeaderboardEntry[]; currentUserId?: string }> = ({ topThree, currentUserId }) => {
  if (topThree.length === 0) return null
  const [first, second, third] = topThree

  const getSecondPlaceRankInfo = () => second ? getRankInfo(second.pnpRank) : null
  const getFirstPlaceRankInfo = () => first ? getRankInfo(first.pnpRank) : null
  const getThirdPlaceRankInfo = () => third ? getRankInfo(third.pnpRank) : null

  const secondRankInfo = getSecondPlaceRankInfo()
  const firstRankInfo = getFirstPlaceRankInfo()
  const thirdRankInfo = getThirdPlaceRankInfo()

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
      <style jsx>{`
        @keyframes shine {
          0% {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.9), 0 0 50px rgba(59, 130, 246, 0.7);
          }
          100% {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          }
        }
        .shining-border {
          animation: shine 2s ease-in-out infinite;
        }
      `}</style>
      <div className="flex items-end justify-center gap-6 md:gap-12">
        {/* Second Place */}
        {second && secondRankInfo && (
          <div className={`flex flex-col items-center ${currentUserId === second.userId ? 'ring-2 ring-blue-500 rounded-2xl p-4 bg-white/80' : ''}`}>
            <div className="mb-3 relative">
              <UserAvatar image={second.image} name={second.displayName} size={72} rank={2} />
              {currentUserId === second.userId && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">YOU</div>
              )}
            </div>
            <div className="mb-2">
              <div className={`inline-flex items-center gap-1.5 rounded-full font-semibold border-2 ${secondRankInfo.color} ${secondRankInfo.bgColor} border-current text-sm px-3 py-1`}>
                <Image 
                  src={`/ranks/${second.pnpRank}.png`}
                  alt={second.pnpRank} 
                  width={24} 
                  height={24} 
                  className="object-contain"
                />
                <span>{second.pnpRank}</span>
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="font-semibold text-gray-800 text-sm truncate max-w-[100px] leading-tight">{second.displayName}</p>
            </div>
            <div className="mt-4 bg-gradient-to-t from-blue-500 to-blue-400 h-44 w-36 rounded-t-xl flex flex-col items-center justify-center border-t-4 border-blue-600">
              <span className="text-white text-3xl font-bold mb-2">2</span>
              <div className="flex items-center justify-center text-white">
                <Zap size={14} fill="currentColor" />
                <span className="text-sm font-semibold ml-1">{second.totalXP}</span>
              </div>
            </div>
          </div>
        )}

        {/* First Place */}
        {first && firstRankInfo && (
          <div className={`flex flex-col items-center ${currentUserId === first.userId ? 'ring-2 ring-blue-500 rounded-2xl p-4 bg-white/80' : ''}`}>
            <div className="mb-3 relative flex flex-col items-center">
              <div className="mb-[-8px] z-20">
                <Image
                  src="/MainImage/crown.png"
                  alt="Crown"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="relative">
                <UserAvatar image={first.image} name={first.displayName} size={88} rank={1} />
                {currentUserId === first.userId && (
                  <div className="absolute top-0 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">YOU</div>
                )}
              </div>
            </div>
            <div className="mb-2">
              <div className={`inline-flex items-center gap-2 rounded-full font-semibold border-2 ${firstRankInfo.color} ${firstRankInfo.bgColor} border-current text-base px-4 py-1.5`}>
                <Image 
                  src={`/ranks/${first.pnpRank}.png`}
                  alt={first.pnpRank} 
                  width={28} 
                  height={28} 
                  className="object-contain"
                />
                <span>{first.pnpRank}</span>
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="font-bold text-gray-900 text-base truncate max-w-[120px] leading-tight">{first.displayName}</p>
            </div>
            <div className="mt-4 bg-gradient-to-t from-blue-600 to-blue-500 h-56 w-40 rounded-t-xl flex flex-col items-center justify-center border-t-4 border-blue-700">
              <span className="text-white text-5xl font-black mb-3">1</span>
              <div className="flex items-center justify-center text-white">
                <Zap size={16} fill="currentColor" />
                <span className="text-base font-bold ml-1">{first.totalXP}</span>
              </div>
            </div>
          </div>
        )}

        {/* Third Place */}
        {third && thirdRankInfo && (
          <div className={`flex flex-col items-center ${currentUserId === third.userId ? 'ring-2 ring-blue-500 rounded-2xl p-4 bg-white/80' : ''}`}>
            <div className="mb-3 relative">
              <UserAvatar image={third.image} name={third.displayName} size={72} rank={3} />
              {currentUserId === third.userId && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">YOU</div>
              )}
            </div>
            <div className="mb-2">
              <div className={`inline-flex items-center gap-1.5 rounded-full font-semibold border-2 ${thirdRankInfo.color} ${thirdRankInfo.bgColor} border-current text-sm px-3 py-1`}>
                <Image 
                  src={`/ranks/${third.pnpRank}.png`}
                  alt={third.pnpRank} 
                  width={24} 
                  height={24} 
                  className="object-contain"
                />
                <span>{third.pnpRank}</span>
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="font-semibold text-gray-800 text-sm truncate max-w-[100px] leading-tight">{third.displayName}</p>
            </div>
            <div className="mt-4 bg-gradient-to-t from-slate-400 to-slate-300 h-40 w-36 rounded-t-xl flex flex-col items-center justify-center border-t-4 border-slate-500">
              <span className="text-white text-3xl font-bold mb-2">3</span>
              <div className="flex items-center justify-center text-white">
                <Zap size={14} fill="currentColor" />
                <span className="text-sm font-semibold ml-1">{third.totalXP}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Leaderboard Info Card
const LeaderboardInfoCard: React.FC = () => {
  return (
    <div className="p-6">
      <div className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-5">
        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-4 text-center tracking-wide">
          ABOUT LEADERBOARD
        </h2>
        <div className="flex items-center">
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
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              Compete. Climb. <br />
              Earn Your Rank.
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Earn XP to climb ranks and achieve PNP officer status.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simplified User Rank Card (Duolingo style - NO profile picture, NO trophy icon)
const UserRankCard: React.FC = () => {
  const { rankData, rankInfo } = useUserRank()
  const { rankInfo: leaderboardRankInfo, loading, error } = useUserLeaderboardRank()
  const { user } = useCurrentUser()

  if (!user || loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 animate-pulse">
        <div className="h-24 bg-gray-100 rounded-xl"></div>
      </div>
    )
  }

  if (error || !leaderboardRankInfo || !rankData) {
    return null
  }

  // Ensure percentToNextLevel is valid
  const validPercentage = Math.min(100, Math.max(0, leaderboardRankInfo.percentToNextLevel || 0))

  return (
    <div className="bg-white rounded-3xl p-5 mb-4">
      {/* Header: Your Rank */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">YOUR RANK</p>
          <p className="text-3xl font-black text-gray-900">#{leaderboardRankInfo.rank}</p>
        </div>
        <div>
          <PNPRankBadge rank={rankData.currentRank} size="md" showName={false} showIcon={true} />
        </div>
      </div>

      {/* Level Display - Full width blue card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl px-5 py-3 mb-3">
        <div className="flex items-center justify-between text-white">
          <span className="text-sm font-bold uppercase tracking-wider">Level</span>
          <span className="text-3xl font-black">{leaderboardRankInfo.level}</span>
        </div>
      </div>

      {/* Total XP Card */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Total XP</span>
          <span className="text-xl font-bold text-blue-600">{leaderboardRankInfo.totalXP}</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all"
            style={{ width: `${validPercentage}%` }}
          ></div>
        </div>
        {leaderboardRankInfo.xpToNextLevel > 0 && (
          <p className="text-xs text-gray-600 mt-2 font-medium">
            {leaderboardRankInfo.xpToNextLevel} XP to Level {leaderboardRankInfo.level + 1}
          </p>
        )}
      </div>

      {/* Next Rank Card */}
      {leaderboardRankInfo.nextPNPRank && leaderboardRankInfo.xpToNextRank && leaderboardRankInfo.xpToNextRank > 0 && (
        <div className="bg-blue-50 rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              <span className="text-sm font-bold text-gray-700">Next Rank</span>
            </div>
            <PNPRankBadge rank={leaderboardRankInfo.nextPNPRank} size="xs" showIcon={true} />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            Need <span className="text-blue-600 text-base font-bold">{leaderboardRankInfo.xpToNextRank} XP</span>
          </p>
        </div>
      )}

      {/* Badges Card - NO TROPHY ICON */}
      <div className="bg-yellow-50 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700">Badges</span>
          <span className="text-2xl font-black text-gray-900">
            {leaderboardRankInfo.earnedBadges}/{leaderboardRankInfo.totalBadges}
          </span>
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
      <div className="space-y-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-700">
            <LeaderboardInfoCard />
          </div>
          {user && (
            <div className="p-6">
              <UserRankCard />
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="pt-4 pb-2 px-4">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            <Link href="/users/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="/users/about" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              About
            </Link>
            <Link href="/users/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    )
    return () => setRightColumnContent(null)
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-2 sm:px-4 md:px-8 lg:px-20 py-6">
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
      {/* Responsive padding: 
          - sm: 8px (0.5rem) 
          - md: 16px (1rem)
          - lg: 32px (2rem)
          - xl+: 80px (5rem/20) */}
      <div className="px-2 sm:px-4 md:px-8 lg:px-20 py-6">
        {/* Top 3 Podium */}
        <PodiumDisplay topThree={topThree} currentUserId={user?.id} />

        {/* Controls */}
        <div className="bg-white rounded-2xl p-4 mb-6">
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-400">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Position</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Player</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wide">PNP Rank</th>
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
                        <PositionBadge rank={entry.rank} size="sm" />
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
                        <div className="flex justify-center">
                          <PNPRankBadge rank={entry.pnpRank} size="sm" showIcon={true} />
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
                  <PositionBadge rank={currentUserEntry.rank} size="md" />
                  <div className="relative">
                    <UserAvatar 
                      image={currentUserEntry.image} 
                      name={currentUserEntry.displayName} 
                      size={48}
                      customBorderColor="#fecf6b"
                    />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{currentUserEntry.displayName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <PNPRankBadge rank={currentUserEntry.pnpRank} size="xs" showIcon={true} />
                      <span className="text-sm text-gray-600 font-medium">Position #{currentUserEntry.rank}</span>
                    </div>
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