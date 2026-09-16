import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const resultCardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

function normalizeParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseNumberParam(value?: string | string[], fallback = 0) {
  const parsed = Number(normalizeParam(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getFallbackTitle(level: number) {
  if (level <= 2) return '기초 표현 입문자';
  if (level <= 4) return '기본 문장 학습자';
  if (level <= 6) return '문장 확장자';
  if (level <= 8) return '실전 독해자';
  return '고급 학습자';
}

function getFallbackDescription(level: number) {
  if (level <= 2) return '기초 단어와 짧은 표현부터 차근차근 시작하기 좋은 단계예요.';
  if (level <= 4) return '기본 문장을 읽고 핵심 의미를 파악할 수 있는 단계예요.';
  if (level <= 6) return '다양한 문형으로 의사 표현을 확장할 수 있는 단계예요.';
  if (level <= 8) return '조금 긴 문장과 실전 문제에 도전하기 좋은 단계예요.';
  return '고난도 표현과 독해를 학습해도 좋은 단계예요.';
}

export default function LevelAssignPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    score?: string | string[];
    correctCount?: string | string[];
    wrongCount?: string | string[];
    level?: string | string[];
    title?: string | string[];
    description?: string | string[];
  }>();

  const score = parseNumberParam(params.score);
  const correctCount = parseNumberParam(params.correctCount);
  const wrongCount = parseNumberParam(params.wrongCount);
  const level = parseNumberParam(params.level, 1);
  const totalScore = 100;
  const scorePercent = Math.max(0, Math.min(100, score));
  const title = normalizeParam(params.title) || getFallbackTitle(level);
  const description = normalizeParam(params.description) || getFallbackDescription(level);

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
          className="rounded-sm border border-border bg-white px-4 py-9"
          style={resultCardShadowStyle}
        >
          <View className="items-center">
            <Text className="font-regular text-base text-text-brown">레벨 테스트 완료! ✓</Text>
            <Text className="mt-2 font-regular text-sm text-text-brown">총 점수</Text>

            <View className="mt-3 flex-row items-end">
              <Text className="text-[44px] font-extrabold text-black">{score}</Text>
              <Text className="mb-1 ml-[1px] font-bold text-lg text-[#A09080]">/ {totalScore}</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between px-4">
            <View className="h-[3px] flex-1 bg-[#E0D8C8]">
              <View className="h-[3px] bg-gray" style={{ width: `${scorePercent}%` }} />
            </View>
          </View>
          <View className="mt-3 flex-row items-center justify-center gap-10">
            <Text className="font-bold text-sm text-[#059669]">✓ 정답 {correctCount}개</Text>
            <Text className="font-bold text-sm text-[#CC4444]">✗ 오답 {wrongCount}개</Text>
          </View>

          <View className="mt-5 h-px bg-border" />
          <View className="mt-4 items-center">
            <Text className="font-bold text-2xl text-black">Lv.{level}</Text>
            <Text className="mt-3 font-bold text-base text-gray">🧠 {title}</Text>
            <Text className="mt-2 text-center font-regular text-sm text-text-brown">
              {description}
            </Text>
          </View>
        </View>

        <View className="mt-[18px] flex-row gap-2 pt-5">
          <Pressable
            className="h-[43px] flex-1 items-center justify-center rounded-xl border border-border bg-white px-7 py-3"
            onPress={() => router.replace('/(app)/level/test-survey')}
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
