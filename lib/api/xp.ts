import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type XpStat = {
  currentLevel: number;
  title: string;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpToNextLevel: number;
  streakDays: number;
};

export type XpDaily = {
  date: string; // 'YYYY-MM-DD'
  xpAmount: number;
};

export type XpActionType =
  | 'DAILY_ATTENDANCE'
  | 'STREAK_3_DAYS'
  | 'STREAK_7_DAYS'
  | 'PROBLEM_CORRECT'
  | 'PROBLEM_SET_COMPLETE'
  | 'PROBLEM_SET_PERFECT'
  | 'WRONG_NOTE_COMPLETE'
  | 'WRONG_NOTE_CORRECT'
  | 'WORD_LEARN'
  | 'WORD_SET_COMPLETE'
  | 'WORD_BOOKMARK'
  | 'CHALLENGE_COMPLETE'
  | 'DAILY_GOAL_COMPLETE'
  | 'AI_COACH_FIRST'
  | 'AI_COACH_DAILY';

export type XpHistoryItem = {
  actionType: XpActionType;
  xpAmount: number;
  earnedAt: string; // ISO datetime
};

export type TodayXp = {
  totalXp: number;
  histories: XpHistoryItem[];
};

export async function getXpStat() {
  const response = await apiFetch<ApiResponse<XpStat>>('/xp/stat', {
    method: 'GET',
  });
  return response.data;
}

export async function getXpWeekly() {
  const response = await apiFetch<ApiResponse<XpDaily[]>>('/xp/weekly', {
    method: 'GET',
  });
  return response.data;
}

export async function getTodayXp() {
  const response = await apiFetch<ApiResponse<TodayXp>>('/xp/today', {
    method: 'GET',
  });
  return response.data;
}
