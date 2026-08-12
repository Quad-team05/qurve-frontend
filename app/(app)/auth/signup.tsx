import TopBar from '@/components/ui/TopBar';
import { ApiError } from '@/lib/api/client';
import { checkLoginId, sendSignupEmail, signup, verifyEmailCode } from '@/lib/api/auth';
import { markNeedsLevelTest } from '@/lib/auth/session';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EMAIL_TIMER_SECONDS = 180;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]).{8,20}$/;

const cardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

type MessageTone = 'success' | 'error' | 'info';

type FormMessage = {
  text: string;
  tone: MessageTone;
};

function showMessage(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

function getMessageColor(tone: MessageTone) {
  if (tone === 'success') return 'text-[#059669]';
  if (tone === 'error') return 'text-[#DC2626]';
  return 'text-[#A09080]';
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${minutes}:${String(restSeconds).padStart(2, '0')}`;
}

export default function SignUpPage() {
  const [loginId, setLoginId] = useState('');
  const [checkedLoginId, setCheckedLoginId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [timerLeft, setTimerLeft] = useState(0);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [loadingType, setLoadingType] = useState<
    'check-id' | 'send-email' | 'verify-email' | 'signup' | null
  >(null);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const trimmedLoginId = loginId.trim();
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();
  const trimmedNickname = nickname.trim();

  const allChecked = useMemo(
    () => agreements.terms && agreements.privacy && agreements.marketing,
    [agreements],
  );

  const requiredChecked = useMemo(() => agreements.terms && agreements.privacy, [agreements]);
  const isPasswordValid = PASSWORD_REGEX.test(password);
  const isPasswordMatched = password.length > 0 && password === passwordConfirm;
  const isLoginIdChecked = checkedLoginId === trimmedLoginId && trimmedLoginId.length > 0;
  const isEmailVerified = verifiedEmail === trimmedEmail && trimmedEmail.length > 0;
  const hasRequiredValues =
    trimmedLoginId.length > 0 &&
    password.length > 0 &&
    passwordConfirm.length > 0 &&
    trimmedEmail.length > 0 &&
    trimmedName.length > 0 &&
    trimmedNickname.length > 0;
  const canSignup =
    hasRequiredValues &&
    isPasswordValid &&
    isPasswordMatched &&
    isLoginIdChecked &&
    isEmailVerified &&
    requiredChecked &&
    !loadingType;
  const canVerifyEmail =
    Boolean(sentEmail) &&
    sentEmail === trimmedEmail &&
    verificationCode.trim().length > 0 &&
    timerLeft > 0 &&
    !verifiedEmail &&
    !loadingType;

  useEffect(() => {
    if (timerLeft <= 0 || verifiedEmail) return;

    const timer = setInterval(() => {
      setTimerLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timerLeft, verifiedEmail]);

  const setNotice = (text: string, tone: MessageTone = 'info') => {
    setMessage({ text, tone });
    showMessage(text);
  };

  const handleLoginIdChange = (value: string) => {
    setLoginId(value);
    setCheckedLoginId(null);
    setMessage(null);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setSentEmail(null);
    setVerifiedEmail(null);
    setVerificationCode('');
    setTimerLeft(0);
    setMessage(null);
  };

  const handleCheckLoginId = async () => {
    if (!trimmedLoginId) {
      setNotice('아이디를 입력해주세요.', 'error');
      return;
    }

    try {
      setLoadingType('check-id');
      await checkLoginId(trimmedLoginId);
      setCheckedLoginId(trimmedLoginId);
      setNotice('사용 가능한 아이디입니다.', 'success');
    } catch (error) {
      setCheckedLoginId(null);

      if (error instanceof ApiError && error.code === 'DUPLICATE_LOGIN_ID') {
        setNotice('이미 사용 중인 아이디입니다.', 'error');
        return;
      }

      setNotice('아이디 중복 확인에 실패했습니다.', 'error');
    } finally {
      setLoadingType(null);
    }
  };

  const handleSendEmail = async () => {
    if (!trimmedEmail) {
      setNotice('이메일을 입력해주세요.', 'error');
      return;
    }

    const activateEmailVerification = () => {
      setSentEmail(trimmedEmail);
      setVerifiedEmail(null);
      setVerificationCode('');
      setTimerLeft(EMAIL_TIMER_SECONDS);
    };

    try {
      setLoadingType('send-email');
      await sendSignupEmail(trimmedEmail);
      activateEmailVerification();
      setNotice('인증번호를 발송했습니다.', 'success');
    } catch (error) {
      setSentEmail(null);
      setTimerLeft(0);

      if (error instanceof ApiError && error.code === 'DUPLICATE_EMAIL') {
        setNotice('이미 사용 중인 이메일입니다.', 'error');
        return;
      }

      if (error instanceof ApiError && error.code === 'EMAIL_SEND_FAIL') {
        setNotice('이메일 발송에 실패했습니다.', 'error');
        return;
      }

      if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
        setNotice(
          '서버에 연결할 수 없습니다. 백엔드 실행 상태와 API 주소를 확인해주세요.',
          'error',
        );
        return;
      }

      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        activateEmailVerification();
        setNotice('인증번호를 발송했습니다. 메일함을 확인해주세요.', 'success');
        return;
      }

      setNotice('이메일 인증번호 발송에 실패했습니다.', 'error');
    } finally {
      setLoadingType(null);
    }
  };

  const handleVerifyEmail = async () => {
    if (!canVerifyEmail) {
      setNotice(
        timerLeft <= 0 ? '인증 시간이 만료되었습니다.' : '인증번호를 입력해주세요.',
        'error',
      );
      return;
    }

    try {
      setLoadingType('verify-email');
      await verifyEmailCode(trimmedEmail, verificationCode.trim());
      setVerifiedEmail(trimmedEmail);
      setTimerLeft(0);
      setNotice('이메일 인증이 완료되었습니다.', 'success');
    } catch (error) {
      setVerifiedEmail(null);

      if (error instanceof ApiError && error.code === 'INVALID_VERIFICATION_CODE') {
        setNotice('인증번호가 일치하지 않습니다.', 'error');
        return;
      }

      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setVerifiedEmail(trimmedEmail);
        setTimerLeft(0);
        setNotice('이메일 인증이 완료되었습니다.', 'success');
        return;
      }

      setNotice('이메일 인증 확인에 실패했습니다.', 'error');
    } finally {
      setLoadingType(null);
    }
  };

  const handleSignup = async () => {
    if (!canSignup) {
      setNotice('회원가입 조건을 모두 완료해주세요.', 'error');
      return;
    }

    try {
      setLoadingType('signup');
      await signup({
        loginId: trimmedLoginId,
        password,
        email: trimmedEmail,
        name: trimmedName,
        nickname: trimmedNickname,
      });
      await markNeedsLevelTest();
      setNotice('회원가입이 완료되었습니다.', 'success');
      router.replace('/(app)/auth/login');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'DUPLICATE_LOGIN_ID') {
        setCheckedLoginId(null);
        setNotice('이미 사용 중인 아이디입니다.', 'error');
        return;
      }

      if (error instanceof ApiError && error.code === 'DUPLICATE_EMAIL') {
        setVerifiedEmail(null);
        setNotice('이미 사용 중인 이메일입니다.', 'error');
        return;
      }

      setNotice('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
    } finally {
      setLoadingType(null);
    }
  };

  const toggleAll = () => {
    const nextValue = !allChecked;
    setAgreements({
      terms: nextValue,
      privacy: nextValue,
      marketing: nextValue,
    });
  };

  const toggleOne = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getCheckStyle = (checked: boolean) =>
    checked ? 'bg-btn-dark border-btn-dark' : 'bg-white border-border';

  const getActionButtonStyle = (enabled: boolean) =>
    enabled ? 'border-btn-dark bg-btn-dark' : 'border-border bg-[#B9B2A7]';

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="회원가입" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="relative w-full border border-border bg-white px-4 pb-4 pt-5"
          style={cardShadowStyle}
        >
          <View className="absolute -top-[5px] left-[14px] z-10 h-[13px] w-[50px] rounded-[1px] bg-[#FFE566]" />
          <Text className="mb-1 text-xs font-medium text-[#A09080]">아이디</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={loginId}
              onChangeText={handleLoginIdChange}
              placeholder="아이디 입력"
              placeholderTextColor="#C0B8B0"
              autoCapitalize="none"
              autoCorrect={false}
              className="h-[52px] flex-1 rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />
            <Pressable
              className={`ml-[10px] h-[52px] w-[88px] items-center justify-center rounded-sm border ${getActionButtonStyle(Boolean(trimmedLoginId) && loadingType !== 'check-id')}`}
              disabled={!trimmedLoginId || Boolean(loadingType)}
              onPress={handleCheckLoginId}
            >
              <Text className="text-sm font-semibold text-white">
                {loadingType === 'check-id' ? '확인중' : '중복확인'}
              </Text>
            </Pressable>
          </View>

          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">비밀번호</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="영문,숫자,특수문자 포함 8자 이상"
            placeholderTextColor="#C0B8B0"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />
          {password ? (
            <Text
              className={`mt-1 text-xs ${isPasswordValid ? 'text-[#059669]' : 'text-[#DC2626]'}`}
            >
              8~20자, 영문/숫자/특수문자를 포함해야 합니다.
            </Text>
          ) : null}

          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">비밀번호 확인</Text>
          <TextInput
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            placeholder="비밀번호 재입력"
            placeholderTextColor="#C0B8B0"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />
          {passwordConfirm ? (
            <Text
              className={`mt-1 text-xs ${isPasswordMatched ? 'text-[#059669]' : 'text-[#DC2626]'}`}
            >
              {isPasswordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
            </Text>
          ) : null}

          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">이름</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="이름을 입력해주세요"
            placeholderTextColor="#C0B8B0"
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />
          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">닉네임</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임을 입력해주세요"
            placeholderTextColor="#C0B8B0"
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />

          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">이메일</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={email}
              onChangeText={handleEmailChange}
              placeholder="이메일을 입력해주세요"
              placeholderTextColor="#C0B8B0"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              className="h-[52px] flex-1 rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />
            <Pressable
              className={`ml-[10px] h-[52px] w-[64px] items-center justify-center rounded-sm border ${getActionButtonStyle(Boolean(trimmedEmail) && loadingType !== 'send-email')}`}
              disabled={!trimmedEmail || Boolean(loadingType)}
              onPress={handleSendEmail}
            >
              <Text className="text-sm font-semibold text-white">
                {loadingType === 'send-email' ? '발송중' : '인증'}
              </Text>
            </Pressable>
          </View>

          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">인증번호</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder={
                sentEmail ? '인증번호를 입력해주세요' : '이메일 인증을 먼저 진행해주세요'
              }
              placeholderTextColor="#C0B8B0"
              keyboardType="number-pad"
              editable={Boolean(sentEmail) && !Boolean(verifiedEmail)}
              className={`h-[52px] flex-1 rounded-sm border border-border px-3 text-base text-btn-dark ${
                sentEmail && !verifiedEmail ? 'bg-bg' : 'bg-[#EEEAE2]'
              }`}
            />
            <Pressable
              className={`ml-[10px] h-[52px] w-[64px] items-center justify-center rounded-sm border ${getActionButtonStyle(canVerifyEmail)}`}
              disabled={!canVerifyEmail}
              onPress={handleVerifyEmail}
            >
              <Text className="text-sm font-semibold text-white">
                {loadingType === 'verify-email' ? '확인중' : '확인'}
              </Text>
            </Pressable>
          </View>
          {sentEmail && !verifiedEmail ? (
            <Text className="mt-1 text-xs text-[#A09080]">남은 시간 {formatTimer(timerLeft)}</Text>
          ) : null}

          {message ? (
            <Text className={`mt-3 text-xs font-medium ${getMessageColor(message.tone)}`}>
              {message.text}
            </Text>
          ) : null}
        </View>

        <View className="mt-4 rounded-sm border border-border bg-bg p-3">
          <Pressable className="flex-row items-center" onPress={toggleAll}>
            <View
              className={`mr-2 h-5 w-5 items-center justify-center rounded-[4px] border ${getCheckStyle(allChecked)}`}
            >
              {allChecked ? <Text className="text-[11px] text-white">✓</Text> : null}
            </View>
            <Text className="text-sm font-semibold text-btn-dark">약관 전체 동의</Text>
          </Pressable>

          <View className="my-3 h-px bg-border" />

          <View className="gap-3">
            <View className="flex-row items-center">
              <Pressable className="mr-2 flex-row items-center" onPress={() => toggleOne('terms')}>
                <View
                  className={`h-5 w-5 items-center justify-center rounded-[4px] border ${getCheckStyle(agreements.terms)}`}
                >
                  {agreements.terms ? <Text className="text-[11px] text-white">✓</Text> : null}
                </View>
              </Pressable>
              <Text className="flex-1 text-sm text-[#6B655D]">[필수] 이용약관 동의</Text>
              <Pressable onPress={() => router.push('/(app)/auth/terms')}>
                <Text className="text-xs text-[#8C877D] underline">보기</Text>
              </Pressable>
            </View>

            <View className="flex-row items-center">
              <Pressable
                className="mr-2 flex-row items-center"
                onPress={() => toggleOne('privacy')}
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded-[4px] border ${getCheckStyle(agreements.privacy)}`}
                >
                  {agreements.privacy ? <Text className="text-[11px] text-white">✓</Text> : null}
                </View>
              </Pressable>
              <Text className="flex-1 text-sm text-[#6B655D]">
                [필수] 개인정보 수집 및 이용 동의
              </Text>
              <Pressable onPress={() => router.push('/(app)/auth/terms')}>
                <Text className="text-xs text-[#8C877D] underline">보기</Text>
              </Pressable>
            </View>

            <View className="flex-row items-center">
              <Pressable
                className="mr-2 flex-row items-center"
                onPress={() => toggleOne('marketing')}
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded-[4px] border ${getCheckStyle(agreements.marketing)}`}
                >
                  {agreements.marketing ? <Text className="text-[11px] text-white">✓</Text> : null}
                </View>
              </Pressable>
              <Text className="flex-1 text-sm text-[#6B655D]">[선택] 마케팅 정보 수신 동의</Text>
            </View>
          </View>
        </View>

        <Pressable
          className={`mt-4 h-[52px] items-center justify-center rounded-lg ${
            canSignup ? 'bg-btn-dark' : 'bg-[#B9B2A7]'
          }`}
          disabled={!canSignup}
          onPress={handleSignup}
        >
          <Text className="text-base font-semibold text-white">
            {loadingType === 'signup' ? '가입 중...' : '회원가입'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
