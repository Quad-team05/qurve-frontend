import type { ProblemItem, ProblemListRequest, ProblemSubmitResult } from '@/lib/api/problem';

export type ProblemSession = {
  request: ProblemListRequest;
  problems: ProblemItem[];
  startedAt: number;
  finishedAt: number | null;
  selectedChoiceNumbers: Record<number, number | null>;
  submissions: Record<number, ProblemSubmitResult>;
  bookmarks: Record<number, boolean>;
};

let currentProblemSession: ProblemSession | null = null;

export function createProblemSession(request: ProblemListRequest, problems: ProblemItem[]) {
  currentProblemSession = {
    request,
    problems,
    startedAt: Date.now(),
    finishedAt: null,
    selectedChoiceNumbers: Object.fromEntries(problems.map((problem) => [problem.problemId, null])),
    submissions: {},
    bookmarks: {},
  };

  return currentProblemSession;
}

export function getProblemSession() {
  return currentProblemSession;
}

export function setProblemSelection(problemId: number, choiceNumber: number | null) {
  if (!currentProblemSession) return;
  currentProblemSession.selectedChoiceNumbers[problemId] = choiceNumber;
}

export function setProblemSubmission(problemId: number, submission: ProblemSubmitResult) {
  if (!currentProblemSession) return;
  currentProblemSession.submissions[problemId] = submission;
  currentProblemSession.selectedChoiceNumbers[problemId] = submission.selectedChoiceNumber;
}

export function setProblemBookmarkState(problemId: number, bookmarked: boolean) {
  if (!currentProblemSession) return;
  currentProblemSession.bookmarks[problemId] = bookmarked;
}

export function completeProblemSession() {
  if (!currentProblemSession) return;
  currentProblemSession.finishedAt = Date.now();
}

export function clearProblemSession() {
  currentProblemSession = null;
}
