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
  currentLevel: number | null;
  emailVerified: boolean;
  role: string;
  createdAt: string;
};

export async function getMyProfile() {
  const response = await apiFetch<ApiResponse<UserProfile>>('/users/profile', {
    method: 'GET',
  });

  return response.data;
}
