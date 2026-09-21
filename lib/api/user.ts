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
