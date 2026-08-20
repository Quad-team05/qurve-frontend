import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ApiError } from '@/lib/api/client';
import { getProblems, submitProblem, type ProblemItem } from '@/lib/api/problem';
import { getMyProfile } from '@/lib/api/user';
import {
  clearProblemSession,
  completeProblemSession,
  createProblemSession,
  getProblemSession,
  setProblemCurrentQuestionIndex,
  setProblemSelection,
  setProblemSubmission,
} from '@/lib/learning/problem-session';
import { type JlptLevel } from '@/lib/api/vocabulary';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEFAULT_CATEGORY = '문자/어휘';
const DEFAULT_SUB_TYPE = '문맥규정';
const DEFAULT_LEVEL: JlptLevel = 'N5';
const DEFAULT_COUNT = 20;
const FALLBACK_LEVELS: JlptLevel[] = ['N5', 'N4'];

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

function normalizeParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseCount(value?: string | string[]) {
  const count = Number(normalizeParam(value));

  if (Number.isFinite(count) && count > 0) return count;

  return DEFAULT_COUNT;
}

function mapCurrentLevelToJlptLevel(currentLevel: number | null | undefined): JlptLevel {
  if (currentLevel && currentLevel >= 1 && currentLevel <= 5) {
    return `N${currentLevel}` as JlptLevel;
  }

  return DEFAULT_LEVEL;
}

function mapCategoryToApiValue(category: string) {
  switch (category) {
    case '문자/어휘':
      return 'LANGUAGE_KNOWLEDGE';
    case '문법':
      return 'GRAMMAR';
    case '독해':
      return 'READING';
    default:
      return category;
  }
}

function mapSubTypeToApiValue(subType: string) {
  switch (subType) {
    case '문맥규정':
      return 'CONTEXT_VOCABULARY';
    case '한자읽기':
      return 'KANJI_READING';
    case '용법':
      return 'USAGE';
    case '문형':
      return 'GRAMMAR_PATTERN';
    case '독해':
      return 'READING_COMPREHENSION';
    default:
      return subType;
  }
}

