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
    icon: '/ranks/Cadet.png',
    isCompetitive: false,
    minXP: 0
  },
  'Pat': {
    code: 'Pat',
    name: 'Patrolman/Patrolwoman',
    shortName: 'Patrolman',
    category: 'Enlisted',
    order: 1,
    color: 'text-slate-400',
    bgColor: 'bg-slate-50',
    icon: '/ranks/Pat.png',
    isCompetitive: false,
    minXP: 100
  },
  'PCpl': {
    code: 'PCpl',
    name: 'Police Corporal',
    shortName: 'Corporal',
    category: 'Enlisted',
    order: 2,
    color: 'text-slate-400',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PCpl.png',
    isCompetitive: false,
    minXP: 250
  },
  'PSSg': {
    code: 'PSSg',
    name: 'Police Staff Sergeant',
    shortName: 'Staff Sgt',
    category: 'Enlisted',
    order: 3,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PSSg.png',
    isCompetitive: false,
    minXP: 500
  },
  'PMSg': {
    code: 'PMSg',
    name: 'Police Master Sergeant',
    shortName: 'Master Sgt',
    category: 'Enlisted',
    order: 4,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PMSg.png',
    isCompetitive: false,
    minXP: 800
  },
  'PSMS': {
    code: 'PSMS',
    name: 'Police Senior Master Sergeant',
    shortName: 'Senior MS',
    category: 'Enlisted',
    order: 5,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PSMS.png',
    isCompetitive: false,
    minXP: 1200
  },
  'PCMS': {
    code: 'PCMS',
    name: 'Police Chief Master Sergeant',
    shortName: 'Chief MS',
    category: 'Enlisted',
    order: 6,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PCMS.png',
    isCompetitive: false,
    minXP: 1600
  },
  'PEMS': {
    code: 'PEMS',
    name: 'Police Executive Master Sergeant',
    shortName: 'Exec MS',
    category: 'Enlisted',
    order: 7,
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    icon: '/ranks/PEMS.png',
    isCompetitive: false,
    minXP: 2000
  },
  'PLT': {
    code: 'PLT',
    name: 'Police Lieutenant',
    shortName: 'Lieutenant',
    category: 'Officer',
    order: 8,
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PLT.png',
    isCompetitive: false,
    minXP: 2400
  },
  'PCPT': {
    code: 'PCPT',
    name: 'Police Captain',
    shortName: 'Captain',
    category: 'Officer',
    order: 9,
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PCPT.png',
    isCompetitive: false,
    minXP: 2800
  },
  'PMAJ': {
    code: 'PMAJ',
    name: 'Police Major',
    shortName: 'Major',
    category: 'Officer',
    order: 10,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PMAJ.png',
    isCompetitive: false,
    minXP: 3200
  },
  'PLTCOL': {
    code: 'PLTCOL',
    name: 'Police Lieutenant Colonel',
    shortName: 'Lt. Colonel',
    category: 'Officer',
    order: 11,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PLTCOL.png',
    isCompetitive: false,
    minXP: 3500
  },
  'PCOL': {
    code: 'PCOL',
    name: 'Police Colonel',
    shortName: 'Colonel',
    category: 'Officer',
    order: 12,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: '/ranks/PCOL.png',
    isCompetitive: false,
    minXP: 3500
  },
  'PBGEN': {
    code: 'PBGEN',
    name: 'Police Brigadier General',
    shortName: 'Brig. General',
    category: 'StarRank',
    order: 13,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    icon: '/ranks/PBGEN.png',
    isCompetitive: true,
    minXP: 3500
  },
  'PMGEN': {
    code: 'PMGEN',
    name: 'Police Major General',
    shortName: 'Maj. General',
    category: 'StarRank',
    order: 14,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: '/ranks/PMGEN.png',
    isCompetitive: true,
    minXP: 3500
  },
  'PLTGEN': {
    code: 'PLTGEN',
    name: 'Police Lieutenant General',
    shortName: 'Lt. General',
    category: 'StarRank',
    order: 15,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: '/ranks/PLTGEN.png',
    isCompetitive: true,
    minXP: 3500
  },
  'PGEN': {
    code: 'PGEN',
    name: 'Police General',
    shortName: 'General',
    category: 'StarRank',
    order: 16,
    color: 'text-amber-900',
    bgColor: 'bg-amber-50',
    icon: '/ranks/PGEN.png',
    isCompetitive: true,
    minXP: 3500
  }
}

