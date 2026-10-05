import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import type { LevelTestQuestionResult } from '@/lib/api/level';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ReviewFilter = 'ALL' | 'WRONG';

function normalizeParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseQuestionResults(value?: string | string[]) {
  const serialized = normalizeParam(value);
  if (!serialized) return [];

  try {
    const parsed = JSON.parse(serialized) as unknown;
    return Array.isArray(parsed) ? (parsed as LevelTestQuestionResult[]) : [];
  } catch {
    return [];
  }
}

export default function LevelTestReviewPage() {
  const params = useLocalSearchParams<{ questionResults?: string | string[] }>();
  const [filter, setFilter] = useState<ReviewFilter>('ALL');
  const results = useMemo(
    () => parseQuestionResults(params.questionResults),
    [params.questionResults],
  );
  const visibleResults = useMemo(() => {
    const numberedResults = results.map((result, index) => ({ result, questionNumber: index + 1 }));
    return filter === 'WRONG'
      ? numberedResults.filter(({ result }) => !result.correct)
      : numberedResults;
  }, [filter, results]);
  const wrongCount = results.filter((result) => !result.correct).length;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="정답/오답 확인" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 flex-row gap-x-2">
          <Pressable
            className={`min-h-[42px] flex-1 items-center justify-center rounded-sm border ${
              filter === 'ALL' ? 'border-btn-dark bg-btn-dark' : 'border-border bg-white'
            }`}
            onPress={() => setFilter('ALL')}
          >
            <Text
              className={`font-semiBold text-sm ${filter === 'ALL' ? 'text-white' : 'text-text-brown'}`}
            >
              전체 {results.length}
            </Text>
          </Pressable>
          <Pressable
            className={`min-h-[42px] flex-1 items-center justify-center rounded-sm border ${
              filter === 'WRONG' ? 'border-btn-dark bg-btn-dark' : 'border-border bg-white'
            }`}
            onPress={() => setFilter('WRONG')}
          >
            <Text
              className={`font-semiBold text-sm ${filter === 'WRONG' ? 'text-white' : 'text-text-brown'}`}
            >
              오답 {wrongCount}
            </Text>
          </Pressable>
        </View>

        {visibleResults.length === 0 ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="text-center font-regular text-sm text-text-brown">
              {results.length === 0 ? '채점 결과를 확인할 수 없습니다.' : '틀린 문제가 없습니다.'}
            </Text>
          </View>
        ) : (
          visibleResults.map(({ result, questionNumber }) => (
            <View
              key={result.questionId}
              className="mb-3 rounded-sm border border-border bg-white p-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-xs text-[#A09080]">Q{questionNumber}</Text>
                <View
                  className={`rounded-sm px-2.5 py-1 ${result.correct ? 'bg-[#E1F5EE]' : 'bg-[#FCE8E8]'}`}
                >
                  <Text
                    className={`font-semiBold text-xs ${result.correct ? 'text-[#0F6E56]' : 'text-[#B64242]'}`}
                  >
                    {result.correct ? '정답' : '오답'}
                  </Text>
                </View>
              </View>

              <Text className="mt-3 font-regular text-base text-btn-dark">
                {result.questionText}
              </Text>
              <Text className="mt-1 font-regular text-xs text-[#A09080]">
                난이도 {result.difficulty}
              </Text>

              <View
                className={`mt-4 rounded-sm border px-3 py-3 ${
                  result.correct ? 'border-[#B9DFD2] bg-[#F3FAF7]' : 'border-[#EDCACA] bg-[#FFF7F7]'
                }`}
              >
                <Text className="font-semiBold text-xs text-text-brown">내가 선택한 답</Text>
                <Text className="mt-1 font-regular text-sm text-btn-dark">
                  {result.selectedOptionId}. {result.selectedOptionText}
                </Text>
              </View>

              {!result.correct ? (
                <View className="mt-2 rounded-sm border border-[#B9DFD2] bg-[#F3FAF7] px-3 py-3">
                  <Text className="font-semiBold text-xs text-[#0F6E56]">정답</Text>
                  <Text className="mt-1 font-regular text-sm text-btn-dark">
                    {result.correctOptionId}. {result.correctOptionText}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
