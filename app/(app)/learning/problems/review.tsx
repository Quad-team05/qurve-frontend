import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseAnswersParam, PROBLEM_QUESTIONS, TOTAL_PROBLEM_COUNT } from './questionData';

const questionCardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function ReviewProblemPage() {
  const router = useRouter();
  const { answers } = useLocalSearchParams<{ answers?: string | string[] }>();
  const parsedAnswers = useMemo(() => parseAnswersParam(answers), [answers]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = PROBLEM_QUESTIONS[currentQuestionIndex];
  const selectedIndex = parsedAnswers[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / TOTAL_PROBLEM_COUNT) * 100;

  const handlePrev = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex === TOTAL_PROBLEM_COUNT - 1) {
      router.push('/(tabs)/study');
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="문제보기" />

      <View className="flex-1 px-4 pt-3">
        <View className="mb-4 flex-row gap-2">
          <Pressable className="rounded-sm border border-border bg-white px-4 py-2">
            <Text className="text-xs font-semibold text-text-brown">객관식</Text>
          </Pressable>
          <Pressable className="rounded-sm border border-border bg-white px-4 py-2">
            <Text className="text-xs font-semibold text-text-brown">문맥규정</Text>
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
            <Text className="mt-2 font-regular text-lg text-black">{currentQuestion.prompt}</Text>
            <Text className="mb-6 mt-5 font-regular text-lg text-black">
              {currentQuestion.sentence}
            </Text>

            {currentQuestion.options.map((option, idx) => {
              const selected = idx === selectedIndex;
              return (
                <View
                  key={`review-q${currentQuestionIndex + 1}-${option}`}
                  className={`mb-3 rounded-sm border px-[14px] py-4 ${selected ? 'border-[#D7CEBF] bg-[#E8E2D4]' : 'border-border bg-white'}`}
                >
                  <Text
                    className={`text-sm font-semibold ${selected ? 'text-gray' : 'text-[#2A2018]'}`}
                  >
                    {option}
                  </Text>
                </View>
              );
            })}

            <View className="mb-4 mt-2 h-px border-t border-dashed border-border" />

            <Text className="text-xs font-semibold text-text-brown">정답 해설</Text>
            <Text className="mt-2 text-sm font-semibold text-[#8C877D]">
              {currentQuestion.explanationTitle}
            </Text>

            <View className="mt-2">
              {currentQuestion.explanationOptions.map((item, idx) => {
                const isCorrect = idx === currentQuestion.correctIndex;
                return (
                  <Text
                    key={`explain-${currentQuestionIndex + 1}-${item}`}
                    className={`mt-[2px] text-sm font-semibold ${isCorrect ? 'text-[#059669]' : 'text-[#2A2018]'}`}
                  >
                    {item}
                  </Text>
                );
              })}
            </View>
          </View>

          <Pressable className="self-end rounded-xl border border-border bg-white px-5 py-2">
            <Text className="text-sm font-semibold text-[#2A2018]">북마크 ☆</Text>
          </Pressable>
        </ScrollView>

        <View className="pb-[18px]">
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
                {currentQuestionIndex === TOTAL_PROBLEM_COUNT - 1 ? '학습 종료하기' : '다음'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
