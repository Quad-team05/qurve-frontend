import { apiFetch, buildApiUrl } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth/session';
import * as FileSystem from 'expo-file-system/legacy';

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

export type BasicExpression = {
  expressionId: number;
  category: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  translation: string;
};

export async function getTodayExpression() {
  const response = await apiFetch<ApiResponse<TodayExpression>>('/expressions/today', {
    method: 'GET',
  });

  return response.data;
}

export async function getBasicExpressions() {
  const response = await apiFetch<ApiResponse<BasicExpression[]>>('/expressions/basic', {
    method: 'GET',
  });

  return response.data;
}

export async function downloadBasicExpressionAudio(expressionId: number) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('AUTH_AUDIO_ERROR');
  }

  const fileUri = `${FileSystem.cacheDirectory}basic-expression-${expressionId}.mp3`;
  await FileSystem.deleteAsync(fileUri, { idempotent: true });

  const result = await FileSystem.downloadAsync(
    buildApiUrl(`/expressions/basic/${expressionId}/audio`),
    fileUri,
    {
      headers: {
        Authorization: accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`,
      },
    },
  );

  if (result.status === 401 || result.status === 403) {
    throw new Error('AUTH_AUDIO_ERROR');
  }

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`AUDIO_STATUS_${result.status}`);
  }

  return result.uri;
}
