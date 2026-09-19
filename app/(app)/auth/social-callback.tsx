import Text from '@/components/ui/AppText';
import { saveAuthSession } from '@/lib/auth/session';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Platform, ToastAndroid, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

export default function SocialCallbackPage() {
  const router = useRouter();
  const hasHandledCallback = useRef(false);
  const { accessToken, refreshToken } = useLocalSearchParams<{
    accessToken?: string;
    refreshToken?: string;
  }>();

  useEffect(() => {
    if (hasHandledCallback.current) return;
    hasHandledCallback.current = true;

    const completeSocialLogin = async () => {
      if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
        showToast('소셜 로그인 응답을 확인할 수 없습니다.');
        router.replace('/(app)/auth/login');
        return;
      }

      try {
        await saveAuthSession({
          accessToken,
          refreshToken,
          userDetails: {},
        });

        router.replace('/(tabs)');
      } catch {
        showToast('로그인 정보를 저장하지 못했습니다. 다시 시도해주세요.');
        router.replace('/(app)/auth/login');
      }
    };

    void completeSocialLogin();
  }, [accessToken, refreshToken, router]);

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-center font-regular text-sm text-text-brown">
        소셜 로그인 처리 중입니다...
      </Text>
    </View>
  );
}
