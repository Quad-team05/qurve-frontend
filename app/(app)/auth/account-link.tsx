import Text from '@/components/ui/AppText';
import TextInput from '@/components/ui/AppTextInput';
import TopBar from '@/components/ui/TopBar';
import { linkGoogleAccount, login } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { getMyProfile, hasCompletedLevelTest } from '@/lib/api/user';
import { clearAuthSession, clearNeedsLevelTest } from '@/lib/auth/session';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

function normalizeParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function GoogleAccountLinkPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ linkTicket?: string | string[] }>();
  const linkTicket = normalizeParam(params.linkTicket);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = isSubmitting || !linkTicket || !loginId.trim() || !password;

  const handleLinkAccount = async () => {
    if (!linkTicket) {
      showToast('Google 계정 연결 정보가 만료되었습니다. 다시 로그인해주세요.');
      router.replace('/(app)/auth/login');
      return;
    }

    if (!loginId.trim() || !password) {
      showToast('기존 계정의 아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ loginId: loginId.trim(), password });
      await linkGoogleAccount({ linkTicket, password });

      const profile = await getMyProfile();

      if (!hasCompletedLevelTest(profile)) {
        router.replace('/(app)/level/language-select');
        return;
      }

      await clearNeedsLevelTest();
      router.replace('/(tabs)');
    } catch (error) {
      await clearAuthSession();

      if (
        error instanceof ApiError &&
        (error.status === 401 ||
          error.code === 'USER_NOT_FOUND' ||
          error.code === 'INVALID_PASSWORD')
      ) {
        showToast('기존 계정 정보를 확인해주세요.');
        return;
      }

      showToast(error instanceof ApiError ? error.message : 'Google 계정을 연결하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="Google 계정 연결" />
      <View className="flex-1 px-5 pt-7">
        <View className="mx-auto h-[10px] w-[50px] rounded-[1px] bg-[#B8D4F0]" />
        <View className="rounded-sm border border-border bg-white px-4 py-5">
          <Text className="font-bold text-lg text-btn-dark">기존 Qurve 계정과 연결할까요?</Text>
          <Text className="mt-2 text-sm leading-5 text-text-brown">
            같은 이메일로 가입된 계정이 있습니다. 기존 계정 정보를 확인하면 다음부터 Google로
            로그인할 수 있어요.
          </Text>

          <Text className="mb-1 mt-6 text-xs text-[#A09080]">기존 계정 아이디</Text>
          <TextInput
            value={loginId}
            onChangeText={setLoginId}
            placeholder="아이디를 입력해주세요"
            placeholderTextColor="#C0B8B0"
            autoCapitalize="none"
            autoCorrect={false}
            className="w-full rounded-sm border border-border bg-bg px-3 py-4 text-base text-btn-dark"
          />

          <Text className="mb-1 mt-3 text-xs text-[#A09080]">비밀번호</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호를 입력해주세요"
            placeholderTextColor="#C0B8B0"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => void handleLinkAccount()}
            className="w-full rounded-sm border border-border bg-bg px-3 py-4 text-base text-btn-dark"
          />

          <Pressable
            className={`mt-5 min-h-[50px] items-center justify-center rounded-lg ${
              isDisabled ? 'bg-[#B9B2A7]' : 'bg-btn-dark'
            }`}
            disabled={isDisabled}
            onPress={() => void handleLinkAccount()}
          >
            <Text className="font-bold text-base text-white">
              {isSubmitting ? '연결 중...' : 'Google 계정 연결하기'}
            </Text>
          </Pressable>

          <Pressable
            className="mt-3 min-h-[44px] items-center justify-center"
            disabled={isSubmitting}
            onPress={() => router.replace('/(app)/auth/login')}
          >
            <Text className="text-sm font-semibold text-text-brown">취소</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
