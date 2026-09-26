import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type UserProfile = {
  userId: number;
  loginId: string;
  email: string;
  name: string;
  nickname: string;
  learningGoal: string | null;
  learningStage?: string | null;
  learningStageEditable?: boolean;
  learningLanguage?: 'JAPANESE' | 'ENGLISH';
  currentLevel: number | null;
  emailVerified: boolean;
  role: string;
  createdAt: string;
};

type UserProfileUpdateRequest = {
  name: string;
  nickname: string;
  learningGoal?: string | null;
  currentLevel?: number | null;
};

type UserPasswordChangeRequest = {
  currentPassword: string;
  newPassword: string;
};

export async function getMyProfile() {
  const response = await apiFetch<ApiResponse<UserProfile>>('/users/profile', {
    method: 'GET',
  });

  return response.data;
}

export async function updateMyProfile(request: UserProfileUpdateRequest) {
  const response = await apiFetch<ApiResponse<UserProfile>>('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(request),
  });

  return response.data;
}

export async function changeMyPassword(request: UserPasswordChangeRequest) {
  await apiFetch<ApiResponse<null>>('/users/password', {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

export type LearningLanguage = 'JAPANESE' | 'ENGLISH';
export type LearningGoal = 'DAILY_LIFE' | 'JLPT' | 'TOEIC';
export type LearningStage =
  | 'JLPT_N1'
  | 'JLPT_N2'
  | 'JLPT_N3'
  | 'JLPT_N4'
  | 'JLPT_N5'
  | 'TOEIC_500_PLUS'
  | 'TOEIC_600_PLUS'
  | 'TOEIC_700_PLUS'
  | 'TOEIC_800_PLUS'
  | 'TOEIC_900_PLUS';

export type LearningProfileResult = {
  learningLanguage: LearningLanguage;
  learningGoal: LearningGoal;
  currentLevel: number | null;
  learningStage: LearningStage | null;
  learningStageLabel: string | null;
  learningStageEditable: boolean;
};

export type LearningLanguageResult = {
  learningLanguage: LearningLanguage;
};

export async function updateLearningLanguage(learningLanguage: LearningLanguage) {
  const response = await apiFetch<ApiResponse<LearningLanguageResult>>('/users/language', {
    method: 'PATCH',
    body: JSON.stringify({ learningLanguage }),
  });
  return response.data;
}

export async function updateLearningProfile(
  learningGoal: LearningGoal,
  learningStage: LearningStage | null,
) {
  const response = await apiFetch<ApiResponse<LearningProfileResult>>('/users/learning-profile', {
    method: 'PATCH',
    body: JSON.stringify({ learningGoal, learningStage }),
  });
  return response.data;
}
