import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type BadgeCategoryCode =
  | 'ATTENDANCE'
  | 'LEARNING'
  | 'ACCURACY'
  | 'WRONG_NOTE'
  | 'VOCABULARY'
  | 'CHALLENGE'
  | 'STUDY_TIME'
  | 'LEVEL'
  | 'AI';

export type BadgeItem = {
  code: string;
  name: string;
  emoji: string;
  category: BadgeCategoryCode;
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
  badges: BadgeItem[];
};

export const BADGE_CATEGORY_LABELS: Record<BadgeCategoryCode, string> = {
  ATTENDANCE: '출석',
  LEARNING: '학습',
  ACCURACY: '정답률',
  WRONG_NOTE: '오답노트',
  VOCABULARY: '단어',
  CHALLENGE: '챌린지',
  STUDY_TIME: '학습시간',
  LEVEL: '급수',
  AI: 'AI',
};

export const BADGE_CATEGORY_ORDER: BadgeCategoryCode[] = [
  'ATTENDANCE',
  'LEARNING',
  'ACCURACY',
  'WRONG_NOTE',
  'VOCABULARY',
  'CHALLENGE',
  'STUDY_TIME',
  'LEVEL',
  'AI',
];

export function getBadgeCategoryLabel(category: BadgeCategoryCode) {
  return BADGE_CATEGORY_LABELS[category] ?? category;
}

export async function getMyBadges() {
  const response = await apiFetch<ApiResponse<BadgeList>>('/badges', {
    method: 'GET',
  });

  return response.data;
}