// XP-based thresholds for sequential ranks (Cadet → PLTCOL)
export const RANK_XP_THRESHOLDS = [
  { rank: 'Cadet' as PNPRank, minXP: 0 },
  { rank: 'Pat' as PNPRank, minXP: 100 },
  { rank: 'PCpl' as PNPRank, minXP: 250 },
  { rank: 'PSSg' as PNPRank, minXP: 500 },
  { rank: 'PMSg' as PNPRank, minXP: 800 },
  { rank: 'PSMS' as PNPRank, minXP: 1200 },
  { rank: 'PCMS' as PNPRank, minXP: 1600 },
  { rank: 'PEMS' as PNPRank, minXP: 2000 },
  { rank: 'PLT' as PNPRank, minXP: 2400 },
  { rank: 'PCPT' as PNPRank, minXP: 2800 },
  { rank: 'PMAJ' as PNPRank, minXP: 3200 },
  { rank: 'PLTCOL' as PNPRank, minXP: 3500 },
]

// Star rank eligibility (competitive ranks)
export const STAR_RANK_CONFIG = {
  minXP: 3500, // Must have max XP to compete for star ranks
  PCOL: {
    // Baseline - anyone with 3500+ XP who doesn't qualify for higher stars
    isDefault: true
  },
  PBGEN: {
    maxPercentile: 10, // Top 10%
    maxPositions: 50,  // OR top 50 users (whichever is stricter)
  },
  PMGEN: {
    maxPercentile: 2,  // Top 2%
    maxPositions: 12,  // OR top 12 users (whichever is stricter)
  },
  PLTGEN: {
    exactPositions: [2, 3], // Only positions #2 and #3
  },
  PGEN: {
    exactPositions: [1], // Only position #1
  }
}

// Helper functions
export function getRankInfo(rank: PNPRank): RankInfo {
  return RANK_INFO[rank]
}

/**
 * Calculate rank based on XP + Position (Dual-track system)
 */
export function getRankByXP(totalXP: number, position: number, totalUsers: number): PNPRank {
  // Phase 1: Determine base rank from XP (sequential learning progression)
  let baseRank: PNPRank = 'Cadet'
  
  for (const threshold of RANK_XP_THRESHOLDS) {
    if (totalXP >= threshold.minXP) {
      baseRank = threshold.rank
    } else {
      break
    }
  }
  
  // Phase 2: Check if eligible for competitive star ranks
  if (totalXP < STAR_RANK_CONFIG.minXP) {
    // Not eligible for star ranks yet
    return baseRank
  }
  
  // User has maxed XP - check for star rank eligibility
  const percentile = (position / totalUsers) * 100
  
  // PGEN: Only #1
  if (STAR_RANK_CONFIG.PGEN.exactPositions.includes(position)) {
    return 'PGEN'
  }
  
  // PLTGEN: Only #2 and #3
  if (STAR_RANK_CONFIG.PLTGEN.exactPositions.includes(position)) {
    return 'PLTGEN'
  }
  
  // PMGEN: Top 2% OR Top 12 (whichever is stricter)
  const pmgenMaxPosition = Math.min(
    Math.ceil(totalUsers * (STAR_RANK_CONFIG.PMGEN.maxPercentile / 100)),
    STAR_RANK_CONFIG.PMGEN.maxPositions
  )
  if (position <= pmgenMaxPosition) {
    return 'PMGEN'
  }
  
  // PBGEN: Top 10% OR Top 50 (whichever is stricter)
  const pbgenMaxPosition = Math.min(
    Math.ceil(totalUsers * (STAR_RANK_CONFIG.PBGEN.maxPercentile / 100)),
    STAR_RANK_CONFIG.PBGEN.maxPositions
  )
  if (position <= pbgenMaxPosition) {
    return 'PBGEN'
  }
  
  // Default: PCOL (maxed XP but not in top competitive positions)
  return 'PCOL'
}

/**
 * Get the base XP-based rank (learning progression only)
 */
export function getBaseRankByXP(totalXP: number): PNPRank {
  let baseRank: PNPRank = 'Cadet'
  
  for (const threshold of RANK_XP_THRESHOLDS) {
    if (totalXP >= threshold.minXP) {
      baseRank = threshold.rank
    } else {
      break
    }
  }
  
  return baseRank
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

/**
 * Check if a rank is a competitive star rank
 */
export function isStarRank(rank: PNPRank): boolean {
  return RANK_INFO[rank].isCompetitive
}

/**
 * Get next XP threshold for sequential progression
 */
export function getNextXPThreshold(currentXP: number): { rank: PNPRank; xpNeeded: number } | null {
  for (const threshold of RANK_XP_THRESHOLDS) {
    if (currentXP < threshold.minXP) {
      return {
        rank: threshold.rank,
        xpNeeded: threshold.minXP - currentXP
      }
    }
  }
  return null // User has maxed out XP progression
}