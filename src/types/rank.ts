// types/rank.ts
// All PNP ranks from lowest to highest
export type PNPRank = 
  | 'Cadet'     // Cadet (new users)
  | 'Pat'       // Patrolman/Patrolwoman
  | 'PCpl'      // Police Corporal
  | 'PSSg'      // Police Staff Sergeant
  | 'PMSg'      // Police Master Sergeant
  | 'PSMS'      // Police Senior Master Sergeant
  | 'PCMS'      // Police Chief Master Sergeant
  | 'PEMS'      // Police Executive Master Sergeant
  | 'PLT'       // Police Lieutenant
  | 'PCPT'      // Police Captain
  | 'PMAJ'      // Police Major
  | 'PLTCOL'    // Police Lieutenant Colonel
  | 'PCOL'      // Police Colonel
  | 'PBGEN'     // Police Brigadier General ⭐
  | 'PMGEN'     // Police Major General ⭐⭐
  | 'PLTGEN'    // Police Lieutenant General ⭐⭐⭐
  | 'PGEN'      // Police General ⭐⭐⭐⭐

export interface RankInfo {
  code: PNPRank
  name: string
  shortName: string
  category: 'Cadet' | 'Enlisted' | 'Officer' | 'StarRank'
  order: number
  color: string
  bgColor: string
  icon: string
  isCompetitive: boolean
  minXP?: number
}

export interface UserRankData {
  userId: string
  currentRank: PNPRank
  leaderboardPosition: number
  totalXP: number
  level: number
  previousRank?: PNPRank
  rankAchievedAt: Date
  highestRankEver: PNPRank
  baseRank?: PNPRank
}

export interface RankChangeEvent {
  userId: string
  oldRank: PNPRank
  newRank: PNPRank
  change: 'promotion' | 'demotion' | 'maintained'
  timestamp: Date
  isStarRank?: boolean
}