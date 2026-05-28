import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const cardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function TodayProblemsPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="오늘의 학습" />

      <View className="flex-1 px-4 pt-4">
        <Text className="mb-[6px] text-xs text-text-brown">오늘의 학습 주제</Text>
        <View
          className="rounded-sm border border-border bg-white px-4 py-4 pb-4"
          style={cardShadowStyle}
        >
          <Text className="mt-2 text-base text-[#2A2018]">• 문자 / 어휘</Text>
          <Text className="mt-2 text-base text-[#2A2018]">• 문맥규정</Text>
          <Text className="mt-2 text-base text-[#2A2018]">• JLPT N5 기초 단어</Text>

          <View className="my-5 h-px bg-border" />

          <Text className="text-sm font-semibold text-text-brown">• 총 20문제</Text>
          <Text className="mt-2 text-sm font-semibold text-text-brown">• 예상 풀이 시간: 10분</Text>
        </View>

        <Pressable
          className="mt-4 h-[50px] items-center justify-center rounded-xl bg-btn-dark"
          onPress={() => router.push('/(app)/learning/problems/solve')}
        >
          <Text className="font-bold text-base text-white">시작하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
