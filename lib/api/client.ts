import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from '@/lib/auth/session';
import { Platform } from 'react-native';

const DEFAULT_API_BASE_URL = 'https://qurve.duckdns.org';

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

type TokenReissueResponse = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

let tokenRefreshPromise: Promise<string | null> | null = null;

export class ApiError extends Error {
  code?: string;
  status: number;
  payload?: ErrorPayload;
  url?: string;

  constructor(message: string, status: number, payload?: ErrorPayload, url?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = payload?.code;
    this.status = status;
    this.payload = payload;
    this.url = url;
  }
}

export function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;

  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseHasApiPrefix = baseUrl.endsWith('/api');
  const pathHasApiPrefix = normalizedPath.startsWith('/api/');
  const apiPath =
    baseHasApiPrefix && pathHasApiPrefix
      ? normalizedPath.replace(/^\/api/, '')
      : baseHasApiPrefix || pathHasApiPrefix
        ? normalizedPath
        : `/api${normalizedPath}`;

  return `${baseUrl}${apiPath}`;
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

  const { success } = payload as ErrorPayload & { success?: boolean };

  return success === false;
}

async function requestNewAccessToken() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) return null;

  try {
    const response = await fetch(buildApiUrl('/auth/reissue'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const payload = (await parseResponse(response)) as TokenReissueResponse | null;
    const accessToken = payload?.data?.accessToken;
    const nextRefreshToken = payload?.data?.refreshToken ?? refreshToken;

    if (!response.ok || hasErrorCode(payload) || typeof accessToken !== 'string') {
      if (response.status === 401 || response.status === 403) {
        await clearAuthSession();
      }

      return null;
    }

    await saveAuthTokens(accessToken, nextRefreshToken);
    return accessToken;
  } catch {
    return null;
  }
}

async function refreshAccessToken() {
  if (!tokenRefreshPromise) {
    tokenRefreshPromise = requestNewAccessToken().finally(() => {
      tokenRefreshPromise = null;
    });
  }

  return tokenRefreshPromise;
}

function withAuthorization(headers: Record<string, string>, accessToken: string) {
  return {
    ...headers,
    Authorization: accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`,
  };
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...fetchOptions } = options;
  let normalizedHeaders = normalizeHeaders(headers);
  const url = buildApiUrl(path);
  let requestAccessToken: string | null = null;

  if (fetchOptions.body && !normalizedHeaders['Content-Type']) {
    normalizedHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    requestAccessToken = await getAccessToken();

    if (requestAccessToken) {
      normalizedHeaders = withAuthorization(normalizedHeaders, requestAccessToken);
    }
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers: normalizedHeaders,
    });
  } catch {
    throw new ApiError(
      '서버에 연결할 수 없습니다.',
      0,
      {
        code: 'NETWORK_ERROR',
        message: '서버에 연결할 수 없습니다.',
        url,
      },
      url,
    );
  }

  if (auth && response.status === 401) {
    const latestAccessToken = await getAccessToken();
    const nextAccessToken =
      latestAccessToken && latestAccessToken !== requestAccessToken
        ? latestAccessToken
        : await refreshAccessToken();

    if (nextAccessToken) {
      normalizedHeaders = withAuthorization(normalizedHeaders, nextAccessToken);

      try {
        response = await fetch(url, {
          ...fetchOptions,
          headers: normalizedHeaders,
        });
      } catch {
        throw new ApiError(
          '서버에 연결할 수 없습니다.',
          0,
          {
            code: 'NETWORK_ERROR',
            message: '서버에 연결할 수 없습니다.',
            url,
          },
          url,
        );
      }
    }
  }

  const payload = await parseResponse(response);

  if (!response.ok || hasErrorCode(payload)) {
    const errorPayload = payload && typeof payload === 'object' ? (payload as ErrorPayload) : {};
    const error = new ApiError(
      errorPayload.message || 'API 요청에 실패했습니다.',
      response.status,
      errorPayload,
      url,
    );

    if (__DEV__) {
      console.warn('[apiFetch] request failed', {
        url,
        status: response.status,
        code: error.code,
        message: error.message,
        payload: error.payload,
        hasAuthorization: Boolean(normalizedHeaders.Authorization),
      });
    }

    throw error;
  }

  return payload as T;
}
