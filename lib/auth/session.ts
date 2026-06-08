import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'qurve.accessToken';
const REFRESH_TOKEN_KEY = 'qurve.refreshToken';
const USER_DETAILS_KEY = 'qurve.userDetails';

export type UserDetails = Record<string, unknown>;

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  userDetails: UserDetails;
};

function getWebStorage() {
  if (Platform.OS !== 'web' || typeof globalThis.localStorage === 'undefined') return null;
  return globalThis.localStorage;
}

async function setItem(key: string, value: string) {
  const webStorage = getWebStorage();

  if (webStorage) {
    webStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  const webStorage = getWebStorage();

  if (webStorage) return webStorage.getItem(key);

  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  const webStorage = getWebStorage();

  if (webStorage) {
    webStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function saveAuthSession(session: AuthSession) {
  await Promise.all([
    setItem(ACCESS_TOKEN_KEY, session.accessToken),
    setItem(REFRESH_TOKEN_KEY, session.refreshToken),
    setItem(USER_DETAILS_KEY, JSON.stringify(session.userDetails ?? {})),
  ]);
}

export async function getAccessToken() {
  return getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function getUserDetails(): Promise<UserDetails | null> {
  const userDetails = await getItem(USER_DETAILS_KEY);

  if (!userDetails) return null;

  try {
    return JSON.parse(userDetails) as UserDetails;
  } catch {
    return null;
  }
}

export async function clearAuthSession() {
  await Promise.all([
    deleteItem(ACCESS_TOKEN_KEY),
    deleteItem(REFRESH_TOKEN_KEY),
    deleteItem(USER_DETAILS_KEY),
  ]);
}
