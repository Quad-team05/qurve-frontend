import Text from '@/components/ui/AppText';
import { getPreQuestions, type PreQuestion } from '@/lib/api/level';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LevelTestSurveyPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PreQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // questionId -> optionId
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const result = await getPreQuestions();
        setQuestions(result.questions);
      } catch (error) {
        console.error('사전 질문을 불러오지 못했습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadQuestions();
  }, []);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions === 0 ? 0 : (answeredCount / totalQuestions) * 100;
  const canStartTest = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleSelect = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleStart = () => {
    if (!canStartTest) return;

    // 백엔드는 pre1Answer, pre2Answer, pre3Answer 3개 슬롯을 요구함
    const answerValues = questions.map((q) => answers[q.questionId]);

    router.push({
      pathname: '/(app)/level/test',
      params: {
        pre1Answer: String(answerValues[0] ?? ''),
        pre2Answer: String(answerValues[1] ?? ''),
        pre3Answer: String(answerValues[2] ?? ''),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="border-b border-border bg-bg px-4 pb-3 pt-0">
        <View className="h-12 items-center justify-center">
          <Text className="font-bold text-[16px] text-black">레벨 테스트</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-3 pb-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between px-1">
            <Text className="w-1/3 text-center text-xs font-semibold text-gray">설문</Text>
            <Text className="w-1/3 text-center text-xs font-semibold text-text-brown">
              레벨테스트
            </Text>
            <Text className="w-1/3 text-center text-xs font-semibold text-text-brown">결과</Text>
          </View>
          <View className="h-[3px] w-full bg-[#D8D2C7]">
            <View className="h-[3px] w-1/3 bg-[#6F7486]" />
          </View>
        </View>

        <View className="mb-[10px] rounded-xl border border-[#C8E0D6] bg-[#F2F9EE] px-4 pb-6 pt-4">
          <View className="flex-row items-center">
            <Text className="mb-5 mr-[10px] text-[28px]">📚</Text>
            <View>
              <Text className="font-bold text-base text-gray">맞춤 레벨 진단을 위해</Text>
              <Text className="mt-[2px] font-bold text-base text-gray">
                간단한 설문을 진행할게요.
              </Text>
              <Text className="mb-[14px] mt-1 text-xs font-medium text-gray">
                {totalQuestions}가지 질문으로 시작해요
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="mr-3 h-[3px] flex-1 bg-white">
              <View className="h-[3px] bg-[#059669]" style={{ width: `${progressPercent}%` }} />
            </View>
            <Text className="text-sm font-semibold text-[#A09A8D]">
              {answeredCount}/{totalQuestions}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <Text className="text-sm text-text-brown">불러오는 중...</Text>
        ) : (
          questions.map((q, qIndex) => (
            <View key={q.questionId}>
              <Text className="mb-[10px] text-sm font-semibold text-black">
                <Text className="text-sm text-gray">Q{qIndex + 1} </Text>
                {q.question}
              </Text>

              {q.options.map((option) => {
                const selected = answers[q.questionId] === option.optionId;
                return (
                  <TouchableOpacity
                    key={`q${q.questionId}-${option.optionId}`}
                    onPress={() => handleSelect(q.questionId, option.optionId)}
                    style={{
                      marginBottom: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: 4,
                      borderWidth: 1,
                      paddingHorizontal: 12,
                      paddingVertical: 16,
                      borderColor: selected ? '#C8E0D6' : '#E0D8C8',
                      backgroundColor: selected ? '#F2F9EE' : '#fff',
                    }}
                  >
                    <View
                      style={{
                        marginRight: 8,
                        height: 18,
                        width: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 9,
                        borderWidth: 1,
                        borderColor: selected ? '#E0D8C8' : '#E4E4E4',
                      }}
                    >
                      {selected ? (
                        <View
                          style={{
                            height: 10,
                            width: 10,
                            borderRadius: 5,
                            backgroundColor: '#059669',
                          }}
                        />
                      ) : null}
                    </View>
                    <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#6B7280' }}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingBottom: 60, paddingTop: 12 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            backgroundColor: canStartTest ? '#2A2018' : '#B9B2A7',
          }}
          onPress={handleStart}
          disabled={!canStartTest}
        >
          <Text style={{ fontSize: 16, color: '#fff' }}>레벨 테스트 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
