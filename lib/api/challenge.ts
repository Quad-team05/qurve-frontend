import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type ChallengeGoalType = {
  code: string;
  description: string;
};

export type ChallengeMain = {
  challengeId: number;
  title: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  completedDays: number;
  progressRate: number;
};

export type ChallengeStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED';

export type ChallengeManage = {
  challengeId: number;
  title: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
};

export type ChallengeCreateRequest = {
  title: string;
  goalType: string;
  targetValue: number;
  startDate: string;
  endDate: string;
};

export type ChallengeCreateResult = {
  challengeId: number;
  title: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
};

export async function getChallengeGoalTypes() {
  const response = await apiFetch<ApiResponse<ChallengeGoalType[]>>('/challenges/goal-types', {
    method: 'GET',
    auth: false,
  });
  return response.data;
}

export async function getChallengesForMain() {
  const response = await apiFetch<ApiResponse<ChallengeMain[]>>('/challenges/main', {
    method: 'GET',
  });
  return response.data;
}

export async function getMyChallenges() {
  const response = await apiFetch<ApiResponse<ChallengeManage[]>>('/challenges', {
    method: 'GET',
  });
  return response.data;
}

export async function createChallenge(request: ChallengeCreateRequest) {
  const response = await apiFetch<ApiResponse<ChallengeCreateResult>>('/challenges', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.data;
}
