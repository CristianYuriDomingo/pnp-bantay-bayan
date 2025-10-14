// types/leaderboard.ts
import { PNPRank } from './rank'

export interface LeaderboardEntry {
  userId: string;
  name: string | null;
  displayName: string; // Computed: name or "Anonymous User"
  image: string | null;
  totalXP: number;
  level: number;
  rank: number; // Position number (1, 2, 3, etc.)
  pnpRank: PNPRank; // NEW: PNP Rank (Pat, PCpl, etc.)
  createdAt: Date;
  
  // Badge stats
  totalBadges: number;
  earnedBadges: number;
  
  // XP breakdown (optional - for future use)
  learningXP?: number;
  quizXP?: number;
}

export interface LeaderboardStats {
  totalUsers: number;
  topXP: number;
  averageXP: number;
  averageLevel: number;
  lastUpdated: Date;
  // NEW: Rank distribution
  rankDistribution: Record<PNPRank, number>;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
  stats: LeaderboardStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface UserRankInfo {
  rank: number; // Position number
  pnpRank: PNPRank; // NEW: PNP Rank
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  percentToNextLevel: number;
  
  // Position changes
  usersAhead: number;
  xpBehindNext: number | null; // null if rank #1
  
  // NEW: Rank progression
  nextPNPRank: PNPRank | null;
  xpToNextRank: number | null;
  
  // Progress
  totalBadges: number;
  earnedBadges: number;
}

export type LeaderboardPaginationLimit = 10 | 25 | 50 | 100;

export interface LeaderboardFilters {
  limit: LeaderboardPaginationLimit;
  page: number;
}