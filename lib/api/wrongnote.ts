import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type WrongNoteReviewComplete = {
  reviewId: number;
  problemCount: number;
  completedAt: string;
};

export type WrongNoteSummary = {
  wrongNoteId: number;
  problemId: number;
  wrongSubmissionId: number;
  title: string;
  level: string;
  category: string;
  subType: string;
  wrongAnsweredDate: string;
  reviewedDate: string | null;
  reviewed: boolean;
  retryCorrect: boolean;
};

export type WrongNoteList = {
  yearMonth: string;
  wrongNoteDates: string[];
  wrongNotes: WrongNoteSummary[];
};

export type WrongNoteChoice = {
  choiceNumber: number;
  choiceText: string;
};

export type WrongNoteSolution = {
  wrongNoteId: number;
  problemId: number;
  level: string;
  language: string;
  category: string;
  subType: string;
  questionFormat: string;
  questionText: string;
  passageText: string | null;
  audioUrl: string | null;
  choices: WrongNoteChoice[];
  selectedChoiceNumber: number;
  answerChoiceNumber: number;
  explanation: string;
  koreanTranslation: string | null;
  wrongAnsweredDate: string;
  reviewedDate: string | null;
  reviewed: boolean;
  retryCorrect: boolean;
};

export async function getWrongNotes(yearMonth: string) {
  const response = await apiFetch<ApiResponse<WrongNoteList>>(
    `/wrong-notes?yearMonth=${encodeURIComponent(yearMonth)}`,
    { method: 'GET' },
  );

  return response.data;
}

export async function getWrongNoteSolution(problemId: number, wrongSubmissionId?: number) {
  const query = wrongSubmissionId
    ? `?wrongSubmissionId=${encodeURIComponent(String(wrongSubmissionId))}`
    : '';
  const response = await apiFetch<ApiResponse<WrongNoteSolution>>(
    `/wrong-notes/${problemId}/solution${query}`,
    { method: 'GET' },
  );

  return response.data;
}

export async function completeWrongNoteReview(problemIds: number[]) {
  const response = await apiFetch<ApiResponse<WrongNoteReviewComplete>>(
    '/wrong-notes/reviews/complete',
    {
      method: 'POST',
      body: JSON.stringify({ problemIds }),
    },
  );
  return response.data;
}
