import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiFetch } from '../lib/api/client';

const session = vi.hoisted(() => ({
  clearAuthSession: vi.fn(),
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  saveAuthTokens: vi.fn(),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

vi.mock('@/lib/auth/session', () => session);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('apiFetch token reissue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('__DEV__', false);
    session.getAccessToken.mockResolvedValue('expired-access-token');
    session.getRefreshToken.mockResolvedValue('valid-refresh-token');
  });

  it('reissues an expired access token and retries the original request once', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ success: false, code: 'UNAUTHORIZED', message: '만료된 토큰입니다.' }, 401),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { nickname: 'Qurve' } }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiFetch<{ data: { nickname: string } }>('/users/profile');

    expect(result.data.nickname).toBe('Qurve');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: 'Bearer expired-access-token',
    });
    expect(fetchMock.mock.calls[1]).toEqual([
      'https://qurve.duckdns.org/api/auth/reissue',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      }),
    ]);
    expect(fetchMock.mock.calls[2][1]?.headers).toMatchObject({
      Authorization: 'Bearer new-access-token',
    });
    expect(session.saveAuthTokens).toHaveBeenCalledWith('new-access-token', 'new-refresh-token');
  });

  it('does not try to reissue tokens for unauthenticated requests', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ success: false, code: 'INVALID_PASSWORD', message: '로그인 실패' }, 401),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      apiFetch('/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ loginId: 'user', password: 'wrong' }),
      }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_PASSWORD' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(session.getRefreshToken).not.toHaveBeenCalled();
  });
});
