import GoogleIcon from '@/assets/icons/google.svg';
import KakaoIcon from '@/assets/icons/kakao.svg';
import NaverIcon from '@/assets/icons/naver.svg';
import Text from '@/components/ui/AppText';
import TextInput from '@/components/ui/AppTextInput';
import { ApiError } from '@/lib/api/client';
import { login } from '@/lib/api/auth';
import { loginWithKakao, loginWithNaver } from '@/lib/auth/social-login';
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
  const [isKakaoSubmitting, setIsKakaoSubmitting] = useState(false);
  const [isNaverSubmitting, setIsNaverSubmitting] = useState(false);

  const hasEmptyField = !loginId.trim() || !password.trim();
  const isLoginDisabled = isSubmitting;

  const handleLogin = async () => {
    if (isLoginDisabled) {
      showToast('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({
        loginId: loginId.trim(),
        password,
      });
      router.replace('/(tabs)');
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === 'USER_NOT_FOUND' || error.code === 'INVALID_PASSWORD')
      ) {
        showToast(LOGIN_ERROR_MESSAGE);
        return;
      }

      showToast('로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKakaoLogin = async () => {
    if (isKakaoSubmitting || isNaverSubmitting) return;

    try {
      setIsKakaoSubmitting(true);
      const result = await loginWithKakao();

      if (result.success) {
        router.replace('/(tabs)');
        return;
      }

      if (!result.cancelled) {
        showToast(result.message);
      }
    } finally {
      setIsKakaoSubmitting(false);
    }
  };

  const handleNaverLogin = async () => {
    if (isKakaoSubmitting || isNaverSubmitting) return;

    try {
      setIsNaverSubmitting(true);
      const result = await loginWithNaver();

      if (result.success) {
        router.replace('/(tabs)');
        return;
      }

      if (!result.cancelled) {
        showToast(result.message);
      }
    } finally {
      setIsNaverSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-bg px-5 py-9">
      <View className="mb-6 flex-row items-center justify-between rounded-sm"></View>
      <Text className="text-[11px] font-medium text-[#A09080]">일본어 학습의 새로운 경험</Text>
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
      <View className="mt-9 flex-row items-center">
        <View className="h-px flex-1 bg-border" />
        <Text className="mx-3 text-[10px] font-semibold text-[#A09080]">또는</Text>
        <View className="h-px flex-1 bg-border" />
      </View>
      <Text className="mt-3 text-center text-sm font-semibold text-[#A09080]">소셜 로그인</Text>
      <View className="ml-[301px] h-[10px] w-[50px] rounded-[1px] bg-[#B8D4F0]" />
      <View className="border border-border bg-white px-[70px] py-4">
        <View className="flex-row items-center justify-center gap-11">
          <Pressable
            className="h-[36px] w-[36px] items-center justify-center rounded-sm border border-border bg-white"
            disabled={isKakaoSubmitting || isNaverSubmitting}
            onPress={handleKakaoLogin}
          >
            <KakaoIcon width={32} height={32} />
          </Pressable>
          <Pressable
            className="h-[36px] w-[36px] items-center justify-center rounded-sm border border-border bg-white"
            disabled={isKakaoSubmitting || isNaverSubmitting}
            onPress={handleNaverLogin}
          >
            <NaverIcon width={32} height={32} />
          </Pressable>
          <Pressable className="h-[36px] w-[36px] items-center justify-center rounded-sm border border-border bg-white">
            <GoogleIcon width={32} height={32} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
