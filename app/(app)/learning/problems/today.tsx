import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { getTodayLearning, type TodayLearning } from '@/lib/api/learning';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';
import { getMyProfile, type UserProfile } from '@/lib/api/user';
import {
  getCompletedProblemSession,
  loadCompletedProblemSession,
  type ProblemSession,
} from '@/lib/learning/problem-session';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, ToastAndroid, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const cardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

function isSameTodayLearningSession(
  todayLearning: TodayLearning | null,
  completedSession: ProblemSession | null,
) {
  if (!todayLearning || !completedSession) {
    return false;
  }

  const isSameLevel =
    todayLearning.language === 'EN'
      ? completedSession.request.language === 'EN' &&
        completedSession.request.qurveLevel === (todayLearning.qurveLevel ?? todayLearning.level)
      : completedSession.request.level === todayLearning.level;

  return (
    isSameLevel &&
    completedSession.request.category === todayLearning.categoryCode &&
    completedSession.request.subType === todayLearning.subTypeCode &&
    completedSession.request.offset === todayLearning.offset &&
    completedSession.request.count === todayLearning.totalQuestionCount
  );
}

export default function TodayProblemsPage() {
  const router = useRouter();
  const [todayLearning, setTodayLearning] = useState<TodayLearning | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completedSession, setCompletedSession] = useState<ProblemSession | null>(() =>
    getCompletedProblemSession(),
  );

  useEffect(() => {
    const loadTodayLearning = async () => {
      try {
        const [result, savedSession, profileResult] = await Promise.all([
          getTodayLearning(),
          loadCompletedProblemSession(),
          getMyProfile(),
        ]);
        setTodayLearning(result);
        setCompletedSession(savedSession);
        setProfile(profileResult);
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

  const effectiveTodayLearning = useMemo(() => {
    if (!todayLearning || !profile) return null;

    if (profile.learningLanguage === 'JAPANESE') {
      const selectedJlptLevel = profile.learningStage?.match(/^JLPT_(N[1-5])$/)?.[1];
      return {
        ...todayLearning,
        level:
          profile.learningGoal === 'DAILY_LIFE' ? 'N5' : selectedJlptLevel || todayLearning.level,
      };
    }

    const isDailyLife = profile.learningGoal === 'DAILY_LIFE';
    return {
      ...todayLearning,
      category: isDailyLife ? '실생활 영어' : '토익',
      title: isDailyLife ? '상황별 표현' : '종합 문제',
      categoryCode: isDailyLife ? 'DAILY_ENGLISH' : 'TOEIC',
      subTypeCode: 'ALL',
      offset: 0,
      totalQuestionCount: isDailyLife ? 10 : 20,
      estimatedMinutes: isDailyLife ? 5 : 10,
    };
  }, [profile, todayLearning]);

  const completedSummary = useMemo(() => {
    if (!completedSession) return null;

    const totalCount = completedSession.problems.length;
    const correctCount = completedSession.problems.reduce((count, problem) => {
      if (completedSession.submissions[problem.problemId]?.correct) {
        return count + 1;
      }

      return count;
    }, 0);

    return {
      totalCount,
      correctCount,
      wrongCount: totalCount - correctCount,
    };
  }, [completedSession]);

  const hasCompletedTodayLearning = Boolean(
    completedSummary && isSameTodayLearningSession(effectiveTodayLearning, completedSession),
  );
  const safeCompletedSummary = completedSummary ?? {
    totalCount: 0,
    correctCount: 0,
    wrongCount: 0,
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="오늘의 학습" />

      <View className="flex-1 px-4 pt-4">
        <Text className="mb-[6px] text-xs text-text-brown">오늘의 학습 주제</Text>
        <View
          className="rounded-sm border border-border bg-white px-4 py-4 pb-4"
          style={cardShadowStyle}
        >
          <Text className="mt-2 text-base text-[#2A2018]">
            • {effectiveTodayLearning?.category ?? '불러오는 중...'}
          </Text>
          <Text className="mt-2 text-base text-[#2A2018]">
            • {effectiveTodayLearning?.title ?? '불러오는 중...'}
          </Text>

          <View className="my-5 h-px bg-border" />

          <Text className="text-sm font-semibold text-text-brown">
            • 총 {effectiveTodayLearning?.totalQuestionCount ?? '-'}문제
          </Text>
          <Text className="mt-2 text-sm font-semibold text-text-brown">
            • 예상 풀이 시간: {effectiveTodayLearning?.estimatedMinutes ?? '-'}분
          </Text>
        </View>

        {!hasCompletedTodayLearning ? (
          <Pressable
            className="mt-4 h-[50px] items-center justify-center rounded-xl bg-btn-dark"
            disabled={!effectiveTodayLearning}
            onPress={() =>
              router.push({
                pathname: '/(app)/learning/problems/solve',
                params: {
                  level: effectiveTodayLearning!.level,
                  language: effectiveTodayLearning!.language,
                  cefrLevel: effectiveTodayLearning!.cefrLevel ?? '',
                  qurveLevel: effectiveTodayLearning!.qurveLevel ?? '',
                  category: effectiveTodayLearning!.categoryCode,
                  subType: effectiveTodayLearning!.subTypeCode,
                  count: String(effectiveTodayLearning!.totalQuestionCount),
                  offset: String(effectiveTodayLearning!.offset),
                  categoryLabel: effectiveTodayLearning!.category,
                  subTypeLabel: effectiveTodayLearning!.title,
                  learningGoal: profile!.learningGoal ?? '',
                },
              })
            }
          >
            <Text className="font-bold text-base text-white">시작하기</Text>
          </Pressable>
        ) : null}

        {hasCompletedTodayLearning ? (
          <View className="mt-4 rounded-sm border border-border bg-white p-4">
            <Text className="text-xs text-text-brown">최근 제출한 오늘의 학습</Text>
            <Text className="mt-2 text-sm text-[#2A2018]">
              • 총 {safeCompletedSummary.totalCount}문제
            </Text>
            <Text className="mt-2 text-sm text-[#059669]">
              • 맞은 문제: {safeCompletedSummary.correctCount}개
            </Text>
            <Text className="mt-2 text-sm text-[#CC4444]">
              • 틀린 문제: {safeCompletedSummary.wrongCount}개
            </Text>

            <View className="mt-4 flex-row gap-3">
              <Pressable
                className="h-[46px] flex-1 items-center justify-center rounded-xl border border-border bg-white"
                onPress={() => router.push('/(app)/learning/problems/result')}
              >
                <Text className="font-bold text-sm text-[#2A2018]">결과 보기</Text>
              </Pressable>
              <Pressable
                className="h-[46px] flex-1 items-center justify-center rounded-xl bg-btn-dark"
                onPress={() => router.push('/(app)/learning/problems/review')}
              >
                <Text className="font-bold text-sm text-white">풀이 보기</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
