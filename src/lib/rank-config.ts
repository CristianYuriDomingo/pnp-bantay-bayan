//lib/rank-config.ts
import { PNPRank, RankInfo } from '@/types/rank'

// Complete rank information
export const RANK_INFO: Record<PNPRank, RankInfo> = {
  'PGEN': {
    code: 'PGEN',
    name: 'Police General',
    shortName: 'General',
    category: 'Officer',
    order: 16,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '⭐⭐⭐⭐'
  },
  'PLTGEN': {
    code: 'PLTGEN',
    name: 'Police Lieutenant General',
    shortName: 'Lt. General',
    category: 'Officer',
    order: 15,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: '⭐⭐⭐'
  },
  'PMGEN': {
    code: 'PMGEN',
    name: 'Police Major General',
    shortName: 'Maj. General',
    category: 'Officer',
    order: 14,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    icon: '⭐⭐'
  },
  'PBGEN': {
    code: 'PBGEN',
    name: 'Police Brigadier General',
    shortName: 'Brig. General',
    category: 'Officer',
    order: 13,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    icon: '⭐'
  },
  'PCOL': {
    code: 'PCOL',
    name: 'Police Colonel',
    shortName: 'Colonel',
    category: 'Officer',
    order: 12,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: '🦅'
  },
  'PLTCOL': {
    code: 'PLTCOL',
    name: 'Police Lieutenant Colonel',
    shortName: 'Lt. Colonel',
    category: 'Officer',
    order: 11,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    icon: '🦅'
  },
  'PMAJ': {
    code: 'PMAJ',
    name: 'Police Major',
    shortName: 'Major',
    category: 'Officer',
    order: 10,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    icon: '💎'
  },
  'PCPT': {
    code: 'PCPT',
    name: 'Police Captain',
    shortName: 'Captain',
    category: 'Officer',
    order: 9,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    icon: '💎'
  },
  'PLT': {
    code: 'PLT',
    name: 'Police Lieutenant',
    shortName: 'Lieutenant',
    category: 'Officer',
    order: 8,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: '💎'
  },
  'PEMS': {
    code: 'PEMS',
    name: 'Police Executive Master Sergeant',
    shortName: 'Exec MS',
    category: 'Enlisted',
    order: 7,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    icon: '▰▰▰'
  },
  'PCMS': {
    code: 'PCMS',
    name: 'Police Chief Master Sergeant',
    shortName: 'Chief MS',
    category: 'Enlisted',
    order: 6,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    icon: '▰▰▰'
  },
  'PSMS': {
    code: 'PSMS',
    name: 'Police Senior Master Sergeant',
    shortName: 'Senior MS',
    category: 'Enlisted',
    order: 5,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: '▰▰'
  },
  'PMSg': {
    code: 'PMSg',
    name: 'Police Master Sergeant',
    shortName: 'Master Sgt',
    category: 'Enlisted',
    order: 4,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    icon: '▰▰'
  },
  'PSSg': {
    code: 'PSSg',
    name: 'Police Staff Sergeant',
    shortName: 'Staff Sgt',
    category: 'Enlisted',
    order: 3,
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
    icon: '▰'
  },
  'PCpl': {
    code: 'PCpl',
    name: 'Police Corporal',
    shortName: 'Corporal',
    category: 'Enlisted',
    order: 2,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: '▱'
  },
  'Pat': {
    code: 'Pat',
    name: 'Patrolman/Patrolwoman',
    shortName: 'Patrolman',
    category: 'Enlisted',
    order: 1,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    icon: '○'
  }
}

// Rank calculation thresholds (percentile-based)
export const RANK_THRESHOLDS = [
  { rank: 'PGEN' as PNPRank, maxPosition: 1, percentile: 0 },           // #1 only
  { rank: 'PLTGEN' as PNPRank, maxPosition: null, percentile: 0.5 },    // Top 0.5%
  { rank: 'PMGEN' as PNPRank, maxPosition: null, percentile: 1 },       // Top 1%
  { rank: 'PBGEN' as PNPRank, maxPosition: null, percentile: 2 },       // Top 2%
  { rank: 'PCOL' as PNPRank, maxPosition: null, percentile: 5 },        // Top 5%
  { rank: 'PLTCOL' as PNPRank, maxPosition: null, percentile: 10 },     // Top 10%
  { rank: 'PMAJ' as PNPRank, maxPosition: null, percentile: 15 },       // Top 15%
  { rank: 'PCPT' as PNPRank, maxPosition: null, percentile: 20 },       // Top 20%
  { rank: 'PLT' as PNPRank, maxPosition: null, percentile: 25 },        // Top 25%
  { rank: 'PEMS' as PNPRank, maxPosition: null, percentile: 35 },       // Top 35%
  { rank: 'PCMS' as PNPRank, maxPosition: null, percentile: 45 },       // Top 45%
  { rank: 'PSMS' as PNPRank, maxPosition: null, percentile: 55 },       // Top 55%
  { rank: 'PMSg' as PNPRank, maxPosition: null, percentile: 70 },       // Top 70%
  { rank: 'PSSg' as PNPRank, maxPosition: null, percentile: 85 },       // Top 85%
  { rank: 'PCpl' as PNPRank, maxPosition: null, percentile: 95 },       // Top 95%
  { rank: 'Pat' as PNPRank, maxPosition: null, percentile: 100 },       // Everyone else
]

// Helper functions
export function getRankInfo(rank: PNPRank): RankInfo {
  return RANK_INFO[rank]
}

export function getRankByPosition(position: number, totalUsers: number): PNPRank {
  // Special case: #1 is always General
  if (position === 1) return 'PGEN'
  
  // Calculate percentile
  const percentile = (position / totalUsers) * 100
  
  // Find appropriate rank
  for (const threshold of RANK_THRESHOLDS) {
    if (threshold.maxPosition !== null && position <= threshold.maxPosition) {
      return threshold.rank
    }
    if (percentile <= threshold.percentile) {
      return threshold.rank
    }
  }
  
  return 'Pat' // Default fallback
}

export function getNextRank(currentRank: PNPRank): PNPRank | null {
  const currentOrder = RANK_INFO[currentRank].order
  
  // Find next higher rank
  for (const [rank, info] of Object.entries(RANK_INFO)) {
    if (info.order === currentOrder + 1) {
      return rank as PNPRank
    }
  }
  
  return null // Already at top rank
}

export function compareRanks(rank1: PNPRank, rank2: PNPRank): number {
  return RANK_INFO[rank1].order - RANK_INFO[rank2].order
}