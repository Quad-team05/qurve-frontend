import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { getBadges } from '@/lib/api/badge';
import { getTodayXp, getXpStat, getXpWeekly, type XpDaily, type XpStat } from '@/lib/api/xp';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_MID = '#A7F3D0';
const BORDER = '#E0D8C8';
const TEXT = '#2A2018';
const TEXT3 = '#A09080';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

type XpDayDisplay = { day: string; xp: number; done: boolean; highlight: boolean };

// TODO: 이번 주 목표 조회 API 나오면 교체
const weeklyGoal = {
  status: '진행 중',
  currentMinutes: 200, // 3시간 20분
  targetMinutes: 300, // 5시간
};

function formatXpDaysForDisplay(weekly: XpDaily[]): XpDayDisplay[] {
  const maxXp = Math.max(0, ...weekly.map((d) => d.xpAmount));

  return weekly.map((d) => {
    const dayOfWeek = new Date(d.date).getDay();
    return {
      day: DAY_LABELS[dayOfWeek],
      xp: d.xpAmount,
      done: d.xpAmount > 0,
      highlight: maxXp > 0 && d.xpAmount === maxXp,
    };
  });
}

export default function ActivityPage() {
  const router = useRouter();

  const [xpStat, setXpStat] = useState<XpStat | null>(null);
  const [xpDays, setXpDays] = useState<XpDayDisplay[]>([]);
  const [todayXp, setTodayXp] = useState<number | null>(null);
  const [badgeAchievedCount, setBadgeAchievedCount] = useState<number | null>(null);
  const [badgeTotalCount, setBadgeTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [stat, weekly, today, badgeList] = await Promise.all([
          getXpStat(),
          getXpWeekly(),
          getTodayXp(),
          getBadges(),
        ]);

        setXpStat(stat);
        setXpDays(formatXpDaysForDisplay(weekly));
        setTodayXp(today.totalXp);
        setBadgeAchievedCount(badgeList.achievedCount);
        setBadgeTotalCount(badgeList.totalCount);
      } catch (error) {
        // TODO: 에러 토스트/재시도 처리
        console.error('활동 데이터를 불러오지 못했습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const weeklyPercent = Math.round((weeklyGoal.currentMinutes / weeklyGoal.targetMinutes) * 100);
  const weeklyCurrentLabel = `${Math.floor(weeklyGoal.currentMinutes / 60)}시간 ${weeklyGoal.currentMinutes % 60}분`;
  const weeklyTargetLabel = `${Math.floor(weeklyGoal.targetMinutes / 60)}시간`;

  const levelProgressPercent =
    xpStat && xpStat.nextLevelXp > xpStat.currentLevelXp
      ? Math.min(
          100,
          Math.round(
            ((xpStat.totalXp - xpStat.currentLevelXp) /
              (xpStat.nextLevelXp - xpStat.currentLevelXp)) *
              100,
          ),
        )
      : 0;

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
                <Text className="font-regular text-xs text-text-brown">
                  {isLoading ? '불러오는 중...' : `Lv.${xpStat?.currentLevel ?? '-'}`}
                </Text>
                <Text className="font-semiBold text-base text-btn-dark">
                  {isLoading ? '-' : (xpStat?.title ?? '-')}
                </Text>
              </View>
            </View>
            <View className="h-1.5 rounded-full bg-[#EDE8DE]">
              <View
                className="h-1.5 rounded-full"
                style={{ backgroundColor: GREEN, width: `${levelProgressPercent}%` }}
              />
            </View>
            <View className="mt-1.5 flex-row justify-between">
              <Text className="font-regular text-[10px] text-text-brown">
                {isLoading
                  ? '- / -'
                  : `${xpStat?.totalXp.toLocaleString() ?? '-'} / ${xpStat?.nextLevelXp.toLocaleString() ?? '-'} XP`}
              </Text>
              <Text className="font-regular text-[10px] text-text-brown">
                {isLoading
                  ? '-'
                  : `다음 레벨까지 ${xpStat?.xpToNextLevel.toLocaleString() ?? '-'} XP`}
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
                <Text style={{ fontSize: 10, color: TEXT3 }}>
                  {isLoading
                    ? '-'
                    : `${badgeAchievedCount ?? '-'}개 달성 / ${badgeTotalCount ?? '-'}개`}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: GREEN }}>보러가기 →</Text>
          </Pressable>
        </View>

        {/* ② 상세 현황 */}
        <Text className="font-regular text-xs text-text-brown">② 상세 현황</Text>
        <View className="flex-row flex-wrap gap-2.5">
          {[
            {
              label: '누적 XP',
              value: isLoading ? '-' : `${xpStat?.totalXp.toLocaleString() ?? '-'} XP`,
            },
            { label: '현재 레벨', value: isLoading ? '-' : `Lv.${xpStat?.currentLevel ?? '-'}` },
            {
              label: '다음 레벨까지',
              value: isLoading ? '-' : `${xpStat?.xpToNextLevel.toLocaleString() ?? '-'} XP`,
            },
            { label: '연속 학습', value: isLoading ? '-' : `${xpStat?.streakDays ?? '-'}일` },
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

        {/* ③ 오늘 획득 XP */}
        <Text className="font-regular text-xs text-text-brown">③ 오늘 획득 XP</Text>
        <View className="rounded-sm border border-border bg-white p-4">
          <Text className="font-semiBold mb-1 text-sm text-btn-dark">오늘 획득 XP</Text>
          <Text className="mb-2.5 font-regular text-xs text-text-brown">
            오늘 학습으로 획득한 XP예요!
          </Text>
          <Text className="font-semiBold text-2xl text-btn-dark">
            {isLoading ? '-' : `+${todayXp ?? 0} XP`}
          </Text>
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
            {(isLoading ? [] : xpDays).map((d, i) => (
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
