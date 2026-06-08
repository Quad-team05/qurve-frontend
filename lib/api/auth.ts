import { apiFetch } from '@/lib/api/client';
import { saveAuthSession } from '@/lib/auth/session';
import type { UserDetails } from '@/lib/auth/session';

type LoginRequest = {
  loginId: string;
  password: string;
};

type LoginData = {
  accessToken: string;
  refreshToken: string;
  userDetails: UserDetails;
};

type LoginResponse = {
  code?: string;
  message?: string;
  data: LoginData;
};

export async function login(request: LoginRequest) {
  const response = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(request),
  });

  await saveAuthSession(response.data);

  return response.data;
}
