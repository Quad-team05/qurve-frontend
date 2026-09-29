import { apiFetch, buildApiUrl } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth/session';
import * as FileSystem from 'expo-file-system/legacy';

export type JlptLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type VocabularyLevel = JlptLevel | CefrLevel;

export type VocabUnitStatus = 'BEFORE' | 'IN_PROGRESS' | 'COMPLETED';

export type VocabUnit = {
  level: VocabularyLevel;
  unitNumber: number;
  unitName: string;
  status: VocabUnitStatus;
  statusText: string;
};

export type VocabWord = {
  wordId: number;
  orderNumber: number;
  expression: string;
  reading?: string | null;
  meaning: string;
  meaningKo?: string;
  koreanMeaning?: string;
  meaningKr?: string;
  meaningKorean?: string;
};

export type VocabWordsData = {
  level: VocabularyLevel;
  unitNumber: number;
  totalCount: number;
  words: VocabWord[];
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type ChallengeWordCompleteResult = {
  submittedWordCount: number;
  newlyLearnedWordCount: number;
};

export async function getVocabUnits(level: VocabularyLevel) {
  const response = await apiFetch<ApiResponse<VocabUnit[]>>(
    `/vocabularies/units?level=${encodeURIComponent(level)}`,
  );

  return response.data;
}

export async function getVocabWords(level: VocabularyLevel, unitNumber: number) {
  const response = await apiFetch<ApiResponse<VocabWordsData>>(
    `/vocabularies/units/${unitNumber}/words?level=${encodeURIComponent(level)}`,
  );

  return response.data;
}

export async function addVocabBookmark(wordId: number) {
  await apiFetch<ApiResponse<null>>(`/vocabularies/bookmarks/${wordId}`, {
    method: 'POST',
  });
}

export async function removeVocabBookmark(wordId: number) {
  await apiFetch<ApiResponse<null>>(`/vocabularies/bookmarks/${wordId}`, {
    method: 'DELETE',
  });
}

export async function startVocabUnit(level: VocabularyLevel, unitNumber: number) {
  await apiFetch<ApiResponse<null>>(
    `/vocabularies/units/${unitNumber}/start?level=${encodeURIComponent(level)}`,
    { method: 'PATCH' },
  );
}

export async function completeVocabUnit(level: VocabularyLevel, unitNumber: number) {
  await apiFetch<ApiResponse<null>>(
    `/vocabularies/units/${unitNumber}/complete?level=${encodeURIComponent(level)}`,
    { method: 'PATCH' },
  );
}

export async function getChallengeWords() {
  const response = await apiFetch<ApiResponse<VocabWord[]>>('/vocabularies/challenge-words', {
    method: 'GET',
  });
  return response.data;
}

export async function completeChallengeWords(wordIds: number[]) {
  const response = await apiFetch<ApiResponse<ChallengeWordCompleteResult>>(
    '/vocabularies/challenge-words/complete',
    {
      method: 'POST',
      body: JSON.stringify({ wordIds }),
    },
  );
  return response.data;
}

export async function getBookmarkedWords() {
  const response = await apiFetch<ApiResponse<VocabWord[]>>('/vocabularies/bookmarks', {
    method: 'GET',
  });
  return response.data;
}

export async function getVocabAudioSource(wordId: number) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('AUTH_AUDIO_ERROR');
  }

  const fileUri = `${FileSystem.cacheDirectory}vocabulary-${wordId}.mp3`;
  await FileSystem.deleteAsync(fileUri, { idempotent: true });

  const result = await FileSystem.downloadAsync(
    buildApiUrl(`/vocabularies/${wordId}/audio`),
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

  return {
    uri: result.uri,
  };
}
