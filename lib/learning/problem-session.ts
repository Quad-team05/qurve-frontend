import type { ProblemItem, ProblemListRequest, ProblemSubmitResult } from '@/lib/api/problem';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const COMPLETED_PROBLEM_SESSION_KEY = 'qurve.completedProblemSession';

export type ProblemSession = {
  request: ProblemListRequest;
  problems: ProblemItem[];
  startedAt: number;
  finishedAt: number | null;
  currentQuestionIndex: number;
  selectedChoiceNumbers: Record<number, number | null>;
  submissions: Record<number, ProblemSubmitResult>;
  bookmarks: Record<number, boolean>;
};

let currentProblemSession: ProblemSession | null = null;
let completedProblemSession: ProblemSession | null = null;

function getWebStorage() {
  if (Platform.OS !== 'web' || typeof globalThis.localStorage === 'undefined') return null;
  return globalThis.localStorage;
}

async function setItem(key: string, value: string) {
  const webStorage = getWebStorage();

  if (webStorage) {
    webStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  const webStorage = getWebStorage();

  if (webStorage) return webStorage.getItem(key);

  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  const webStorage = getWebStorage();

  if (webStorage) {
    webStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

async function persistCompletedProblemSession() {
  if (!completedProblemSession) {
    await deleteItem(COMPLETED_PROBLEM_SESSION_KEY);
    return;
  }

  await setItem(COMPLETED_PROBLEM_SESSION_KEY, JSON.stringify(completedProblemSession));
}

export function createProblemSession(request: ProblemListRequest, problems: ProblemItem[]) {
  currentProblemSession = {
    request,
    problems,
    startedAt: Date.now(),
    finishedAt: null,
    currentQuestionIndex: 0,
    selectedChoiceNumbers: Object.fromEntries(problems.map((problem) => [problem.problemId, null])),
    submissions: {},
    bookmarks: {},
  };

  return currentProblemSession;
}

export function getProblemSession() {
  return currentProblemSession;
}

export async function loadCompletedProblemSession() {
  if (completedProblemSession) return completedProblemSession;

  const savedSession = await getItem(COMPLETED_PROBLEM_SESSION_KEY);

  if (!savedSession) return null;

  try {
    completedProblemSession = JSON.parse(savedSession) as ProblemSession;
    return completedProblemSession;
  } catch {
    completedProblemSession = null;
    await deleteItem(COMPLETED_PROBLEM_SESSION_KEY);
    return null;
  }
}

export function getCompletedProblemSession() {
  return completedProblemSession;
}

export function setProblemCurrentQuestionIndex(questionIndex: number) {
  if (!currentProblemSession) return;
  currentProblemSession.currentQuestionIndex = questionIndex;
}

export function setProblemSelection(problemId: number, choiceNumber: number | null) {
  if (!currentProblemSession) return;
  currentProblemSession.selectedChoiceNumbers[problemId] = choiceNumber;
}

export function setProblemSubmission(problemId: number, submission: ProblemSubmitResult) {
  if (currentProblemSession) {
    currentProblemSession.submissions[problemId] = submission;
    currentProblemSession.selectedChoiceNumbers[problemId] = submission.selectedChoiceNumber;
  }

  if (completedProblemSession) {
    completedProblemSession.submissions[problemId] = submission;
    completedProblemSession.selectedChoiceNumbers[problemId] = submission.selectedChoiceNumber;
    void persistCompletedProblemSession();
  }
}

export function setProblemBookmarkState(problemId: number, bookmarked: boolean) {
  if (currentProblemSession) {
    currentProblemSession.bookmarks[problemId] = bookmarked;
  }

  if (completedProblemSession) {
    completedProblemSession.bookmarks[problemId] = bookmarked;
    void persistCompletedProblemSession();
  }
}

export function completeProblemSession() {
  if (!currentProblemSession) return;

  currentProblemSession.finishedAt = Date.now();
  completedProblemSession = JSON.parse(JSON.stringify(currentProblemSession)) as ProblemSession;
  void persistCompletedProblemSession();
}

export function clearProblemSession() {
  currentProblemSession = null;
}
