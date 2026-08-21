import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ApiError } from '@/lib/api/client';
import {
  addProblemBookmark,
  getProblemSolution,
  removeProblemBookmark,
  type ProblemSubmitResult,
} from '@/lib/api/problem';
import {
  clearProblemSession,
  getCompletedProblemSession,
  getProblemSession,
  loadCompletedProblemSession,
  setProblemBookmarkState,
  setProblemSubmission,
  type ProblemSession,
} from '@/lib/learning/problem-session';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const questionCardShadowStyle = {
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

function mapSubTypeToLabel(subType?: string) {
  switch (subType) {
    case 'CONTEXT_VOCABULARY':
      return '문맥규정';
    case 'KANJI_READING':
      return '한자 읽기';
    case 'USAGE':
      return '용법';
    case 'GRAMMAR_PATTERN':
      return '문형';
    case 'READING_COMPREHENSION':
      return '독해';
    default:
      return subType || '문맥규정';
  }
}

function mapQuestionFormatToLabel(questionFormat?: string) {
  switch (questionFormat) {
    case 'MULTIPLE_CHOICE':
      return '객관식';
    default:
      return questionFormat || '객관식';
  }
}

function renderPassageText(passageText: string) {
  const normalizedText = passageText?.trim();

  if (!normalizedText) return null;

  const underlinePattern = /<u>(.*?)<\/u>/g;
  const segments: { text: string; underlined: boolean }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = underlinePattern.exec(normalizedText);

  while (match) {
    if (match.index > lastIndex) {
      segments.push({ text: normalizedText.slice(lastIndex, match.index), underlined: false });
    }

    segments.push({ text: match[1], underlined: true });
    lastIndex = match.index + match[0].length;
    match = underlinePattern.exec(normalizedText);
  }

  if (segments.length === 0) {
    return <Text className="mb-6 mt-5 font-regular text-lg text-black">{normalizedText}</Text>;
  }

  if (lastIndex < normalizedText.length) {
    segments.push({ text: normalizedText.slice(lastIndex), underlined: false });
  }

  return (
    <Text className="mb-6 mt-5 font-regular text-lg text-black">
      {segments.map((segment, index) => (
        <Text
          key={`${segment.text}-${index}`}
          className={segment.underlined ? 'font-regular text-lg text-black underline' : ''}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

function toSubmissionResult(
  solution: Awaited<ReturnType<typeof getProblemSolution>>['solutions'][number],
) {
  return {
    problemId: 0,
    submissionId: solution.submissionId,
    selectedChoiceNumber: solution.selectedChoiceNumber,
    answerChoiceNumber: solution.answerChoiceNumber,
    answerChoiceText: solution.answerChoiceText,
    correct: solution.correct,
    explanation: solution.explanation,
  } satisfies ProblemSubmitResult;
}

export default function ReviewProblemPage() {
  const router = useRouter();
  const [problemSession, setProblemSession] = useState<ProblemSession | null>(
    () => getProblemSession() ?? getCompletedProblemSession(),
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submissionsByProblemId, setSubmissionsByProblemId] = useState<
    Record<number, ProblemSubmitResult>
  >(() => problemSession?.submissions ?? {});
  const [bookmarkedByProblemId, setBookmarkedByProblemId] = useState<Record<number, boolean>>(
    () => problemSession?.bookmarks ?? {},
  );
  const [isBookmarkSubmitting, setIsBookmarkSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      const savedSession = await loadCompletedProblemSession();
      if (!mounted || !savedSession) return;

      setProblemSession((prev) => prev ?? savedSession);
      setSubmissionsByProblemId((prev) =>
        Object.keys(prev).length > 0 ? prev : (savedSession.submissions ?? {}),
      );
      setBookmarkedByProblemId((prev) =>
        Object.keys(prev).length > 0 ? prev : (savedSession.bookmarks ?? {}),
      );
    };

    void initializeSession();

    return () => {
      mounted = false;
    };
  }, []);

  const currentQuestion = problemSession?.problems[currentQuestionIndex];
  const totalProblemCount = problemSession?.problems.length ?? 0;

  useEffect(() => {
    let mounted = true;

    const loadSolution = async () => {
      if (!currentQuestion) return;

      try {
        const result = await getProblemSolution(currentQuestion.problemId);
        const latestSolution = result.solutions[0];

        if (!mounted || !latestSolution) return;

        const nextSubmission = {
          ...toSubmissionResult(latestSolution),
          problemId: currentQuestion.problemId,
        };

        setSubmissionsByProblemId((prev) => ({
          ...prev,
          [currentQuestion.problemId]: nextSubmission,
        }));
        setProblemSubmission(currentQuestion.problemId, nextSubmission);
      } catch (error) {
        if (!mounted) return;
        showToast(error instanceof ApiError ? error.message : '정답 정보를 불러오지 못했습니다.');
      }
    };

    void loadSolution();

    return () => {
      mounted = false;
    };
  }, [currentQuestion]);

  const currentSubmission = currentQuestion
    ? (submissionsByProblemId[currentQuestion.problemId] ?? null)
    : null;
  const progressPercent = totalProblemCount
    ? ((currentQuestionIndex + 1) / totalProblemCount) * 100
    : 0;

  const handlePrev = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!problemSession) {
      router.push('/(tabs)/study');
      return;
    }

    if (currentQuestionIndex === totalProblemCount - 1) {
      clearProblemSession();
      router.push('/(tabs)/study');
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleToggleBookmark = async () => {
    if (!currentQuestion || isBookmarkSubmitting) return;

    const currentState = bookmarkedByProblemId[currentQuestion.problemId] ?? false;

    try {
      setIsBookmarkSubmitting(true);

      if (currentState) {
        await removeProblemBookmark(currentQuestion.problemId);
      } else {
        await addProblemBookmark(currentQuestion.problemId);
      }

      const nextState = !currentState;
      setBookmarkedByProblemId((prev) => ({
        ...prev,
        [currentQuestion.problemId]: nextState,
      }));
      setProblemBookmarkState(currentQuestion.problemId, nextState);
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : '북마크 처리에 실패했습니다.');
    } finally {
      setIsBookmarkSubmitting(false);
    }
  };

  const answerLabel = useMemo(() => {
    if (!currentSubmission) return '';

    return `${currentSubmission.answerChoiceNumber + 1}. ${currentSubmission.answerChoiceText}`;
  }, [currentSubmission]);

  if (!problemSession || !currentQuestion) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <TopBar title="문제보기" />
        <View className="flex-1 px-4 pt-4">
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-text-brown">
              확인할 문제 풀이 정보가 없습니다.
            </Text>
          </View>
          <Pressable
            className="mt-4 h-[50px] items-center justify-center rounded-xl bg-btn-dark"
            onPress={() => router.push('/(tabs)/study')}
          >
            <Text className="font-bold text-base text-white">학습 화면으로 이동</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="문제보기" />

      <View className="flex-1 px-4 pt-3">
        <View className="mb-4 flex-row gap-2">
          <Pressable className="rounded-sm border border-border bg-white px-4 py-2">
            <Text className="text-xs font-semibold text-text-brown">
              {mapQuestionFormatToLabel(currentQuestion.questionFormat)}
            </Text>
          </Pressable>
          <Pressable className="rounded-sm border border-border bg-white px-4 py-2">
            <Text className="text-xs font-semibold text-text-brown">
              {mapSubTypeToLabel(currentQuestion.subType)}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="mx-auto h-[10px] w-[50px] rounded-[1px] bg-[#F9C8D8]" />

          <View
            className="mb-4 rounded-sm border border-border bg-white px-4 pb-5 pt-5"
            style={questionCardShadowStyle}
          >
            <Text className="font-bold text-sm text-[#A09080]">Q{currentQuestionIndex + 1}.</Text>
            <Text className="mt-2 font-regular text-lg text-black">
              {currentQuestion.questionText}
            </Text>
            {renderPassageText(currentQuestion.passageText)}

            {currentQuestion.choices.map((choice) => {
              const selected = choice.choiceNumber === currentSubmission?.selectedChoiceNumber;
              return (
                <View
                  key={`review-q${currentQuestion.problemId}-${choice.choiceNumber}`}
                  className={`mb-3 rounded-sm border px-[14px] py-4 ${selected ? 'border-[#D7CEBF] bg-[#E8E2D4]' : 'border-border bg-white'}`}
                >
                  <Text
                    className={`text-sm font-semibold ${selected ? 'text-gray' : 'text-[#2A2018]'}`}
                  >
                    {choice.choiceNumber + 1}. {choice.choiceText}
                  </Text>
                </View>
              );
            })}

            <View className="mb-4 mt-2 h-px border-t border-dashed border-border" />

            <Text className="text-xs font-semibold text-text-brown">정답 해설</Text>
            <Text className="mt-2 text-sm font-semibold text-[#059669]">{answerLabel}</Text>
            <Text className="mt-2 text-sm font-semibold text-[#8C877D]">
              {currentSubmission?.explanation ?? '정답 정보를 불러오는 중입니다.'}
            </Text>
          </View>

          <Pressable
            className="self-end rounded-xl border border-border bg-white px-5 py-2"
            onPress={() => void handleToggleBookmark()}
            disabled={isBookmarkSubmitting}
          >
            <Text className="text-sm font-semibold text-[#2A2018]">
              북마크 {(bookmarkedByProblemId[currentQuestion.problemId] ?? false) ? '★' : '☆'}
            </Text>
          </Pressable>
        </ScrollView>

        <View className="pb-[18px]">
          <Text className="pb-[10px] text-sm font-semibold text-[#8C877D]">
            {currentQuestionIndex + 1} / {totalProblemCount}
          </Text>
          <View className="mb-5 h-[3px] w-full bg-[#E0D8C8]">
            <View className="h-[3px] bg-gray" style={{ width: `${progressPercent}%` }} />
          </View>

          <View className="mb-5 h-px w-full border-t border-dashed border-border" />

          <View className="flex-row gap-11">
            <Pressable
              className={`px-25 h-[43px] flex-1 items-center justify-center rounded-xl border py-3 ${currentQuestionIndex === 0 ? 'border-[#D8D2C7] bg-[#F4F2EE]' : 'border-border bg-white'}`}
              onPress={handlePrev}
              disabled={currentQuestionIndex === 0}
            >
              <Text className="font-old text-sm text-black">이전</Text>
            </Pressable>
            <Pressable
              className="px-25 h-[43px] flex-1 items-center justify-center rounded-xl bg-btn-dark py-3"
              onPress={handleNext}
            >
              <Text className="font-bold text-sm text-white">
                {currentQuestionIndex === totalProblemCount - 1 ? '학습 종료하기' : '다음'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
