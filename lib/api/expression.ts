import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type TodayExpression = {
  sentenceId: number;
  expression: string;
  learningLanguage: 'JAPANESE' | 'ENGLISH';
  japanese: string;
  korean: string;
  sourceUrl: string;
  license: string;
};

export async function getTodayExpression() {
  const response = await apiFetch<ApiResponse<TodayExpression>>('/expressions/today', {
    method: 'GET',
  });

  return response.data;
}
