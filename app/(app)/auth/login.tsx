import Text from '@/components/ui/AppText';
import TextInput from '@/components/ui/AppTextInput';
import { login } from '@/lib/api/auth';
import { API_BASE_URL, ApiError } from '@/lib/api/client';
import { getMyProfile } from '@/lib/api/user';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ToastAndroid, View } from 'react-native';

const LOGIN_ERROR_MESSAGE = '로그인 정보를 확인해주세요.';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasEmptyField = !loginId.trim() || !password.trim();
  const isLoginDisabled = isSubmitting || hasEmptyField;

  const handleLogin = async () => {
    if (isLoginDisabled) {
      showToast('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    const trimmedLoginId = loginId.trim();
    const trimmedPassword = password.trim();

    try {
      setIsSubmitting(true);

      if (__DEV__) {
        console.warn('[login] submitting', {
          apiBaseUrl: API_BASE_URL,
          loginId: trimmedLoginId,
          loginIdLength: trimmedLoginId.length,
          passwordLength: trimmedPassword.length,
        });
      }

      await login({
        loginId: trimmedLoginId,
        password: trimmedPassword,
      });

      const profile = await getMyProfile();

      if (profile.currentLevel == null) {
        router.replace('/(app)/level/language-select');
        return;
      }

      router.replace('/(tabs)');
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 ||
          error.code === 'USER_NOT_FOUND' ||
          error.code === 'INVALID_PASSWORD')
      ) {
        showToast(LOGIN_ERROR_MESSAGE);
        return;
      }

      showToast(error instanceof ApiError ? error.message : '로그인 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-bg px-5 py-9">
      <View className="mb-6 flex-row items-center justify-between rounded-sm"></View>
      <Text className="text-[11px] font-medium text-[#A09080]">학습의 새로운 경험</Text>
      <Text className="mt-[7px] text-[40px] font-extrabold text-btn-dark">Qurve</Text>
      <View className="ml-[12px] mt-3 h-[10px] w-[50px] rounded-[1px] bg-[#FFE566]" />
      <View className="w-full rounded-sm border border-border bg-white px-4 py-4">
        <Text className="text-base text-xs text-[#A09080]">아이디</Text>
        <TextInput
          value={loginId}
          onChangeText={setLoginId}
          placeholder="아이디를 입력해주세요"
          placeholderTextColor="#C0B8B0"
          autoCapitalize="none"
          autoCorrect={false}
          className="mt-1 w-full rounded-sm border border-border bg-bg px-3 py-4 text-base text-btn-dark"
        />
        <Text className="mb-1 mt-2 text-xs text-[#A09080]">비밀번호</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호를 입력해주세요"
          placeholderTextColor="#C0B8B0"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          className="mt-1 w-full rounded-sm border border-border bg-bg px-3 py-4 text-base text-btn-dark"
        />
        <Pressable
          className={`mt-4 w-full items-center justify-center rounded-lg ${
            isSubmitting || hasEmptyField ? 'bg-[#B9B2A7]' : 'bg-btn-dark'
          }`}
          disabled={isLoginDisabled}
          onPress={handleLogin}
        >
          <Text className="py-4 text-base font-semibold text-white">
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Text>
        </Pressable>
      </View>
      <View className="mt-4 flex-row items-center justify-center gap-6">
        <Pressable onPress={() => router.push('/(app)/auth/find-id')}>
          <Text className="font-bold text-sm text-[#A09080]">아이디 찾기</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(app)/auth/find-password')}>
          <Text className="font-bold text-sm text-[#A09080]">비밀번호 찾기</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(app)/auth/signup')}>
          <Text className="font-bold text-sm text-[#A09080]">회원가입</Text>
        </Pressable>
      </View>
      {/* 소셜 로그인은 연동 안정화 후 다시 노출합니다. */}
    </View>
  );
}
