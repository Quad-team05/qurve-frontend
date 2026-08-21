import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type TodayLearning = {
  level: string;
  categoryCode: string;
  subTypeCode: string;
  offset: number;
  category: string;
  title: string;
  totalQuestionCount: number;
  estimatedMinutes: number;
};

export async function getTodayLearning() {
  const response = await apiFetch<ApiResponse<TodayLearning>>('/learnings/today', {
    method: 'GET',
  });

  return response.data;
}
