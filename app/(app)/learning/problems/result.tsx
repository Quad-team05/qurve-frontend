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

export default function LearningResultPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="결과보기" showBackButton={false} />

      <View className="flex-1 px-4 pt-4">
        <Text className="mb-[6px] text-xs text-text-brown">오늘의 학습 결과</Text>
        <View
          className="rounded-sm border border-border bg-white px-4 py-4 pb-4"
          style={cardShadowStyle}
        >
          <Text className="mt-2 font-regular text-base text-[#2A2018]">• 총 20문제</Text>
          <Text className="mt-2 font-regular text-base text-[#2A2018]">• 풀이 시간: 15분</Text>

          <View className="my-5 h-px bg-border" />

          <Text className="font-regular text-sm text-[#059669]">• 맞은 문제: 13개</Text>
          <Text className="mt-2 font-regular text-sm text-[#CC4444]">• 틀린 문제: 7개</Text>
        </View>

        <Pressable
          className="mt-4 h-[50px] items-center justify-center rounded-xl bg-btn-dark"
          onPress={() => router.push('/(app)/learning/wrong-note/list')}
        >
          <Text className="font-bold text-base text-white">정답 확인하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
