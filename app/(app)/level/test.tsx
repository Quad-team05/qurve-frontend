import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import {
  getLevelTestQuestions,
  submitLevelTestResult,
  type LevelTestQuestion,
} from '@/lib/api/level';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const questionCardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function LevelTestPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    pre1Answer?: string;
    pre2Answer?: string;
    pre3Answer?: string;
  }>();

  const [questions, setQuestions] = useState<LevelTestQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedByQuestion, setSelectedByQuestion] = useState<(number | null)[]>([]);

  const pre1Answer = Number(params.pre1Answer);
  const pre2Answer = Number(params.pre2Answer);
  const pre3Answer = Number(params.pre3Answer);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const result = await getLevelTestQuestions({
          pre1Answer,
          pre2Answer,
          pre3Answer,
        });
        setQuestions(result.questions);
        setSelectedByQuestion(Array.from({ length: result.questions.length }, () => null));
      } catch (error) {
        console.error('레벨 테스트 문제를 불러오지 못했습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCurrentQuestionIndex(0);
    }, []),
  );

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptionId = selectedByQuestion[currentQuestionIndex] ?? null;
  const progressPercent =
    questions.length === 0 ? 0 : ((currentQuestionIndex + 1) / questions.length) * 100;

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
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    // 마지막 문제 → 채점 요청
    if (selectedByQuestion.some((a) => a === null)) return;

    try {
      setIsSubmitting(true);

      const result = await submitLevelTestResult({
        pre1Answer,
        pre2Answer,
        pre3Answer,
        answers: selectedByQuestion as number[],
      });

      router.push({
        pathname: '/(app)/level/assign',
        params: {
          score: String(result.score),
          correctCount: String(result.correctCount),
          wrongCount: String(result.wrongCount),
          level: String(result.level),
        },
      });
    } catch (error) {
      console.error('레벨 테스트 결과 제출에 실패했습니다.', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSentence = (sentence: string) => {
    return <Text className="mb-6 mt-5 font-regular text-lg text-black">{sentence}</Text>;
  };

  if (isLoading || !currentQuestion) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <TopBar title="레벨 테스트" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-text-brown">불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text className="text-xs font-semibold text-[#A09080]">
              {currentQuestion.difficulty}
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
            className="mb-4 rounded-sm border border-border bg-white px-4 pb-4 pt-5"
            style={questionCardShadowStyle}
          >
            <Text className="font-bold text-sm text-[#A09080]">Q{currentQuestionIndex + 1}.</Text>
            {renderSentence(currentQuestion.questionText)}

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
                    {option.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={{ paddingBottom: 60 }}>
          <Text className="pb-[10px] text-sm font-semibold text-[#8C877D]">
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
          <View className="mb-5 h-[3px] w-full bg-[#E0D8C8]">
            <View className="h-[3px] bg-gray" style={{ width: `${progressPercent}%` }} />
          </View>

          <View className="h-px w-full border-t border-dashed border-border" />

          <View className="mt-[18px] flex-row gap-11">
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
              disabled={selectedOptionId === null || isSubmitting}
            >
              <Text className="font-bold text-sm text-white">
                {isSubmitting
                  ? '채점 중...'
                  : currentQuestionIndex === questions.length - 1
                    ? '결과 보기'
                    : '다음'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
