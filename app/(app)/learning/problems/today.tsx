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

export default function TodayProblemsPage() {
  const router = useRouter();
  const [todayLearning, setTodayLearning] = useState<TodayLearning | null>(null);
  const [completedSession, setCompletedSession] = useState<ProblemSession | null>(() =>
    getCompletedProblemSession(),
  );

  useEffect(() => {
    const loadTodayLearning = async () => {
      try {
        const [result, savedSession] = await Promise.all([
          getTodayLearning(),
          loadCompletedProblemSession(),
        ]);
        setTodayLearning(result);
        setCompletedSession(savedSession);
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

  const hasCompletedTodayLearning = Boolean(completedSession && completedSummary);
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

        {!hasCompletedTodayLearning ? (
          <Pressable
            className="mt-4 h-[50px] items-center justify-center rounded-xl bg-btn-dark"
            onPress={() =>
              router.push({
                pathname: '/(app)/learning/problems/solve',
                params: {
                  category: todayLearning?.category ?? '문자/어휘',
                  subType: todayLearning?.title ?? '문맥규정',
                  count: String(todayLearning?.totalQuestionCount ?? 20),
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
