import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';
const GREEN_MID = '#A7F3D0';

const challenges = [
  { title: '하루 15분 학습', progress: '6/7일', pct: 0.86 },
  { title: '단어 10개 암기', progress: '4/14일', pct: 0.28 },
];

export default function ChallengePage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="챌린지 관리" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 총 달성 현황 */}
        <Text className="font-regular text-xs text-text-brown">총 달성 현황</Text>
        <View className="rounded-sm border border-border bg-white p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-x-2.5">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FEF3C7]">
                <Text style={{ fontSize: 20 }}>🔥</Text>
              </View>
              <View>
                <Text className="font-semiBold text-xl text-btn-dark">6일</Text>
                <Text className="font-regular text-xs text-text-brown">현재 연속 학습</Text>
              </View>
            </View>
            <Text className="font-semiBold text-3xl text-btn-dark">58%</Text>
          </View>
          <View className="mb-3 h-1 rounded-full bg-[#EDE8DE]">
            <View className="h-1 rounded-full" style={{ backgroundColor: GREEN, width: '58%' }} />
          </View>
          <View className="flex-row gap-x-2.5">
            <View className="flex-1 items-center rounded-sm border border-border bg-bg py-3">
              <Text className="font-semiBold text-xl text-btn-dark">2개</Text>
              <Text className="mt-0.5 font-regular text-xs text-text-brown">진행중</Text>
            </View>
            <View className="flex-1 items-center rounded-sm border border-border bg-bg py-3">
              <Text className="font-semiBold text-xl text-btn-dark">0개</Text>
              <Text className="mt-0.5 font-regular text-xs text-text-brown">완료일</Text>
            </View>
          </View>
        </View>

        {/* 진행 중인 챌린지 */}
        <Text className="font-regular text-xs text-text-brown">진행 중인 챌린지</Text>
        {challenges.map((c, i) => (
          <View key={i} className="rounded-sm border border-border bg-white p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-semiBold text-sm text-btn-dark">{c.title}</Text>
              <Text className="font-regular text-xs" style={{ color: GREEN }}>
                진행중
              </Text>
            </View>
            <View className="mb-1.5 h-0.5 rounded-full bg-[#EDE8DE]">
              <View
                className="h-0.5 rounded-full"
                style={{ backgroundColor: GREEN, width: `${c.pct * 100}%` }}
              />
            </View>
            <Text className="font-regular text-xs text-text-brown">{c.progress}</Text>
          </View>
        ))}

        {/* 챌린지 추가 버튼 */}
        <Pressable
          className="items-center rounded-sm border border-border bg-white py-4"
          onPress={() => router.push('/(app)/mypage/challenge/create-goal-select')}
        >
          <Text className="font-regular text-sm text-text-brown">+ 챌린지 추가</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
