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
