import { ApiError } from '@/lib/api/client';
import { getMyProfile, hasCompletedLevelTest } from '@/lib/api/user';
import {
  clearAuthSession,
  clearNeedsLevelTest,
  getAccessToken,
  getRefreshToken,
} from '@/lib/auth/session';
import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [destination, setDestination] = useState<Href | null>(null);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const [accessToken, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()]);

      if (!accessToken && !refreshToken) {
        if (mounted) setDestination('/(app)/auth/login');
        return;
      }

      try {
        const profile = await getMyProfile();

        if (!mounted) return;

        if (!hasCompletedLevelTest(profile)) {
          setDestination('/(app)/level/language-select');
          return;
        }

        await clearNeedsLevelTest();
        if (mounted) setDestination('/(tabs)');
      } catch (error) {
        if (!mounted) return;

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          await clearAuthSession();
          if (mounted) setDestination('/(app)/auth/login');
          return;
        }

        // 네트워크가 일시적으로 끊겨도 유효한 로컬 세션을 버리지는 않는다.
        setDestination('/(tabs)');
      }
    };

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (!destination) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#2A2018" />
      </View>
    );
  }

  return <Redirect href={destination} />;
}
