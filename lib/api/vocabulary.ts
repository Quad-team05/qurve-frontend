import { apiFetch } from '@/lib/api/client';

export type JlptLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

export type VocabUnitStatus = 'BEFORE' | 'IN_PROGRESS' | 'COMPLETED';

export type VocabUnit = {
  level: JlptLevel;
  unitNumber: number;
  unitName: string;
  status: VocabUnitStatus;
  statusText: string;
};

export type VocabWord = {
  wordId: number;
  orderNumber: number;
  expression: string;
  reading: string;
  meaning: string;
  meaningKo?: string;
  koreanMeaning?: string;
  meaningKr?: string;
  meaningKorean?: string;
};

export type VocabWordsData = {
  level: JlptLevel;
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

export async function getVocabUnits(level: JlptLevel) {
  const response = await apiFetch<ApiResponse<VocabUnit[]>>(
    `/vocabularies/units?level=${encodeURIComponent(level)}`,
  );

  return response.data;
}

export async function getVocabWords(level: JlptLevel, unitNumber: number) {
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

export async function startVocabUnit(level: JlptLevel, unitNumber: number) {
  await apiFetch<ApiResponse<null>>(
    `/vocabularies/units/${unitNumber}/start?level=${encodeURIComponent(level)}`,
    { method: 'PATCH' },
  );
}

export async function completeVocabUnit(level: JlptLevel, unitNumber: number) {
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
