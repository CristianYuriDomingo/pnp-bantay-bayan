// lib/rank-config.ts
import { PNPRank, RankInfo } from '@/types/rank'

// Complete rank information (ordered by order field 0-16)
export const RANK_INFO: Record<PNPRank, RankInfo> = {
  'Cadet': {
    code: 'Cadet',
    name: 'Cadet',
    shortName: 'Cadet',
    category: 'Cadet',
    order: 0,
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    icon: '/ranks/Cadet.png'
  },
  'Pat': {
    code: 'Pat',
    name: 'Patrolman/Patrolwoman',
    shortName: 'Patrolman',
    category: 'Enlisted',
    order: 1,
    color: 'text-slate-400',
    bgColor: 'bg-slate-50',
    icon: '/ranks/Pat.png'
  },
  'PCpl': {
    code: 'PCpl',
    name: 'Police Corporal',
    shortName: 'Corporal',
    category: 'Enlisted',
    order: 2,
    color: 'text-slate-400',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PCpl.png'
  },
  'PSSg': {
    code: 'PSSg',
    name: 'Police Staff Sergeant',
    shortName: 'Staff Sgt',
    category: 'Enlisted',
    order: 3,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PSSg.png'
  },
  'PMSg': {
    code: 'PMSg',
    name: 'Police Master Sergeant',
    shortName: 'Master Sgt',
    category: 'Enlisted',
    order: 4,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PMSg.png'
  },
  'PSMS': {
    code: 'PSMS',
    name: 'Police Senior Master Sergeant',
    shortName: 'Senior MS',
    category: 'Enlisted',
    order: 5,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PSMS.png'
  },
  'PCMS': {
    code: 'PCMS',
    name: 'Police Chief Master Sergeant',
    shortName: 'Chief MS',
    category: 'Enlisted',
    order: 6,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PCMS.png'
  },
  'PEMS': {
    code: 'PEMS',
    name: 'Police Executive Master Sergeant',
    shortName: 'Exec MS',
    category: 'Enlisted',
    order: 7,
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PEMS.png'
  },
  'PLT': {
    code: 'PLT',
    name: 'Police Lieutenant',
    shortName: 'Lieutenant',
    category: 'Officer',
    order: 8,
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PLT.png'
  },
  'PCPT': {
    code: 'PCPT',
    name: 'Police Captain',
    shortName: 'Captain',
    category: 'Officer',
    order: 9,
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PCPT.png'
  },
  'PMAJ': {
    code: 'PMAJ',
    name: 'Police Major',
    shortName: 'Major',
    category: 'Officer',
    order: 10,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PMAJ.png'
  },
  'PLTCOL': {
    code: 'PLTCOL',
    name: 'Police Lieutenant Colonel',
    shortName: 'Lt. Colonel',
    category: 'Officer',
    order: 11,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PLTCOL.png'
  },
  'PCOL': {
    code: 'PCOL',
    name: 'Police Colonel',
    shortName: 'Colonel',
    category: 'Officer',
    order: 12,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PCOL.png'
  },
  'PBGEN': {
    code: 'PBGEN',
    name: 'Police Brigadier General',
    shortName: 'Brig. General',
    category: 'Officer',
    order: 13,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PBGEN.png'
  },
  'PMGEN': {
    code: 'PMGEN',
    name: 'Police Major General',
    shortName: 'Maj. General',
    category: 'Officer',
    order: 14,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PMGEN.png'
  },
  'PLTGEN': {
    code: 'PLTGEN',
    name: 'Police Lieutenant General',
    shortName: 'Lt. General',
    category: 'Officer',
    order: 15,
    color: 'text-blue-800',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PLTGEN.png'
  },
  'PGEN': {
    code: 'PGEN',
    name: 'Police General',
    shortName: 'General',
    category: 'Officer',
    order: 16,
    color: 'text-blue-900',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PGEN.png'
  }
}

// Rank calculation thresholds (percentile-based) - Updated with Cadet fallback
export const RANK_THRESHOLDS = [
  { rank: 'PGEN' as PNPRank, maxPosition: 1, percentile: 0 },
  { rank: 'PLTGEN' as PNPRank, maxPosition: null, percentile: 0.2 },
  { rank: 'PMGEN' as PNPRank, maxPosition: null, percentile: 1 },
  { rank: 'PBGEN' as PNPRank, maxPosition: null, percentile: 2 },
  { rank: 'PCOL' as PNPRank, maxPosition: null, percentile: 5 },
  { rank: 'PLTCOL' as PNPRank, maxPosition: null, percentile: 10 },
  { rank: 'PMAJ' as PNPRank, maxPosition: null, percentile: 8 },
  { rank: 'PCPT' as PNPRank, maxPosition: null, percentile: 12 },
  { rank: 'PLT' as PNPRank, maxPosition: null, percentile: 15 },
  { rank: 'PEMS' as PNPRank, maxPosition: null, percentile: 20 },
  { rank: 'PCMS' as PNPRank, maxPosition: null, percentile: 30 },
  { rank: 'PSMS' as PNPRank, maxPosition: null, percentile: 40 },
  { rank: 'PMSg' as PNPRank, maxPosition: null, percentile: 55 },
  { rank: 'PSSg' as PNPRank, maxPosition: null, percentile: 75 },
  { rank: 'PCpl' as PNPRank, maxPosition: null, percentile: 90 },
  { rank: 'Pat' as PNPRank, maxPosition: null, percentile: 99 },
  { rank: 'Cadet' as PNPRank, maxPosition: null, percentile: 100 },
]

// Helper functions
export function getRankInfo(rank: PNPRank): RankInfo {
  return RANK_INFO[rank]
}

export function getRankByPosition(position: number, totalUsers: number): PNPRank {
  if (position === 1) return 'PGEN'
  
  const percentile = (position / totalUsers) * 100
  
  for (const threshold of RANK_THRESHOLDS) {
    if (threshold.maxPosition !== null && position <= threshold.maxPosition) {
      return threshold.rank
    }
    if (percentile <= threshold.percentile) {
      return threshold.rank
    }
  }
  
  return 'Cadet' // Fallback for new users
}

export function getNextRank(currentRank: PNPRank): PNPRank | null {
  const currentOrder = RANK_INFO[currentRank].order
  
  for (const [rank, info] of Object.entries(RANK_INFO)) {
    if (info.order === currentOrder + 1) {
      return rank as PNPRank
    }
  }
  
  return null
}

export function compareRanks(rank1: PNPRank, rank2: PNPRank): number {
  return RANK_INFO[rank1].order - RANK_INFO[rank2].order
}