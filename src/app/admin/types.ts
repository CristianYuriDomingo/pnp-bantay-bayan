// app/admin/types.ts
export interface Module {
  id: string;
  title: string;
  image: string;
  lessonCount: number;
  status: 'active' | 'inactive';
}

export interface Tip {
  id: string;
  title: string;
  description: string;
  image?: string; // Add the optional image field
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  bubbleSpeech: string;
  timer: number;
  tips: Tip[];
  moduleId: string;
  module?: {
    id: string;
    title: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  triggerType: 'module_complete' | 'lesson_complete' | 'quiz_complete' | 'manual';
  triggerValue: string;
  prerequisites?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Stats {
  totalUsers: number;
  totalModules: number;
  totalLessons: number;
  totalTips: number;
  totalBadges: number; // Added badge count
  activeUsers: number;
  completedLessons: number;
  averageScore: number;
  newUsersThisWeek: number;
  badgesEarnedThisWeek?: number; // Optional badge stats
}

export interface RecentActivity {
  id: string;
  type: 'user_registered' | 'lesson_completed' | 'module_created' | 'quiz_submitted' | 'badge_earned' | 'badge_created';
  description: string;
  timestamp: string;
  user?: string;
  metadata?: {
    badgeId?: string;
    badgeName?: string;
    moduleId?: string;
    moduleName?: string;
    lessonId?: string;
    lessonName?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  completedLessons: number;
  totalScore: number;
  badges?: UserBadge[]; // User's earned badges
}

export interface UserBadge {
  id: string;
  badgeId: string;
  userId: string;
  earnedAt: Date;
  badge: Badge;
}