import Text from '@/components/ui/AppText';
import TextInput from '@/components/ui/AppTextInput';
import TopBar from '@/components/ui/TopBar';
import { resetPassword, sendPasswordResetEmail, verifyEmailCode } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const cardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]).{8,20}$/;

type FeedbackTone = 'success' | 'error';

type FeedbackMessage = {
  text: string;
  tone: FeedbackTone;
};

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

function getFeedbackColor(tone: FeedbackTone) {
  return tone === 'success' ? 'text-[#08A169]' : 'text-[#EF4444]';
}

export default function FindPasswordPage() {
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [isResetSectionEnabled, setIsResetSectionEnabled] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<FeedbackMessage | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<FeedbackMessage | null>(null);
  const [resetFeedback, setResetFeedback] = useState<FeedbackMessage | null>(null);
  const [loadingType, setLoadingType] = useState<
    'send-email' | 'verify-code' | 'reset-password' | null
  >(null);

  const trimmedLoginId = loginId.trim();
  const trimmedEmail = email.trim();
  const trimmedCode = code.trim();
  const isPasswordValid = PASSWORD_REGEX.test(newPassword);
  const isPasswordMatched = newPassword.length > 0 && newPassword === confirmPassword;
  const hasRequestedEmail = sentEmail === trimmedEmail && trimmedEmail.length > 0;
  const isCodeVerified = verifiedEmail === trimmedEmail && trimmedEmail.length > 0;
  const isBusy = loadingType !== null;
  const isChangeEnabled = useMemo(
    () =>
      isResetSectionEnabled &&
      isCodeVerified &&
      trimmedLoginId.length > 0 &&
      trimmedEmail.length > 0 &&
      trimmedCode.length > 0 &&
      newPassword.length > 0 &&
      confirmPassword.length > 0 &&
      !isBusy,
    [
      confirmPassword.length,
      isBusy,
      isCodeVerified,
      isResetSectionEnabled,
      newPassword.length,
      trimmedCode.length,
      trimmedEmail.length,
      trimmedLoginId.length,
    ],
  );

  const resetVerificationState = () => {
    setSentEmail(null);
    setVerifiedEmail(null);
    setCode('');
    setIsResetSectionEnabled(false);
    setVerificationFeedback(null);
    setResetFeedback(null);
  };

  const handleLoginIdChange = (value: string) => {
    setLoginId(value);
    setEmailFeedback(null);
    setResetFeedback(null);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailFeedback(null);
    resetVerificationState();
  };

  const handleCodeChange = (value: string) => {
    if (isCodeVerified) return;
    setCode(value);
    setVerificationFeedback(null);
  };

  const handleSendEmail = async () => {
    if (!trimmedLoginId || !trimmedEmail) {
      setEmailFeedback({ text: '아이디와 이메일을 모두 입력해주세요.', tone: 'error' });
      setVerificationFeedback(null);
      return;
    }

    const activateEmailVerification = () => {
      setSentEmail(trimmedEmail);
      setVerifiedEmail(null);
      setCode('');
      setIsResetSectionEnabled(false);
      setEmailFeedback(null);
      setVerificationFeedback(null);
      setResetFeedback(null);
    };

    try {
      setLoadingType('send-email');
      await sendPasswordResetEmail({
        loginId: trimmedLoginId,
        email: trimmedEmail,
      });
      activateEmailVerification();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403) {
          activateEmailVerification();
          return;
        }

        setEmailFeedback({
          text: error.message || '인증 메일 발송에 실패했습니다.',
          tone: 'error',
        });
      } else {
        setEmailFeedback({ text: '인증 메일 발송에 실패했습니다.', tone: 'error' });
      }
    } finally {
      setLoadingType(null);
    }
  };

  const handleVerifyCode = async () => {
    if (!hasRequestedEmail) {
      setVerificationFeedback({
        text: '먼저 인증 메일을 발송해주세요.',
        tone: 'error',
      });
      return;
    }

    if (!trimmedCode) {
      setVerificationFeedback({
        text: '인증번호를 입력해주세요.',
        tone: 'error',
      });
      return;
    }

    try {
      setLoadingType('verify-code');
      await verifyEmailCode(trimmedEmail, trimmedCode);
      setVerifiedEmail(trimmedEmail);
      setVerificationFeedback({ text: '인증 되었습니다.', tone: 'success' });
      setResetFeedback(null);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403) {
          setVerifiedEmail(trimmedEmail);
          setVerificationFeedback({ text: '인증 되었습니다.', tone: 'success' });
          setResetFeedback(null);
          return;
        }

        setVerificationFeedback({
          text: error.message || '인증번호 확인에 실패했습니다.',
          tone: 'error',
        });
      } else {
        setVerificationFeedback({
          text: '인증번호 확인에 실패했습니다.',
          tone: 'error',
        });
      }
    } finally {
      setLoadingType(null);
    }
  };

  const handleEnableResetSection = () => {
    if (!isCodeVerified) {
      setVerificationFeedback({
        text: '인증번호 확인을 완료해주세요.',
        tone: 'error',
      });
      setIsResetSectionEnabled(false);
      return;
    }

    setIsResetSectionEnabled(true);
    setResetFeedback(null);
  };

  const handleResetPassword = async () => {
    if (!isCodeVerified || !isResetSectionEnabled) {
      setVerificationFeedback({
        text: '인증 완료 후 비밀번호 재설정을 진행해주세요.',
        tone: 'error',
      });
      return;
    }

    if (!newPassword || !confirmPassword) {
      setResetFeedback({ text: '새 비밀번호를 모두 입력해주세요.', tone: 'error' });
      return;
    }

    if (!isPasswordValid) {
      setResetFeedback({
        text: '영문,숫자,특수문자를 포함해 8자 이상 입력해주세요.',
        tone: 'error',
      });
      return;
    }

    if (!isPasswordMatched) {
      setResetFeedback({ text: '비밀번호가 일치하지 않습니다.', tone: 'error' });
      return;
    }

    try {
      setLoadingType('reset-password');
      setResetFeedback(null);

      await resetPassword({
        loginId: trimmedLoginId,
        email: trimmedEmail,
        code: trimmedCode,
        newPassword,
      });

      showToast('비밀번호가 재설정되었습니다.');
      router.replace('/(app)/auth/login');
    } catch (error) {
      if (error instanceof ApiError) {
        setResetFeedback({
          text: error.message || '비밀번호 재설정에 실패했습니다.',
          tone: 'error',
        });
      } else {
        setResetFeedback({ text: '비밀번호 재설정에 실패했습니다.', tone: 'error' });
      }
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="비밀번호 찾기" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-[18px]"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="relative w-full border border-border bg-white px-6 pb-6 pt-7"
          style={cardShadowStyle}
        >
          <View className="absolute -top-[5px] left-[52px] z-10 h-[13px] w-[50px] rounded-[1px] bg-[#FFE566]" />

          <Text className="mb-2 text-xs font-medium text-[#A09080]">아이디</Text>
          <TextInput
            value={loginId}
            onChangeText={handleLoginIdChange}
            placeholder="아이디를 입력해주세요"
            placeholderTextColor="#CFC6BD"
            autoCapitalize="none"
            autoCorrect={false}
            className="h-[45px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />

          <Text className="mb-2 mt-4 text-xs font-medium text-[#A09080]">이메일</Text>
          <View className="flex-row items-center">
            <TextInput
              value={email}
              onChangeText={handleEmailChange}
              placeholder="이메일을 입력해주세요"
              placeholderTextColor="#CFC6BD"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              className="h-[45px] flex-1 rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />
            <Pressable
              className={`ml-3 h-[45px] w-[52px] items-center justify-center rounded-sm border ${
                isBusy ? 'border-border bg-bg' : 'border-border bg-bg'
              }`}
              disabled={isBusy}
              onPress={handleSendEmail}
            >
              <Text className="text-base font-medium text-[#6E7582]">
                {loadingType === 'send-email' ? '발송중' : '인증'}
              </Text>
            </Pressable>
          </View>

          {emailFeedback ? (
            <Text className={`mt-3 text-sm ${getFeedbackColor(emailFeedback.tone)}`}>
              {emailFeedback.text}
            </Text>
          ) : null}

          <Text className="mb-2 mt-6 text-xs font-medium text-[#A09080]">인증번호</Text>
          <View className="flex-row items-center">
            <TextInput
              value={code}
              onChangeText={handleCodeChange}
              placeholder="인증번호를 입력해주세요"
              placeholderTextColor="#CFC6BD"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isCodeVerified}
              className="h-[45px] flex-1 rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />
            <Pressable
              className={`ml-3 h-[45px] w-[52px] items-center justify-center rounded-sm border ${
                isBusy || isCodeVerified ? 'border-border bg-bg' : 'border-border bg-bg'
              }`}
              disabled={isBusy || isCodeVerified}
              onPress={handleVerifyCode}
            >
              <Text className="text-base font-medium text-[#6E7582]">
                {loadingType === 'verify-code' ? '확인중' : '확인'}
              </Text>
            </Pressable>
          </View>

          {verificationFeedback ? (
            <Text className={`mt-3 text-sm ${getFeedbackColor(verificationFeedback.tone)}`}>
              {verificationFeedback.text}
            </Text>
          ) : null}

          <Pressable
            className={`mt-[30px] h-[50px] items-center justify-center rounded-lg ${
              isBusy || !isCodeVerified ? 'bg-[#B9B2A7]' : 'bg-btn-dark'
            }`}
            disabled={isBusy || !isCodeVerified}
            onPress={handleEnableResetSection}
          >
            <Text className="text-base font-semibold text-white">비밀번호 재설정</Text>
          </Pressable>
        </View>

        {isResetSectionEnabled ? (
          <View
            className="relative mt-5 w-full border border-border bg-white px-6 pb-6 pt-7"
            style={cardShadowStyle}
          >
            <View className="absolute -top-[5px] left-1/2 z-10 h-[13px] w-[50px] -translate-x-1/2 rounded-[1px] bg-[#B8D4F0]" />

            <Text className="mb-2 text-xs font-medium text-[#A09080]">새 비밀번호</Text>
            <TextInput
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                setResetFeedback(null);
              }}
              placeholder="영문,숫자,특수문자 포함 8자 이상"
              placeholderTextColor="#CFC6BD"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={isResetSectionEnabled}
              className="h-[45px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />
            <Text className="mt-2 text-xs font-medium text-[#A09080]">
              영문,숫자,특수문자를 포함해 8자 이상 입력해주세요.
            </Text>

            <Text className="mb-2 mt-5 text-xs font-medium text-[#A09080]">새 비밀번호 확인</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setResetFeedback(null);
              }}
              placeholder="비밀번호 재입력"
              placeholderTextColor="#CFC6BD"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={isResetSectionEnabled}
              className="h-[45px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />

            {resetFeedback ? (
              <Text className={`mt-3 text-sm ${getFeedbackColor(resetFeedback.tone)}`}>
                {resetFeedback.text}
              </Text>
            ) : confirmPassword && !isPasswordMatched ? (
              <Text className="mt-3 text-sm text-[#EF4444]">비밀번호가 일치하지 않습니다.</Text>
            ) : null}

            <View className="mt-7 flex-row">
              <Pressable
                className="h-[42x] flex-1 items-center justify-center rounded-lg border border-border bg-white"
                onPress={() => router.replace('/(app)/auth/login')}
              >
                <Text className="text-base font-semibold text-btn-dark">취소</Text>
              </Pressable>
              <Pressable
                className={`ml-4 h-[42px] flex-1 items-center justify-center rounded-lg ${
                  isChangeEnabled ? 'bg-btn-dark' : 'bg-[#B9B2A7]'
                }`}
                disabled={!isChangeEnabled}
                onPress={handleResetPassword}
              >
                <Text className="text-base font-semibold text-white">
                  {loadingType === 'reset-password' ? '변경 중...' : '변경'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
