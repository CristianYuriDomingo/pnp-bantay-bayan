// types/leaderboard.ts
import { PNPRank } from './rank'

export interface LeaderboardEntry {
  userId: string;
  name: string | null;
  displayName: string;
  image: string | null;
  totalXP: number;
  level: number;
  rank: number;
  pnpRank: PNPRank;
  baseRank?: PNPRank;
  createdAt: Date;
  
  totalBadges: number;
  earnedBadges: number;
  
  learningXP?: number;
  quizXP?: number;
}

export interface LeaderboardStats {
  totalUsers: number;
  topXP: number;
  averageXP: number;
  averageLevel: number;
  lastUpdated: Date;
  rankDistribution: Record<string, number>;
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
  rank: number;
  pnpRank: PNPRank;
  baseRank?: PNPRank;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  percentToNextLevel: number;
  
  usersAhead: number;
  xpBehindNext: number | null;
  
  nextPNPRank: PNPRank | null;
  xpToNextRank: number | null;
  
  totalBadges: number;
  earnedBadges: number;
}

export type LeaderboardPaginationLimit = 10 | 25 | 50 | 100;

export interface LeaderboardFilters {
  limit: LeaderboardPaginationLimit;
  page: number;
}