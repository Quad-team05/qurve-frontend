import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ApiError } from '@/lib/api/client';
import {
  getLevelTestQuestions,
  saveLevel,
  submitLevelTestResult,
  type LearningLanguage,
  type LevelTestQuestion,
} from '@/lib/api/level';
import { clearAuthSession } from '@/lib/auth/session';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

function normalizeParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseRequiredAnswer(value?: string | string[]) {
  const answer = Number(normalizeParam(value));
  return Number.isInteger(answer) && answer > 0 ? answer : null;
}

function getLevelTitle(level: number, language: LearningLanguage) {
  if (language === 'ENGLISH') {
    if (level <= 2) return '기초 표현 입문자';
    if (level <= 4) return '일상 문장 학습자';
    if (level <= 6) return '문장 확장자';
    if (level <= 8) return '실전 독해자';
    return '고급 커뮤니케이터';
  }

  if (level <= 2) return '기초 표현 입문자';
  if (level <= 4) return '히라가나 탐험가';
  if (level <= 6) return '문장 확장자';
  if (level <= 8) return '실전 독해자';
  return '고급 일본어 러너';
}

function getLevelDescription(level: number) {
  if (level <= 2) return '기초 단어와 짧은 표현부터 차근차근 시작하기 좋은 단계예요.';
  if (level <= 4) return '기본 문장을 읽고 핵심 의미를 파악할 수 있는 단계예요.';
  if (level <= 6) return '다양한 문형으로 의사 표현을 확장할 수 있는 단계예요.';
  if (level <= 8) return '조금 긴 문장과 실전 문제에 도전하기 좋은 단계예요.';
  return '고난도 표현과 독해를 학습해도 좋은 단계예요.';
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return '레벨 테스트를 처리하지 못했습니다.';

  if (error.status === 401 || error.status === 403) {
    return '로그인이 필요합니다. 다시 로그인해주세요.';
  }

  return error.message || '레벨 테스트를 처리하지 못했습니다.';
}

export default function LevelTestPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    pre1Answer?: string | string[];
    pre2Answer?: string | string[];
    pre3Answer?: string | string[];
  }>();

  const [questions, setQuestions] = useState<LevelTestQuestion[]>([]);
  const [learningLanguage, setLearningLanguage] = useState<LearningLanguage>('JAPANESE');
  const [caseNumber, setCaseNumber] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedByQuestion, setSelectedByQuestion] = useState<(number | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadQuestions = useCallback(async () => {
    const pre1Answer = parseRequiredAnswer(params.pre1Answer);
    const pre2Answer = parseRequiredAnswer(params.pre2Answer);
    const pre3Answer = parseRequiredAnswer(params.pre3Answer);

    if (!pre1Answer || !pre2Answer || !pre3Answer) {
      setErrorMessage('설문 응답을 확인할 수 없습니다. 설문부터 다시 진행해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const result = await getLevelTestQuestions({ pre1Answer, pre2Answer, pre3Answer });

      setQuestions(result.questions);
      setLearningLanguage(result.learningLanguage);
      setCaseNumber(result.caseNumber);
      setCurrentQuestionIndex(0);
      setSelectedByQuestion(Array.from({ length: result.questions.length }, () => null));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }

      setQuestions([]);
      setSelectedByQuestion([]);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [params.pre1Answer, params.pre2Answer, params.pre3Answer, router]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptionId = selectedByQuestion[currentQuestionIndex] ?? null;
  const totalQuestionCount = questions.length;
  const progressPercent = totalQuestionCount
    ? ((currentQuestionIndex + 1) / totalQuestionCount) * 100
    : 0;

  const handleSelectOption = (optionId: number) => {
    setSelectedByQuestion((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = optionId;
      return next;
    });
  };

  const handlePrev = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleNext = async () => {
    if (!currentQuestion || !caseNumber) return;

    if (selectedOptionId === null) {
      showToast('선지를 선택해주세요.');
      return;
    }

    if (currentQuestionIndex < totalQuestionCount - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    const answers = selectedByQuestion.filter((answer): answer is number => answer !== null);

    if (answers.length !== totalQuestionCount) {
      showToast('모든 문제에 답변해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await submitLevelTestResult({
        learningLanguage,
        caseNumber,
        answers,
      });

      await saveLevel(result.level, result.learningLanguage);

      router.replace({
        pathname: '/(app)/level/assign',
        params: {
          learningLanguage: result.learningLanguage,
          caseNumber: String(result.caseNumber),
          score: String(result.score),
          correctCount: String(result.correctCount),
          wrongCount: String(result.wrongCount),
          level: String(result.level),
          title: getLevelTitle(result.level, result.learningLanguage),
          description: getLevelDescription(result.level),
        },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }

      showToast(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="레벨 테스트" />

      <View className="flex-1 px-4 pt-3">
        <View className="mb-3">
          <View className="mb-2 flex-row items-center justify-between px-1">
            <Text className="w-1/3 text-center text-xs font-semibold text-gray">설문</Text>
            <Text className="w-1/3 text-center text-xs font-semibold text-gray">레벨테스트</Text>
            <Text className="w-1/3 text-center text-xs font-semibold text-[#A6A092]">결과</Text>
          </View>
          <View className="h-[3px] w-full bg-[#D8D2C7]">
            <View className="h-[3px] w-2/3 bg-gray" />
          </View>
        </View>

        <View className="mb-4 flex-row gap-2">
          <Pressable className="rounded-sm border border-border bg-white px-4 py-2">
            <Text className="text-xs font-semibold text-[#A09080]">객관식</Text>
          </Pressable>
          <Pressable className="rounded-sm border border-border bg-white px-4 py-2">
            <Text className="text-xs font-semibold text-[#A09080]">
              {learningLanguage === 'ENGLISH' ? '영어' : '일본어'}
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-text-brown">문제를 불러오는 중...</Text>
          </View>
        ) : errorMessage ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-semiBold text-sm text-btn-dark">{errorMessage}</Text>
            <Pressable
              className="mt-3 self-start rounded-sm bg-btn-dark px-4 py-2"
              onPress={() => router.replace('/(app)/level/test-survey')}
            >
              <Text className="font-semiBold text-xs text-white">설문 다시하기</Text>
            </Pressable>
          </View>
        ) : currentQuestion ? (
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
                <Text className="mb-6 mt-2 font-regular text-xs text-[#A09080]">
                  난이도 {currentQuestion.difficulty}
                </Text>

                {currentQuestion.options.map((option) => {
                  const selected = option.optionId === selectedOptionId;
                  return (
                    <Pressable
                      key={`q${currentQuestion.questionId}-${option.optionId}`}
                      onPress={() => handleSelectOption(option.optionId)}
                      className={`mb-3 rounded-sm border px-[14px] py-4 ${selected ? 'border-[#C8E0D6] bg-[#F2F9EE]' : 'border-border bg-white'}`}
                    >
                      <Text
                        className={`text-sm font-semibold ${selected ? 'text-gray' : 'text-[#2A2018]'}`}
                      >
                        {option.optionId}. {option.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View style={{ paddingBottom: 60 }}>
              <Text className="pb-[10px] text-sm font-semibold text-[#8C877D]">
                {currentQuestionIndex + 1} / {totalQuestionCount}
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
                  className="px-25 h-[43px] flex-1 items-center justify-center rounded-xl bg-btn-dark py-3"
                  onPress={handleNext}
                  disabled={isSubmitting}
                >
                  <Text className="font-bold text-sm text-white">
                    {isSubmitting
                      ? '제출 중...'
                      : currentQuestionIndex === totalQuestionCount - 1
                        ? '결과 보기'
                        : '다음'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
