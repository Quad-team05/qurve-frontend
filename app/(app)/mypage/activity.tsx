import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_MID = '#A7F3D0';
const BORDER = '#E0D8C8';
const TEXT = '#2A2018';
const TEXT3 = '#A09080';

const xpDays = [
  { day: '월', xp: 80, done: true },
  { day: '화', xp: 60, done: true },
  { day: '수', xp: 120, done: true, highlight: true },
  { day: '목', xp: 70, done: true },
  { day: '금', xp: 90, done: true },
  { day: '토', xp: 0, done: false },
  { day: '일', xp: 0, done: false },
];

// TODO: 서버 API 연동 전까지 목데이터
const weeklyGoal = {
  status: '진행 중',
  currentMinutes: 200, // 3시간 20분
  targetMinutes: 300, // 5시간
};

export default function ActivityPage() {
  const router = useRouter();

  const weeklyPercent = Math.round((weeklyGoal.currentMinutes / weeklyGoal.targetMinutes) * 100);
  const weeklyCurrentLabel = `${Math.floor(weeklyGoal.currentMinutes / 60)}시간 ${weeklyGoal.currentMinutes % 60}분`;
  const weeklyTargetLabel = `${Math.floor(weeklyGoal.targetMinutes / 60)}시간`;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="내 활동" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-3"
        showsVerticalScrollIndicator={false}
      >
        {/* ① 현재 레벨 */}
        <Text className="font-regular text-xs text-text-brown">① 현재 레벨</Text>
        <View className="overflow-hidden rounded-lg border border-border bg-white">
          <View className="p-4">
            <View className="mb-3 flex-row items-center gap-x-2.5">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: GREEN_LIGHT,
                  borderWidth: 1,
                  borderColor: GREEN_MID,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>🌳</Text>
              </View>
              <View>
                <Text className="font-regular text-xs text-text-brown">Lv.18</Text>
                <Text className="font-semiBold text-base text-btn-dark">독해 학습자</Text>
              </View>
            </View>
            <View className="h-1.5 rounded-full bg-[#EDE8DE]">
              <View className="h-1.5 w-[73%] rounded-full" style={{ backgroundColor: GREEN }} />
            </View>
            <View className="mt-1.5 flex-row justify-between">
              <Text className="font-regular text-[10px] text-text-brown">10,300 / 11,700 XP</Text>
              <Text className="font-regular text-[10px] text-text-brown">
                다음 레벨까지 1,400 XP
              </Text>
            </View>
          </View>

          {/* 배지 버튼 */}
          <Pressable
            style={{
              borderTopWidth: 1,
              borderTopColor: BORDER,
              backgroundColor: GREEN_LIGHT,
              paddingHorizontal: 16,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onPress={() => router.push('/(app)/mypage/badge')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>🏅</Text>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: GREEN }}>나의 배지</Text>
                <Text style={{ fontSize: 10, color: TEXT3 }}>10개 달성 / 48개</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: GREEN }}>보러가기 →</Text>
          </Pressable>
        </View>

        {/* ② 상세 현황 */}
        <Text className="font-regular text-xs text-text-brown">② 상세 현황</Text>
        <View className="flex-row flex-wrap gap-2.5">
          {[
            { label: '누적 XP', value: '10,300 XP' },
            { label: '현재 레벨', value: 'Lv.18' },
            { label: '다음 레벨까지', value: '1,400 XP' },
            { label: '연속 학습', value: '14일' },
          ].map((item, i) => (
            <View
              key={i}
              style={{
                width: '47%',
                backgroundColor: '#fff',
                borderWidth: 0.5,
                borderColor: BORDER,
                borderRadius: 6,
                padding: 12,
              }}
            >
              <Text className="font-regular text-[10px] text-text-brown">{item.label}</Text>
              <Text className="font-semiBold text-base text-btn-dark">{item.value}</Text>
            </View>
          ))}
        </View>

        {/* ③ 일일 목표 */}
        <Text className="font-regular text-xs text-text-brown">③ 일일 목표</Text>
        <View className="rounded-sm border border-border bg-white p-4">
          <Text className="font-semiBold mb-1 text-sm text-btn-dark">일일 목표</Text>
          <Text className="mb-2.5 font-regular text-xs text-text-brown">
            일일 목표 달성 시 보너스 XP를 획득해요!
          </Text>
          <View className="h-1 rounded-full bg-[#EDE8DE]">
            <View className="h-1 w-[60%] rounded-full" style={{ backgroundColor: GREEN }} />
          </View>
          <Text className="mt-1.5 font-regular text-[10px] text-text-brown">48분 / 1일</Text>
        </View>

        {/* ④ 이번 주 목표 */}
        <Text className="font-regular text-xs text-text-brown">④ 이번 주 목표</Text>
        <View className="rounded-sm border border-border bg-white p-4">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-semiBold text-sm text-btn-dark">이번 주 목표</Text>
            <View
              style={{
                backgroundColor: GREEN_LIGHT,
                borderWidth: 0.5,
                borderColor: GREEN_MID,
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ fontSize: 11, color: GREEN }}>{weeklyGoal.status}</Text>
            </View>
          </View>
          <Text className="mb-2.5 font-regular text-xs text-text-brown">
            이번 주 학습시간 목표를 채워보세요!
          </Text>
          <View className="h-1 rounded-full bg-[#EDE8DE]">
            <View
              className="h-1 rounded-full"
              style={{ backgroundColor: GREEN, width: `${weeklyPercent}%` }}
            />
          </View>
          <View className="mt-1.5 flex-row justify-between">
            <Text className="font-regular text-[10px] text-text-brown">
              {weeklyCurrentLabel} / {weeklyTargetLabel}
            </Text>
            <Text className="font-regular text-[10px]" style={{ color: GREEN }}>
              {weeklyPercent}%
            </Text>
          </View>
        </View>

        {/* ⑤ XP 획득 기록 */}
        <View className="flex-row items-center justify-between">
          <Text className="font-regular text-xs text-text-brown">⑤ XP 획득 기록 (이번 주)</Text>
          <Pressable onPress={() => router.push('/(app)/mypage/xp-history')}>
            <Text className="font-regular text-xs" style={{ color: GREEN }}>
              전체 보기 &gt;
            </Text>
          </Pressable>
        </View>
        <View className="rounded-sm border border-border bg-white p-4">
          <View className="flex-row justify-between">
            {xpDays.map((d, i) => (
              <View key={i} className="items-center gap-y-1">
                <Text style={{ fontSize: 10, fontWeight: '600', color: d.done ? TEXT : TEXT3 }}>
                  {d.done ? `+${d.xp}` : '-'}
                </Text>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: d.done ? (d.highlight ? '#FF6B6B' : GREEN) : '#EDE8DE',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: d.done ? '#fff' : TEXT3 }}>{d.day}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ⑥ 레벨 가이드 */}
        <Pressable
          className="flex-row items-center justify-between rounded-sm border border-border bg-white px-4 py-4"
          onPress={() => router.push('/(app)/mypage/level-guide')}
        >
          <Text className="font-semiBold text-sm text-btn-dark">레벨 가이드</Text>
          <Text className="font-regular text-sm text-text-brown">›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
