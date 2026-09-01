import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type ProblemChoice = {
  choiceNumber: number;
  choiceText: string;
};

export type Problem = {
  problemId: number;
  level: string;
  category: string;
  subType: string;
  questionFormat: string;
  questionText: string;
  passageText: string | null;
  choices: ProblemChoice[];
};

export type ProblemListRequest = {
  level: string;
  category: string;
  subType: string;
  count?: number;
  offset?: number;
};

export type ProblemList = {
  level: string;
  category: string;
  subType: string;
  totalProblemCount: number;
  offset: number;
  problemCount: number;
  problems: Problem[];
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

export type ProblemSetCompleteResult = {
  completionId: number;
  problemCount: number;
  correctCount: number;
  perfect: boolean;
  completedAt: string;
};

export type ProblemSolution = {
  submissionId: number;
  selectedChoiceNumber: number;
  answerChoiceNumber: number;
  answerChoiceText: string;
  correct: boolean;
  explanation: string;
  submittedAt: string;
};

export type ProblemSolutionList = {
  problemId: number;
  solutions: ProblemSolution[];
};

export type ProblemAccuracy = {
  totalSubmissionCount: number;
  correctSubmissionCount: number;
  wrongSubmissionCount: number;
  accuracyRate: number;
};

export type DailyProblemAccuracy = {
  date: string;
  dayOfWeek: string;
  dayLabel: string;
  totalSubmissionCount: number;
  correctSubmissionCount: number;
  wrongSubmissionCount: number;
  accuracyRate: number;
};

export type ProblemAccuracyTrend = {
  startDate: string;
  endDate: string;
  dailyAccuracies: DailyProblemAccuracy[];
};

export async function getProblems(request: ProblemListRequest) {
  const params = new URLSearchParams({
    level: request.level,
    category: request.category,
    subType: request.subType,
    ...(request.count != null ? { count: String(request.count) } : {}),
    ...(request.offset != null ? { offset: String(request.offset) } : {}),
  });
  const response = await apiFetch<ApiResponse<ProblemList>>(`/problems?${params.toString()}`, {
    method: 'GET',
  });
  return response.data;
}

export async function submitProblem(problemId: number, selectedChoiceNumber: number) {
  const response = await apiFetch<ApiResponse<ProblemSubmitResult>>(
    `/problems/${problemId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify({ selectedChoiceNumber }),
    },
  );
  return response.data;
}

export async function completeProblemSet(problemIds: number[]) {
  const response = await apiFetch<ApiResponse<ProblemSetCompleteResult>>(
    '/problems/sets/complete',
    {
      method: 'POST',
      body: JSON.stringify({ problemIds }),
    },
  );
  return response.data;
}

export async function getProblemSolution(problemId: number) {
  const response = await apiFetch<ApiResponse<ProblemSolutionList>>(
    `/problems/${problemId}/solution`,
    { method: 'GET' },
  );
  return response.data;
}

export async function getProblemAccuracy() {
  const response = await apiFetch<ApiResponse<ProblemAccuracy>>('/problems/accuracy', {
    method: 'GET',
  });
  return response.data;
}

export async function getProblemAccuracyTrend() {
  const response = await apiFetch<ApiResponse<ProblemAccuracyTrend>>('/problems/accuracy/trend', {
    method: 'GET',
  });
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

export async function getBookmarkedProblems() {
  const response = await apiFetch<ApiResponse<Problem[]>>('/problems/bookmarks', {
    method: 'GET',
  });
  return response.data;
}
