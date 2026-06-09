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

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

type SignupRequest = {
  loginId: string;
  password: string;
  email: string;
  name: string;
  nickname: string;
};

type SignupUser = {
  userId: number;
  loginId: string;
  email: string;
  name: string;
  nickname: string;
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

export async function checkLoginId(loginId: string) {
  await apiFetch<ApiResponse<null>>(`/auth/check-id?loginId=${encodeURIComponent(loginId)}`, {
    method: 'GET',
    auth: false,
  });
}

export async function sendSignupEmail(email: string) {
  const response = await apiFetch<ApiResponse<{ email: string }>>('/auth/signup/email/send', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email }),
  });

  return response.data;
}

export async function verifyEmailCode(email: string, code: string) {
  const response = await apiFetch<ApiResponse<{ email: string }>>('/auth/email/verify', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, code, verificationCode: code }),
  });

  return response.data;
}

export async function signup(request: SignupRequest) {
  const response = await apiFetch<ApiResponse<SignupUser>>('/auth/signup', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(request),
  });

  return response.data;
}
