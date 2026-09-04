import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type ChallengeGoalType = {
  code: ChallengeGoalTypeCode;
  description: string;
};

export type ChallengeGoalTypeCode = 'STUDY_TIME' | 'QUIZ_COUNT' | 'WORD_COUNT' | 'ATTENDANCE';

export const CHALLENGE_GOAL_TYPE_LABELS: Record<ChallengeGoalTypeCode, string> = {
  STUDY_TIME: '하루 학습 시간',
  QUIZ_COUNT: '문제 학습',
  WORD_COUNT: '단어 암기',
  ATTENDANCE: '출석',
};

export const CHALLENGE_GOAL_TYPE_ICONS: Record<ChallengeGoalTypeCode, string> = {
  STUDY_TIME: '🔥',
  QUIZ_COUNT: '📝',
  WORD_COUNT: '📘',
  ATTENDANCE: '✓',
};

export const CHALLENGE_GOAL_TYPE_TARGET_LABELS: Record<ChallengeGoalTypeCode, string> = {
  STUDY_TIME: '하루 목표 시간',
  QUIZ_COUNT: '문제 풀이 수',
  WORD_COUNT: '단어 개수',
  ATTENDANCE: '연속 출석일',
};

export const CHALLENGE_GOAL_TYPE_TARGET_UNITS: Record<ChallengeGoalTypeCode, string> = {
  STUDY_TIME: '분',
  QUIZ_COUNT: '문제',
  WORD_COUNT: '개',
  ATTENDANCE: '일',
};

export const CHALLENGE_GOAL_TYPE_SETTING_DESCRIPTIONS: Record<ChallengeGoalTypeCode, string> = {
  STUDY_TIME: '하루에 공부할 시간을 설정해주세요.',
  QUIZ_COUNT: '하루에 풀 문제 수를 설정해주세요.',
  WORD_COUNT: '챌린지 단어로 학습할 단어 개수를 설정해주세요.',
  ATTENDANCE: '며칠 연속 출석할지 설정해주세요.',
};

export const CHALLENGE_GOAL_TYPE_TARGET_OPTIONS: Record<ChallengeGoalTypeCode, number[]> = {
  STUDY_TIME: [15, 30, 60, 90],
  QUIZ_COUNT: [5, 10, 20, 30],
  WORD_COUNT: [10, 20, 30, 50],
  ATTENDANCE: [3, 7, 14, 30],
};

export const CHALLENGE_GOAL_TYPE_DEFAULT_TARGETS: Record<ChallengeGoalTypeCode, number> = {
  STUDY_TIME: 30,
  QUIZ_COUNT: 10,
  WORD_COUNT: 20,
  ATTENDANCE: 7,
};

export const CHALLENGE_GOAL_TYPE_TARGET_STEPS: Record<ChallengeGoalTypeCode, number> = {
  STUDY_TIME: 15,
  QUIZ_COUNT: 5,
  WORD_COUNT: 5,
  ATTENDANCE: 1,
};

export const DEFAULT_CHALLENGE_GOAL_TYPES: ChallengeGoalType[] = [
  { code: 'STUDY_TIME', description: '학습 시간' },
  { code: 'QUIZ_COUNT', description: '퀴즈 풀이 수' },
  { code: 'WORD_COUNT', description: '단어 암기' },
  { code: 'ATTENDANCE', description: '출석' },
];

export type ChallengeMain = {
  challengeId: number;
  title: string;
  goalType: ChallengeGoalTypeCode;
  targetValue: number;
  currentValue: number;
  completedDays: number;
  progressRate: number;
};

export type ChallengeStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED';

export type ChallengeManage = {
  challengeId: number;
  title: string;
  goalType: ChallengeGoalTypeCode;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  progressRate?: number;
};

export type ChallengeManagement = {
  streakDays: number;
  totalProgressRate: number;
  activeChallengeCount: number;
  completedChallengeCount: number;
  activeChallenges: ChallengeManage[];
  completedChallenges: ChallengeManage[];
  failedChallenges?: ChallengeManage[];
};

export type ChallengeCreateRequest = {
  title: string;
  goalType: ChallengeGoalTypeCode;
  targetValue: number;
  startDate: string;
  endDate: string;
};

export type ChallengeCreateResult = {
  challengeId: number;
  title: string;
  goalType: ChallengeGoalTypeCode;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
};

export type ChallengeUpdateRequest = {
  title: string;
  targetValue: number;
  startDate: string;
  endDate: string;
};

export type ChallengeUpdateResult = ChallengeCreateResult;

export async function getChallengeGoalTypes() {
  try {
    const response = await apiFetch<ApiResponse<ChallengeGoalType[]>>('/challenges/goal-types', {
      method: 'GET',
      auth: false,
    });
    return response.data;
  } catch {
    return DEFAULT_CHALLENGE_GOAL_TYPES;
  }
}

export async function getChallengesForMain() {
  const response = await apiFetch<ApiResponse<ChallengeMain[]>>('/challenges/main', {
    method: 'GET',
  });
  return response.data;
}

export async function getMyChallenges() {
  const response = await apiFetch<ApiResponse<ChallengeManagement | ChallengeManage[]>>(
    '/challenges',
    {
      method: 'GET',
    },
  );
  return response.data;
}

export function normalizeChallengeManagement(
  data: ChallengeManagement | ChallengeManage[],
): ChallengeManagement {
  if (!Array.isArray(data)) {
    return {
      ...data,
      activeChallenges: data.activeChallenges ?? [],
      completedChallenges: data.completedChallenges ?? [],
      failedChallenges: data.failedChallenges ?? [],
    };
  }

  const activeChallenges = data.filter((challenge) => challenge.status === 'ACTIVE');
  const completedChallenges = data.filter((challenge) => challenge.status === 'COMPLETED');
  const failedChallenges = data.filter((challenge) => challenge.status === 'FAILED');
  const totalProgressRate =
    data.length === 0
      ? 0
      : Math.round(
          data.reduce((sum, challenge) => {
            if (typeof challenge.progressRate === 'number') return sum + challenge.progressRate;
            if (challenge.targetValue <= 0) return sum;
            return sum + Math.round((challenge.currentValue / challenge.targetValue) * 100);
          }, 0) / data.length,
        );

  return {
    streakDays: 0,
    totalProgressRate,
    activeChallengeCount: activeChallenges.length,
    completedChallengeCount: completedChallenges.length,
    activeChallenges,
    completedChallenges,
    failedChallenges,
  };
}

export async function createChallenge(request: ChallengeCreateRequest) {
  const response = await apiFetch<ApiResponse<ChallengeCreateResult>>('/challenges', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.data;
}

export async function updateChallenge(challengeId: number, request: ChallengeUpdateRequest) {
  const response = await apiFetch<ApiResponse<ChallengeUpdateResult>>(
    `/challenges/${challengeId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(request),
    },
  );
  return response.data;
}

export async function deleteChallenge(challengeId: number) {
  await apiFetch<ApiResponse<null>>(`/challenges/${challengeId}`, {
    method: 'DELETE',
  });
}
