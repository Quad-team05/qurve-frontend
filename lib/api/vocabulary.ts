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
