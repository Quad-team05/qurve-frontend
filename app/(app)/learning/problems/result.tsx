import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ApiError } from '@/lib/api/client';
import { getProblemSolution, type ProblemSubmitResult } from '@/lib/api/problem';
import {
  clearProblemSession,
  getCompletedProblemSession,
  getProblemSession,
  loadCompletedProblemSession,
  setProblemSubmission,
  type ProblemSession,
} from '@/lib/learning/problem-session';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ToastAndroid, View } from 'react-native';
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

function toSubmissionResult(
  problemId: number,
  solution: Awaited<ReturnType<typeof getProblemSolution>>['solutions'][number],
) {
  return {
    problemId,
    submissionId: solution.submissionId,
    selectedChoiceNumber: solution.selectedChoiceNumber,
    answerChoiceNumber: solution.answerChoiceNumber,
    answerChoiceText: solution.answerChoiceText,
    correct: solution.correct,
    explanation: solution.explanation,
  } satisfies ProblemSubmitResult;
}

export default function LearningResultPage() {
  const router = useRouter();
  const [problemSession, setProblemSession] = useState<ProblemSession | null>(
    () => getProblemSession() ?? getCompletedProblemSession(),
  );

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      const savedSession = await loadCompletedProblemSession();
      if (!mounted) return;

      setProblemSession((prev) => prev ?? savedSession);
    };

    void initializeSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadLatestResults = async () => {
      if (!problemSession || problemSession.problems.length === 0) return;

      try {
        const solutions = await Promise.all(
          problemSession.problems.map(async (problem) => {
            const result = await getProblemSolution(problem.problemId);
            const latestSolution = result.solutions[0];

            if (!latestSolution) return null;

            return toSubmissionResult(problem.problemId, latestSolution);
          }),
        );

        if (!mounted) return;

        setProblemSession((prev) => {
          if (!prev) return prev;

          const nextSubmissions = { ...prev.submissions };

          solutions.forEach((solution) => {
            if (!solution) return;
            nextSubmissions[solution.problemId] = solution;
            setProblemSubmission(solution.problemId, solution);
          });

          return {
            ...prev,
            submissions: nextSubmissions,
          };
        });
      } catch (error) {
        if (!mounted) return;
        showToast(error instanceof ApiError ? error.message : '문제 결과를 불러오지 못했습니다.');
      }
    };

    void loadLatestResults();

    return () => {
      mounted = false;
    };
  }, [problemSession?.problems]);

  const summary = useMemo(() => {
    if (!problemSession) {
      return {
        totalCount: 0,
        correctCount: 0,
        wrongCount: 0,
        elapsedMinutes: 0,
      };
    }

    const totalCount = problemSession.problems.length;
    const correctCount = problemSession.problems.reduce((count, problem) => {
      if (problemSession.submissions[problem.problemId]?.correct) {
        return count + 1;
      }

      return count;
    }, 0);
    const wrongCount = totalCount - correctCount;
    const finishedAt = problemSession.finishedAt ?? Date.now();
    const elapsedMinutes = Math.max(
      1,
      Math.round((finishedAt - problemSession.startedAt) / (1000 * 60)),
    );

    return {
      totalCount,
      correctCount,
      wrongCount,
      elapsedMinutes,
    };
  }, [problemSession]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="문제보기" showBackButton={false} />

      <View className="flex-1 px-4 pt-4">
        <Text className="mb-[6px] text-xs text-text-brown">오늘의 학습 결과</Text>
        <View
          className="rounded-sm border border-border bg-white px-4 py-4 pb-4"
          style={cardShadowStyle}
        >
          <Text className="mt-2 font-regular text-base text-[#2A2018]">
            • 총 {summary.totalCount}문제
          </Text>
          <Text className="mt-2 font-regular text-base text-[#2A2018]">
            • 풀이 시간: {summary.elapsedMinutes}분
          </Text>

          <View className="my-5 h-px bg-border" />

          <Text className="font-regular text-sm text-[#059669]">
            • 맞은 문제: {summary.correctCount}개
          </Text>
          <Text className="mt-2 font-regular text-sm text-[#CC4444]">
            • 틀린 문제: {summary.wrongCount}개
          </Text>
        </View>

        <Pressable
          className="mt-4 h-[50px] items-center justify-center rounded-xl bg-btn-dark"
          onPress={() => router.push('/(app)/learning/problems/review')}
          disabled={!problemSession}
        >
          <Text className="font-bold text-base text-white">정답 확인하기</Text>
        </Pressable>

        <Pressable
          className="mt-3 h-[50px] items-center justify-center rounded-xl border border-border bg-white"
          onPress={() => {
            clearProblemSession();
            router.push('/(tabs)/study');
          }}
        >
          <Text className="font-bold text-base text-[#2A2018]">학습 종료하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
