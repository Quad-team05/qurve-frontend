import { API_BASE_URL } from '@/lib/api/client';
import { saveAuthSession } from '@/lib/auth/session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

type SocialLoginResult =
  | { success: true }
  | { success: false; cancelled: true }
  | { success: false; cancelled: false; message: string };

type SocialProvider = 'kakao' | 'naver' | 'google';

function getSocialBaseUrl() {
  return API_BASE_URL.replace(/\/api\/?$/, '');
}

function extractTokens(callbackUrl: string) {
  const parsed = Linking.parse(callbackUrl);
  const accessToken = parsed.queryParams?.accessToken;
  const refreshToken = parsed.queryParams?.refreshToken;

  if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

async function loginWithProvider(
  provider: SocialProvider,
  providerLabel: string,
): Promise<SocialLoginResult> {
  const loginUrl = `${getSocialBaseUrl()}/oauth2/authorization/${provider}`;
  const redirectUrl = Linking.createURL('auth/social-callback');

  try {
    const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUrl);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { success: false, cancelled: true };
    }

    if (result.type !== 'success' || !result.url) {
      return {
        success: false,
        cancelled: false,
        message: `${providerLabel} 로그인에 실패했습니다.`,
      };
    }

    const tokens = extractTokens(result.url);

    if (!tokens) {
      return {
        success: false,
        cancelled: false,
        message: `${providerLabel} 로그인 응답을 확인할 수 없습니다.`,
      };
    }

    await saveAuthSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userDetails: {},
    });

    return { success: true };
  } catch {
    return {
      success: false,
      cancelled: false,
      message: `${providerLabel} 로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.`,
    };
  }
}

export async function loginWithKakao(): Promise<SocialLoginResult> {
  return loginWithProvider('kakao', '카카오');
}

export async function loginWithNaver(): Promise<SocialLoginResult> {
  return loginWithProvider('naver', '네이버');
}

export async function loginWithGoogle(): Promise<SocialLoginResult> {
  return loginWithProvider('google', '구글');
}
