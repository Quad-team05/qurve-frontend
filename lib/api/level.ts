import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type LevelOption = {
  optionId: number;
  text: string;
};

export type PreQuestion = {
  questionId: number;
  question: string;
  options: LevelOption[];
};

export type PreQuestionList = {
  questions: PreQuestion[];
};

export type LevelTestRequest = {
  pre1Answer: number;
  pre2Answer: number;
  pre3Answer: number;
};

export type LevelTestQuestion = {
  questionId: number;
  questionText: string;
  difficulty: string;
  options: LevelOption[];
};

export type LevelTestQuestionList = {
  questions: LevelTestQuestion[];
};

export type LevelTestResultRequest = {
  pre1Answer: number;
  pre2Answer: number;
  pre3Answer: number;
  answers: number[]; // 정확히 10개
};

export type LevelTestResult = {
  score: number;
  correctCount: number;
  wrongCount: number;
  level: number;
};

export async function getPreQuestions() {
  const response = await apiFetch<ApiResponse<PreQuestionList>>('/level/pre-questions', {
    method: 'GET',
  });
  return response.data;
}

export async function getLevelTestQuestions(request: LevelTestRequest) {
  const response = await apiFetch<ApiResponse<LevelTestQuestionList>>('/level/test', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.data;
}

export async function submitLevelTestResult(request: LevelTestResultRequest) {
  const response = await apiFetch<ApiResponse<LevelTestResult>>('/level/test/result', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.data;
}

export async function saveLevel(level: number) {
  await apiFetch<ApiResponse<null>>('/level/save', {
    method: 'POST',
    body: JSON.stringify({ level }),
  });
}