function buildLevelCandidates(preferredLevel: JlptLevel) {
  return [preferredLevel, ...FALLBACK_LEVELS].filter(
    (level, index, levels) => levels.indexOf(level) === index,
  );
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return '문제를 불러오지 못했습니다.';

  if (error.status === 401 || error.status === 403) {
    return '로그인이 필요합니다. 다시 로그인해주세요.';
  }

  if (error.code === 'PROBLEM_NOT_FOUND') {
    return '해당 조건의 문제를 찾을 수 없습니다.';
  }

  if (error.code === 'INVALID_LEVEL') {
    return '올바르지 않은 레벨 정보입니다.';
  }

  return error.message || '문제를 불러오지 못했습니다.';
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
      segments.push({
        text: normalizedText.slice(lastIndex, match.index),
        underlined: false,
      });
    }

    segments.push({ text: match[1], underlined: true });
    lastIndex = match.index + match[0].length;
    match = underlinePattern.exec(normalizedText);
  }

  if (segments.length === 0) {
    return <Text className="mb-6 mt-5 font-regular text-lg text-black">{normalizedText}</Text>;
  }

  if (lastIndex < normalizedText.length) {
    segments.push({
      text: normalizedText.slice(lastIndex),
      underlined: false,
    });
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

export default function SolveProblemPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    category?: string | string[];
    subType?: string | string[];
    count?: string | string[];
  }>();

  const category = normalizeParam(params.category) || DEFAULT_CATEGORY;
  const subType = normalizeParam(params.subType) || DEFAULT_SUB_TYPE;
  const count = useMemo(() => parseCount(params.count), [params.count]);
  const apiCategory = useMemo(() => mapCategoryToApiValue(category), [category]);
  const apiSubType = useMemo(() => mapSubTypeToApiValue(subType), [subType]);

  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [selectedByQuestion, setSelectedByQuestion] = useState<(number | null)[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showStopModal, setShowStopModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const profile = await getMyProfile();
        const preferredLevel = mapCurrentLevelToJlptLevel(profile.currentLevel);
        const candidateLevels = buildLevelCandidates(preferredLevel);
        let response = null;
        let resolvedLevel = preferredLevel;
        let lastProblemNotFoundError: ApiError | null = null;

        for (const level of candidateLevels) {
          try {
            response = await getProblems({
              level,
              category: apiCategory,
              subType: apiSubType,
              count,
            });
            resolvedLevel = level;
            break;
          } catch (error) {
            if (error instanceof ApiError && error.code === 'PROBLEM_NOT_FOUND') {
              lastProblemNotFoundError = error;
              continue;
            }

            throw error;
          }
        }

        if (!response) {
          throw lastProblemNotFoundError ?? new Error('문제를 불러오지 못했습니다.');
        }

        if (!mounted) return;

        setProblems(response.problems);
        setSelectedByQuestion(Array.from({ length: response.problems.length }, () => null));
        setCurrentQuestionIndex(0);
        createProblemSession(
          {
            level: resolvedLevel,
            category: apiCategory,
            subType: apiSubType,
            count: response.problemCount,
          },
          response.problems,
        );
      } catch (error) {
        if (!mounted) return;

        setProblems([]);
        setSelectedByQuestion([]);
        setErrorMessage(getErrorMessage(error));
        clearProblemSession();
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchProblems();

    return () => {
      mounted = false;
    };
  }, [apiCategory, apiSubType, count, retryCount]);

  const currentQuestion = problems[currentQuestionIndex];
  const totalProblemCount = problems.length;
  const selectedChoiceNumber = selectedByQuestion[currentQuestionIndex] ?? null;
  const progressPercent = totalProblemCount
    ? ((currentQuestionIndex + 1) / totalProblemCount) * 100
    : 0;

  const handleSelectOption = (choiceNumber: number) => {
    if (!currentQuestion) return;

    setSelectedByQuestion((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = choiceNumber;
      return next;
    });
    setProblemSelection(currentQuestion.problemId, choiceNumber);
  };

  const handlePrev = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((prev) => {
      const next = prev - 1;
      setProblemCurrentQuestionIndex(next);
      return next;
    });
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    if (selectedChoiceNumber === null) {
      showToast('선지를 선택해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (currentQuestionIndex === totalProblemCount - 1) {
        const submissionTasks = problems.map(async (problem, index) => {
          const choiceNumber = selectedByQuestion[index];

          if (choiceNumber === null) {
            return null;
          }

          const submission = await submitProblem(problem.problemId, {
            selectedChoiceNumber: choiceNumber,
          });

          setProblemSubmission(problem.problemId, submission);
          return submission;
        });

        await Promise.all(submissionTasks);
        completeProblemSession();
        router.push('/(app)/learning/problems/result');
        return;
      }

      setCurrentQuestionIndex((prev) => {
        const next = prev + 1;
        setProblemCurrentQuestionIndex(next);
        return next;
      });
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : '문제 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmStop = () => {
    clearProblemSession();
    setShowStopModal(false);

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.push('/(app)/learning/problems/today');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="문제보기" onBackPress={() => setShowStopModal(true)} />

      <View className="flex-1 px-4 pt-3">
        <View className="mb-4 flex-row gap-2">
          <Pressable className="rounded-sm border border-border bg-white px-4 py-2">
            <Text className="text-xs font-semibold text-text-brown">
              {currentQuestion?.questionFormat || '객관식'}
            </Text>
          </Pressable>
          <Pressable className="rounded-sm border border-border bg-white px-4 py-2">
            <Text className="text-xs font-semibold text-text-brown">{subType}</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-text-brown">문제를 불러오는 중...</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-[#DC2626]">{errorMessage}</Text>
            <Pressable
              className="mt-3 self-start rounded-sm bg-btn-dark px-4 py-2"
              onPress={() => setRetryCount((prev) => prev + 1)}
            >
              <Text className="font-semiBold text-xs text-white">다시 시도</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !errorMessage && currentQuestion ? (
          <>
            <ScrollView
              className="flex-1"
              contentContainerClassName="pb-4"
              showsVerticalScrollIndicator={false}
            >
              <View className="mx-auto h-[10px] w-[50px] rounded-[1px] bg-[#F9C8D8]" />
              <View
                className="mb-4 rounded-sm border border-border bg-white px-4 pb-4 pt-5"
                style={questionCardShadowStyle}
              >
                <Text className="font-bold text-sm text-[#A09080]">
                  Q{currentQuestionIndex + 1}.
                </Text>
                <Text className="mt-2 font-regular text-lg text-black">
                  {currentQuestion.questionText}
                </Text>

                {renderPassageText(currentQuestion.passageText)}

                {currentQuestion.choices.map((choice) => {
                  const selected = choice.choiceNumber === selectedChoiceNumber;
                  return (
                    <Pressable
                      key={`q${currentQuestion.problemId}-${choice.choiceNumber}`}
                      onPress={() => handleSelectOption(choice.choiceNumber)}
                      className={`mb-3 rounded-sm border px-[14px] py-4 ${selected ? 'border-[#D7CEBF] bg-[#E8E2D4]' : 'border-border bg-white'}`}
                    >
                      <Text
                        className={`text-sm font-semibold ${selected ? 'text-gray' : 'text-[#2A2018]'}`}
                      >
                        {choice.choiceNumber}. {choice.choiceText}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View className="pb-[18px]">
              <Text className="pb-[10px] text-sm font-semibold text-[#8C877D]">
                {currentQuestionIndex + 1} / {totalProblemCount}
              </Text>
              <View className="mb-5 h-[3px] w-full bg-[#E0D8C8]">
                <View className="h-[3px] bg-gray" style={{ width: `${progressPercent}%` }} />
              </View>

              <View className="h-px w-full border-t border-dashed border-border" />

              <View className="mt-[18px] flex-row gap-11">
                <Pressable
                  className={`px-25 h-[43px] flex-1 items-center justify-center rounded-xl border py-3 ${currentQuestionIndex === 0 ? 'border-[#D8D2C7] bg-[#F4F2EE]' : 'border-border bg-white'}`}
                  onPress={handlePrev}
                  disabled={currentQuestionIndex === 0 || isSubmitting}
                >
                  <Text className="font-old text-sm text-black">이전</Text>
                </Pressable>
                <Pressable
                  className={`px-25 h-[43px] flex-1 items-center justify-center rounded-xl py-3 ${isSubmitting ? 'bg-[#8E8174]' : 'bg-btn-dark'}`}
                  onPress={() => void handleNext()}
                  disabled={isSubmitting}
                >
                  <Text className="font-bold text-sm text-white">
                    {isSubmitting ? '제출 중...' : '다음'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : null}

        {!isLoading && !errorMessage && !currentQuestion ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-text-brown">표시할 문제가 없습니다.</Text>
          </View>
        ) : null}
      </View>

      <Modal
        transparent
        visible={showStopModal}
        animationType="fade"
        onRequestClose={() => setShowStopModal(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/20 px-6"
          onPress={() => setShowStopModal(false)}
        >
          <Pressable
            className="h-[200px] w-[340px] items-center justify-center rounded-lg border border-border bg-white px-6"
            onPress={() => {}}
          >
            <Text className="text-center text-[18px] text-[#2A2018]">학습을 중단하시겠습니까?</Text>
            <Text className="mt-1 text-center text-[14px] text-[#2A2018]">
              지금까지 푼 문제는 저장되지 않습니다.
            </Text>

            <View className="mt-4 flex-row justify-center gap-4">
              <Pressable
                className="h-[40px] w-[66px] items-center justify-center rounded-lg border border-border bg-white px-5 py-3"
                onPress={handleConfirmStop}
              >
                <Text className="text-sm text-[#2A2018]">중단</Text>
              </Pressable>
              <Pressable
                className="h-[40px] w-[66px] items-center justify-center rounded-lg bg-[#7F7F7F] px-5 py-3"
                onPress={() => setShowStopModal(false)}
              >
                <Text className="text-sm text-white">취소</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
