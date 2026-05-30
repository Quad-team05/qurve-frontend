import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PROBLEM_QUESTIONS, serializeAnswers, TOTAL_PROBLEM_COUNT } from './questionData';

const questionCardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function SolveProblemPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedByQuestion, setSelectedByQuestion] = useState<(number | null)[]>(
    Array.from({ length: TOTAL_PROBLEM_COUNT }, () => null),
  );
  const [showStopModal, setShowStopModal] = useState(false);

  const currentQuestion = PROBLEM_QUESTIONS[currentQuestionIndex];
  const selectedIndex = selectedByQuestion[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / TOTAL_PROBLEM_COUNT) * 100;

  const handleSelectOption = (optionIndex: number) => {
    setSelectedByQuestion((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = optionIndex;
      return next;
    });
  };

  const handlePrev = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex === TOTAL_PROBLEM_COUNT - 1) {
      router.push({
        pathname: '/(app)/learning/problems/result',
        params: {
          answers: serializeAnswers(selectedByQuestion),
        },
      });
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleConfirmStop = () => {
    setShowStopModal(false);
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push('/(app)/learning/problems/today');
  };

  useFocusEffect(
    useCallback(() => {
      setCurrentQuestionIndex(0);
      setSelectedByQuestion(Array.from({ length: TOTAL_PROBLEM_COUNT }, () => null));
      setShowStopModal(false);
    }, []),
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="문제보기" onBackPress={() => setShowStopModal(true)} />

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
            className="mb-4 rounded-sm border border-border bg-white px-4 pb-4 pt-5"
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
                <Pressable
                  key={`q${currentQuestionIndex + 1}-${option}`}
                  onPress={() => handleSelectOption(idx)}
                  className={`mb-3 rounded-sm border px-[14px] py-4 ${selected ? 'border-[#D7CEBF] bg-[#E8E2D4]' : 'border-border bg-white'}`}
                >
                  <Text
                    className={`text-sm font-semibold ${selected ? 'text-gray' : 'text-[#2A2018]'}`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View className="pb-[18px]">
          <Text className="pb-[10px] text-sm font-semibold text-[#8C877D]">
            {currentQuestionIndex + 1} / {TOTAL_PROBLEM_COUNT}
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
            >
              <Text className="font-bold text-sm text-white">다음</Text>
            </Pressable>
          </View>
        </View>
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
