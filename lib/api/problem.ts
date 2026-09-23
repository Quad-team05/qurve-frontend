import { apiFetch } from '@/lib/api/client';
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

export type Problem = {
  problemId: number;
  level: string;
  qurveLevel?: string | null;
  language?: string | null;
  cefrLevel?: string | null;
  usageType?: string | null;
  category: ProblemCategory;
  subType: ProblemSubType;
  questionFormat: string;
  topic?: string | null;
  questionText: string;
  passageText: string | null;
  audioUrl?: string | null;
  choices: ProblemChoice[];
};

export type ProblemItem = Problem;

export type ProblemListRequest = {
  level?: string;
  language?: string;
  cefrLevel?: string;
  qurveLevel?: string;
  usageType?: string;
  category: ProblemCategory;
  subType: ProblemSubType;
  topic?: string;
  count?: number;
  offset?: number;
};

export type ProblemList = {
  level: string;
  qurveLevel?: string | null;
  language?: string | null;
  cefrLevel?: string | null;
  usageType?: string | null;
  category: ProblemCategory;
  subType: ProblemSubType;
  topic?: string | null;
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
  const params = new URLSearchParams({ category: request.category, subType: request.subType });

  const optionalFilters = {
    level: request.level,
    language: request.language,
    cefrLevel: request.cefrLevel,
    qurveLevel: request.qurveLevel,
    usageType: request.usageType,
    topic: request.topic,
  };

  Object.entries(optionalFilters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  if (typeof request.count === 'number' && request.count > 0) {
    params.set('count', String(request.count));
  }

  if (typeof request.offset === 'number' && request.offset >= 0) {
    params.set('offset', String(request.offset));
  }

  const response = await apiFetch<ApiResponse<ProblemList>>(`/problems?${params.toString()}`, {
    method: 'GET',
  });

  return response.data;
}

export async function submitProblem(
  problemId: number,
  selectedChoiceNumberOrRequest: number | { selectedChoiceNumber: number },
) {
  const selectedChoiceNumber =
    typeof selectedChoiceNumberOrRequest === 'number'
      ? selectedChoiceNumberOrRequest
      : selectedChoiceNumberOrRequest.selectedChoiceNumber;

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

export const getProblemBookmarks = getBookmarkedProblems;
