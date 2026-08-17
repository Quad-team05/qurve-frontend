import Text from '@/components/ui/AppText';
import { saveAuthSession } from '@/lib/auth/session';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform, ToastAndroid, View } from 'react-native';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

export default function SocialCallbackPage() {
  const router = useRouter();
  const { accessToken, refreshToken } = useLocalSearchParams<{
    accessToken?: string;
    refreshToken?: string;
  }>();

  useEffect(() => {
    const completeSocialLogin = async () => {
      if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
        showToast('카카오 로그인 응답을 확인할 수 없습니다.');
        router.replace('/(app)/auth/login');
        return;
      }

      await saveAuthSession({
        accessToken,
        refreshToken,
        userDetails: {},
      });

      router.replace('/(tabs)');
    };

    void completeSocialLogin();
  }, [accessToken, refreshToken, router]);

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-center font-regular text-sm text-text-brown">
        카카오 로그인 처리 중입니다...
      </Text>
    </View>
  );
}
