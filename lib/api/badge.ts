import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type BadgeCategory =
  | 'ATTENDANCE'
  | 'LEARNING'
  | 'ACCURACY'
  | 'WRONG_NOTE'
  | 'VOCABULARY'
  | 'CHALLENGE'
  | 'STUDY_TIME'
  | 'LEVEL'
  | 'AI';

export type Badge = {
  code: string;
  name: string;
  emoji: string;
  category: BadgeCategory;
  description: string;
  achieved: boolean;
  achievedAt: string | null;
  currentValue: number;
  targetValue: number;
  progressRate: number;
};

export type BadgeList = {
  totalCount: number;
  achievedCount: number;
  badges: Badge[];
};

export async function getBadges() {
  const response = await apiFetch<ApiResponse<BadgeList>>('/badges', {
    method: 'GET',
  });
  return response.data;
}
