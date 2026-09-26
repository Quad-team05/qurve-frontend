import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { getTodayLearning, type TodayLearning } from '@/lib/api/learning';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';
import {
  getCompletedProblemSession,
  loadCompletedProblemSession,
  type ProblemSession,
} from '@/lib/learning/problem-session';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const cardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedSession, setCompletedSession] = useState<ProblemSession | null>(() =>
    getCompletedProblemSession(),
  );

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadTodayLearning = async () => {
        try {
          setIsLoading(true);
          setErrorMessage('');
          const [result, savedSession] = await Promise.all([
            getTodayLearning(),
            loadCompletedProblemSession(),
          ]);
          if (!mounted) return;
          setTodayLearning(result);
          setCompletedSession(savedSession);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            await clearAuthSession();
            router.replace('/(app)/auth/login');
            return;
          }

          if (mounted) {
            setTodayLearning(null);
            setErrorMessage(
              error instanceof ApiError ? error.message : '오늘의 학습 정보를 불러오지 못했습니다.',
            );
          }
        } finally {
          if (mounted) setIsLoading(false);
        }
      };

      void loadTodayLearning();

      return () => {
        mounted = false;
      };
    }, [router]),
  );

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
    completedSummary && isSameTodayLearningSession(todayLearning, completedSession),
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
            • {todayLearning?.category ?? '문자 / 어휘'}
          </Text>
          <Text className="mt-2 text-base text-[#2A2018]">
            • {todayLearning?.title ?? '문맥규정'}
          </Text>

          <View className="my-5 h-px bg-border" />

          <Text className="text-sm font-semibold text-text-brown">
            • 총 {todayLearning?.totalQuestionCount ?? 20}문제
          </Text>
          <Text className="mt-2 text-sm font-semibold text-text-brown">
            • 예상 풀이 시간: {todayLearning?.estimatedMinutes ?? 10}분
          </Text>
        </View>

        {errorMessage ? (
          <View className="mt-4 rounded-sm border border-border bg-white p-4">
            <Text className="text-sm text-[#DC2626]">{errorMessage}</Text>
          </View>
        ) : null}

        {!hasCompletedTodayLearning && !errorMessage ? (
          <Pressable
            className={`mt-4 h-[50px] items-center justify-center rounded-xl ${isLoading ? 'bg-[#D8D2C7]' : 'bg-btn-dark'}`}
            disabled={isLoading || !todayLearning}
            onPress={() =>
              router.push({
                pathname: '/(app)/learning/problems/solve',
                params: {
                  level: todayLearning!.level,
                  language: todayLearning!.language,
                  cefrLevel: todayLearning!.cefrLevel ?? '',
                  qurveLevel: todayLearning!.qurveLevel ?? '',
                  category: todayLearning!.categoryCode,
                  subType: todayLearning!.subTypeCode,
                  count: String(todayLearning!.totalQuestionCount),
                  offset: String(todayLearning!.offset),
                  categoryLabel: todayLearning!.category,
                  subTypeLabel: todayLearning!.title,
                },
              })
            }
          >
            <Text className="font-bold text-base text-white">
              {isLoading ? '불러오는 중...' : '시작하기'}
            </Text>
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
