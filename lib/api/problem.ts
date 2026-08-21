import { apiFetch } from '@/lib/api/client';
import type { JlptLevel } from '@/lib/api/vocabulary';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type ProblemCategory = string;
export type ProblemSubType = string;

export type ProblemChoice = {
  choiceNumber: number;
  choiceText: string;
};

export type ProblemItem = {
  problemId: number;
  level: JlptLevel;
  category: ProblemCategory;
  subType: ProblemSubType;
  questionFormat: string;
  questionText: string;
  passageText: string;
  choices: ProblemChoice[];
};

export type ProblemListData = {
  level: JlptLevel;
  category: ProblemCategory;
  subType: ProblemSubType;
  totalProblemCount: number;
  offset: number;
  problemCount: number;
  problems: ProblemItem[];
};

export type ProblemListRequest = {
  level: JlptLevel;
  category: ProblemCategory;
  subType: ProblemSubType;
  count?: number;
  offset?: number;
};

export type ProblemSubmitRequest = {
  selectedChoiceNumber: number;
};

export type ProblemSubmitResult = {
  problemId: number;
  submissionId: number;
  selectedChoiceNumber: number;
  answerChoiceNumber: number;
  answerChoiceText: string;
  correct: boolean;
  explanation: string;
};

export type ProblemSolutionItem = {
  submissionId: number;
  selectedChoiceNumber: number;
  answerChoiceNumber: number;
  answerChoiceText: string;
  correct: boolean;
  explanation: string;
  submittedAt: string;
};

export type ProblemSolutionListData = {
  problemId: number;
  solutions: ProblemSolutionItem[];
};

export async function getProblems(request: ProblemListRequest) {
  const params = new URLSearchParams({
    level: request.level,
    category: request.category,
    subType: request.subType,
  });

  if (typeof request.count === 'number' && request.count > 0) {
    params.set('count', String(request.count));
  }

  if (typeof request.offset === 'number' && request.offset >= 0) {
    params.set('offset', String(request.offset));
  }

  const response = await apiFetch<ApiResponse<ProblemListData>>(`/problems?${params.toString()}`, {
    method: 'GET',
  });

  return response.data;
}

export async function submitProblem(problemId: number, request: ProblemSubmitRequest) {
  const response = await apiFetch<ApiResponse<ProblemSubmitResult>>(
    `/problems/${problemId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
  );

  return response.data;
}

export async function getProblemSolution(problemId: number) {
  const response = await apiFetch<ApiResponse<ProblemSolutionListData>>(
    `/problems/${problemId}/solution`,
    {
      method: 'GET',
    },
  );

  return response.data;
}

export async function addProblemBookmark(problemId: number) {
  await apiFetch<ApiResponse<null>>(`/problems/bookmarks/${problemId}`, {
    method: 'POST',
  });
}

export async function removeProblemBookmark(problemId: number) {
  await apiFetch<ApiResponse<null>>(`/problems/bookmarks/${problemId}`, {
    method: 'DELETE',
  });
}
