import Text from '@/components/ui/AppText';
import {
  CHALLENGE_GOAL_TYPE_TARGET_UNITS,
  getChallengesForMain,
  getMyChallenges,
  normalizeChallengeManagement,
  type ChallengeMain,
} from '@/lib/api/challenge';
import { ApiError } from '@/lib/api/client';
import { getTodayLearning, type TodayLearning } from '@/lib/api/learning';
import { getMyProfile, type UserProfile } from '@/lib/api/user';
import { clearAuthSession, consumeNeedsLevelTest } from '@/lib/auth/session';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

function getProgressBarWidth(progressRate: number) {
  return `${Math.max(0, Math.min(100, progressRate))}%` as `${number}%`;
}

function isChallengeAchieved(challenge: ChallengeMain) {
  return challenge.progressRate >= 100 || challenge.currentValue >= challenge.targetValue;
}

function toMainChallenge(challenge: {
  challengeId: number;
  title: string;
  goalType: ChallengeMain['goalType'];
  targetValue: number;
  currentValue: number;
  progressRate?: number;
}): ChallengeMain {
  const progressRate =
    typeof challenge.progressRate === 'number'
      ? challenge.progressRate
      : challenge.targetValue > 0
        ? Math.round((challenge.currentValue / challenge.targetValue) * 100)
        : 0;

  return {
    challengeId: challenge.challengeId,
    title: challenge.title,
    goalType: challenge.goalType,
    targetValue: challenge.targetValue,
    currentValue: challenge.currentValue,
    completedDays: challenge.currentValue,
    progressRate: Math.max(0, Math.min(100, progressRate)),
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [todayLearning, setTodayLearning] = useState<TodayLearning | null>(null);
  const [mainChallenges, setMainChallenges] = useState<ChallengeMain[]>([]);
  const [isChallengeLoading, setIsChallengeLoading] = useState(true);
  const [challengeErrorMessage, setChallengeErrorMessage] = useState('');
  const hasLoadedChallenges = useRef(false);

  useEffect(() => {
    let mounted = true;

    const redirectToLevelTestIfNeeded = async () => {
      const needsLevelTest = await consumeNeedsLevelTest();

      if (!mounted || !needsLevelTest) return;

      router.replace('/(app)/level/test-survey');
    };

    redirectToLevelTestIfNeeded();

    return () => {
      mounted = false;
    };
  }, [router]);

  const loadMainChallenges = useCallback(async () => {
    try {
      if (!hasLoadedChallenges.current) {
        setIsChallengeLoading(true);
      }
      setChallengeErrorMessage('');
      const result = await getChallengesForMain();

      if (result.length > 0) {
        setMainChallenges(result);
      } else {
        const management = normalizeChallengeManagement(await getMyChallenges());
        setMainChallenges(management.completedChallenges.map(toMainChallenge));
      }
      hasLoadedChallenges.current = true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }

      const message =
        error instanceof ApiError ? error.message : '챌린지 정보를 불러오지 못했습니다.';
      setChallengeErrorMessage(message);
      showToast(message);
    } finally {
      setIsChallengeLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      void loadMainChallenges();
    }, [loadMainChallenges]),
  );

  const primaryChallenge =
    mainChallenges.find((challenge) => !isChallengeAchieved(challenge)) ?? mainChallenges[0];
  const isPrimaryChallengeAchieved = primaryChallenge
    ? isChallengeAchieved(primaryChallenge)
    : false;
  const primaryChallengeUnit = primaryChallenge
    ? CHALLENGE_GOAL_TYPE_TARGET_UNITS[primaryChallenge.goalType]
    : '';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsProfileLoading(true);
        const result = await getMyProfile();
        setProfile(result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearAuthSession();
          router.replace('/(app)/auth/login');
          return;
        }

        showToast('회원 정보를 불러오지 못했습니다.');
      } finally {
        setIsProfileLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  useEffect(() => {
    const loadTodayLearning = async () => {
      try {
        const result = await getTodayLearning();
        setTodayLearning(result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearAuthSession();
          router.replace('/(app)/auth/login');
          return;
        }

        showToast('오늘의 학습 정보를 불러오지 못했습니다.');
      }
    };

    void loadTodayLearning();
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* 헤더 */}
      <View className="border-b border-border bg-bg px-4 pb-3 pt-2">
        <Text className="font-regular text-xs text-text-brown">good morning</Text>
        <Text className="font-semiBold text-2xl text-btn-dark">
          {isProfileLoading ? '불러오는 중...' : `${profile?.name ?? '-'} 님 😊`}
        </Text>
        <Text className="font-regular text-xs text-text-brown">오늘의 학습이 남아있어요</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 출석 도장 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#B8D4F0] opacity-80" />
          <View className="w-full rounded-sm border border-border bg-white p-4 pt-5">
            <Text className="mb-2 font-regular text-xs text-text-brown">출석 도장 · 연속 7일</Text>
            <View className="flex-row gap-x-1.5">
              {days.map((d, i) => (
                <View
                  key={i}
                  className="h-8 flex-1 items-center justify-center rounded-sm"
                  style={{ backgroundColor: i < 5 ? '#2A2018' : '#EDE8DE' }}
                >
                  <Text
                    style={{ fontSize: 10, color: i < 5 ? '#fff' : '#A09080', fontWeight: '500' }}
                  >
                    {d}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 오늘의 표현 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#F9C8D8] opacity-80" />
          <Pressable
            className="w-full rounded-sm border border-border bg-white p-4 pt-5"
            onPress={() => router.push('/(app)/learning/problems/today')}
          >
            <Text className="mb-1 font-regular text-xs text-text-brown">오늘의 표현</Text>
            <Text className="font-regular text-2xl text-btn-dark">はじめまして。</Text>
            <Text className="mt-1 font-regular text-sm text-text-brown">처음 뵙겠습니다</Text>
            <Text className="font-semiBold mt-2 self-end text-sm text-text-brown">
              학습하러 가기 →
            </Text>
          </Pressable>
        </View>

        {/* 스탯 2개 */}
        <View className="flex-row gap-x-3">
          <View className="relative flex-1 items-center pt-2">
            <View className="absolute right-3 top-0 z-10 h-[11px] w-6 rounded-sm bg-[#FFE566] opacity-80" />
            <View className="w-full rounded-sm bg-[#FEF3C7] p-3">
              <Text className="font-regular text-xs text-text-brown">오늘 학습</Text>
              <Text className="font-semiBold text-2xl text-btn-dark">20분</Text>
              <Text className="font-regular text-xs text-[#D97706]">목표 60분</Text>
              <View className="mt-2 h-0.5 rounded-full bg-black/10">
                <View className="h-0.5 w-1/3 rounded-full bg-[#D97706]" />
              </View>
            </View>
          </View>
          <View className="relative flex-1 items-center pt-2">
            <View className="absolute left-3 top-0 z-10 h-[11px] w-6 rounded-sm bg-[#B8E8C0] opacity-80" />
            <View className="w-full rounded-sm bg-[#D1FAE5] p-3">
              <Text className="font-regular text-xs text-text-brown">정답률</Text>
              <Text className="font-semiBold text-2xl text-btn-dark">58%</Text>
              <Text className="font-regular text-xs text-[#059669]">상위 23%</Text>
              <View className="mt-2 h-0.5 rounded-full bg-black/10">
                <View className="h-0.5 w-[58%] rounded-full bg-[#059669]" />
              </View>
            </View>
          </View>
        </View>

        {/* 나의 챌린지 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#B8E8C0] opacity-80" />
          <Pressable
            className="w-full rounded-sm border border-border bg-white p-4 pt-5"
            onPress={() => router.push('/(app)/mypage/challenge')}
          >
            <Text className="mb-1 font-regular text-xs text-text-brown">나의 챌린지</Text>
            {isChallengeLoading && mainChallenges.length === 0 ? (
              <Text className="font-semiBold text-lg text-btn-dark">불러오는 중...</Text>
            ) : challengeErrorMessage ? (
              <Text className="font-semiBold text-lg text-btn-dark">
                챌린지 정보를 확인해주세요
              </Text>
            ) : primaryChallenge ? (
              <>
                <Text className="font-semiBold text-lg text-btn-dark">
                  {isPrimaryChallengeAchieved
                    ? '오늘의 챌린지를 이미 달성했어요'
                    : primaryChallenge.title}
                </Text>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="font-regular text-xs text-text-brown">목표 달성률</Text>
                  <Text className="font-regular text-xs text-text-brown">
                    {primaryChallenge.progressRate}%
                  </Text>
                </View>
                <View className="mt-1.5 h-0.5 rounded-full bg-black/10">
                  <View
                    className="h-0.5 rounded-full bg-[#6B7280]"
                    style={{ width: getProgressBarWidth(primaryChallenge.progressRate) }}
                  />
                </View>
                <Text className="mt-1.5 font-regular text-xs text-text-brown">
                  {isPrimaryChallengeAchieved
                    ? primaryChallenge.title
                    : `${primaryChallenge.currentValue}/${primaryChallenge.targetValue}${primaryChallengeUnit} · ${primaryChallenge.completedDays}일 달성`}
                </Text>
              </>
            ) : (
              <>
                <Text className="font-semiBold text-lg text-btn-dark">
                  진행 중인 챌린지가 없어요
                </Text>
                <Text className="mt-1 font-regular text-xs text-text-brown">
                  새 챌린지를 추가해 보세요.
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* 오늘의 학습 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#FFE566] opacity-80" />
          <Pressable
            className="w-full rounded-sm border border-border bg-white p-4 pt-5"
            onPress={() => router.push('/(app)/learning/problems/today')}
          >
            <Text className="mb-1 font-regular text-xs text-text-brown">오늘의 학습</Text>
            <Text className="font-semiBold text-lg text-btn-dark">
              {todayLearning
                ? `${todayLearning.category} · ${todayLearning.title}`
                : '문자/어휘 · 문맥규정'}
            </Text>
            <Text className="mt-0.5 font-regular text-xs text-text-brown">
              총 {todayLearning?.totalQuestionCount ?? 20}문제 · 예상{' '}
              {todayLearning?.estimatedMinutes ?? 10}분
            </Text>
            <Text className="font-semiBold mt-2 self-end text-sm text-text-brown">
              학습하러 가기 →
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
