import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RESULT = {
  score: 73,
  total: 100,
  correct: 7,
  wrong: 3,
  level: 'Lv.6',
  title: '문장 확장자',
  description: '다양한 문형으로 의사 표현이 가능한 단계예요',
};

const resultCardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function LevelAssignPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="레벨 테스트" />

      <View className="flex-1 px-4 pb-4 pt-3">
        <View className="mb-3">
          <View className="mb-2 flex-row items-center justify-between px-1">
            <Text className="w-1/3 text-center text-xs font-semibold text-gray">설문</Text>
            <Text className="w-1/3 text-center text-xs font-semibold text-gray">레벨테스트</Text>
            <Text className="w-1/3 text-center text-xs font-semibold text-gray">결과</Text>
          </View>
          <View className="h-[3px] w-full bg-[#D8D2C7]">
            <View className="h-[3px] w-full bg-gray" />
          </View>
        </View>

        <View className="mx-auto mt-3 h-[10px] w-[50px] rounded-[1px] bg-[#C8E0D6]" />
        <View
          className="px-4pt-8 rounded-sm border border-border bg-white py-9"
          style={resultCardShadowStyle}
        >
          <View className="items-center">
            <Text className="text-text-brownfont-regular text-base">레벨 테스트 완료! ✓</Text>
            <Text className="mt-2 font-regular text-sm text-text-brown">총 점수</Text>

            <View className="mt-3 flex-row items-end">
              <Text className="text-[44px] font-extrabold text-black">{RESULT.score}</Text>
              <Text className="mb-1 ml-[1px] font-bold text-lg text-[#A09080]">
                / {RESULT.total}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between px-4">
            <View className="h-[3px] flex-1 bg-[#E0D8C8]">
              <View className="h-[3px] w-[70%] bg-gray" />
            </View>
          </View>
          <View className="mt-3 flex-row items-center justify-center gap-10">
            <Text className="font-bold text-sm text-[#059669]">✓ 정답 {RESULT.correct}개</Text>
            <Text className="font-bold text-sm text-[#CC4444]">✗ 오답 {RESULT.wrong}개</Text>
          </View>

          <View className="mt-5 h-px bg-border" />
          <View className="mt-4 items-center">
            <Text className="font-bold text-2xl text-black">{RESULT.level}</Text>
            <Text className="mt-3 font-bold text-base text-gray">🧠 {RESULT.title}</Text>
            <Text className="mt-2 text-center font-regular text-sm text-text-brown">
              {RESULT.description}
            </Text>
          </View>
        </View>

        <View className="mt-[18px] flex-row gap-2 pt-5">
          <Pressable
            className="h-[43px] flex-1 items-center justify-center rounded-xl border border-border bg-white px-7 py-3"
            onPress={() => router.replace('/(app)/level/test')}
          >
            <Text className="font-bold text-base text-[#3C322A]">테스트 다시보기</Text>
          </Pressable>

          <Pressable
            className="h-[43px] flex-1 items-center justify-center rounded-xl bg-btn-dark px-7 py-3"
            onPress={() => router.navigate('/(tabs)')}
          >
            <Text className="font-bold text-base text-white">학습 시작하기</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
