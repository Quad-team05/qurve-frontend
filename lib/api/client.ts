import { getAccessToken } from '@/lib/auth/session';
import { Platform } from 'react-native';

const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';

function resolveApiBaseUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

  if (Platform.OS !== 'android') return baseUrl;

  return baseUrl.replace('://localhost', '://10.0.2.2').replace('://127.0.0.1', '://10.0.2.2');
}

export const API_BASE_URL = resolveApiBaseUrl();

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

type ErrorPayload = {
  code?: string;
  message?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  code?: string;
  status: number;
  payload?: ErrorPayload;

  constructor(message: string, status: number, payload?: ErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.code = payload?.code;
    this.status = status;
    this.payload = payload;
  }
}

function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;

  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  const normalized: Record<string, string> = {};

  if (!headers) return normalized;

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    headers.forEach((value, key) => {
      normalized[key] = value;
    });
    return normalized;
  }

  if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      normalized[key] = value;
    });
    return normalized;
  }

  return { ...(headers as Record<string, string>) };
}

async function parseResponse(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function hasErrorCode(payload: unknown): payload is ErrorPayload {
  if (!payload || typeof payload !== 'object') return false;

  const { code, success } = payload as ErrorPayload & { success?: boolean };

  if (success === false) return true;

  return typeof code === 'string' && code !== 'SUCCESS';
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...fetchOptions } = options;
  const normalizedHeaders = normalizeHeaders(headers);
  const url = buildApiUrl(path);

  if (fetchOptions.body && !normalizedHeaders['Content-Type']) {
    normalizedHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const accessToken = await getAccessToken();

    if (accessToken) {
      normalizedHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers: normalizedHeaders,
    });
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다.', 0, {
      code: 'NETWORK_ERROR',
      message: '서버에 연결할 수 없습니다.',
      url,
    });
  }

  const payload = await parseResponse(response);

  if (!response.ok || hasErrorCode(payload)) {
    const errorPayload = payload && typeof payload === 'object' ? (payload as ErrorPayload) : {};
    throw new ApiError(
      errorPayload.message || 'API 요청에 실패했습니다.',
      response.status,
      errorPayload,
    );
  }

  return payload as T;
}
