import Text from '@/components/ui/AppText';
import { ApiError } from '@/lib/api/client';
import { getStudyTimeStatistics, type StudyTimeStatistics } from '@/lib/api/learning';
import {
  getProblemAccuracy,
  getProblemAccuracyTrend,
  type ProblemAccuracy,
  type ProblemAccuracyTrend,
} from '@/lib/api/problem';
import { getMyProfile, type UserProfile } from '@/lib/api/user';
import { clearAuthSession } from '@/lib/auth/session';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  ToastAndroid,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

const ACCENT = '#6B7280';
const TEXT = '#2A2018';
const TEXT3 = '#A09080';
const PURPLE = '#9333EA';
const W = Dimensions.get('window').width - 64;

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

type TrendPoint = { label: string; val: number };

const LineChart = ({ data }: { data: TrendPoint[] }) => {
  const w = W;
  const h = 120;
  const pt = 20;
  const pb = 20;
  const pl = 10;
  const pr = 10;
  const innerH = h - pt - pb;
  const innerW = w - pl - pr;
  const values = data.map((d) => d.val);
  const min = values.length > 0 ? Math.min(...values, 0) : 0;
  const max = values.length > 0 ? Math.max(...values, 100) : 100;
  const denom = max - min === 0 ? 1 : max - min;

  const gx = (i: number) => pl + (data.length <= 1 ? 0 : (i / (data.length - 1)) * innerW);
  const gy = (v: number) => pt + (1 - (v - min) / denom) * innerH;

  const pts = data.map((d, i) => ({ x: gx(i), y: gy(d.val), v: d.val, l: d.label }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  if (data.length === 0) {
    return (
      <View style={{ height: h, alignItems: 'center', justifyContent: 'center' }}>
        <Text className="text-xs text-text-brown">데이터가 없어요</Text>
      </View>
    );
  }

  return (
    <Svg width={w} height={h}>
      <Path d={path} fill="none" stroke={PURPLE} strokeWidth={1.5} />
      {pts.map((p, i) => (
        <React.Fragment key={i}>
          <Circle cx={p.x} cy={p.y} r={4} fill="white" stroke={PURPLE} strokeWidth={1.5} />
          <SvgText
            x={p.x}
            y={p.y - 10}
            textAnchor={i === pts.length - 1 ? 'end' : 'middle'}
            fontSize={9}
            fill={TEXT3}
          >
            {p.v}%
          </SvgText>
          <SvgText x={p.x} y={h - 4} textAnchor="middle" fontSize={9} fill={TEXT3}>
            {p.l}
          </SvgText>
        </React.Fragment>
      ))}
    </Svg>
  );
};

export default function ProgressTab() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const tabs = ['일별', '월별', '전체'];

  const [studyStats, setStudyStats] = useState<StudyTimeStatistics | null>(null);
  const [isStudyStatsLoading, setIsStudyStatsLoading] = useState(true);

  const [accuracy, setAccuracy] = useState<ProblemAccuracy | null>(null);
  const [accuracyTrend, setAccuracyTrend] = useState<ProblemAccuracyTrend | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsProfileLoading(true);
        const result = await getMyProfile();
        setProfile(result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearAuthSession();
          router.replace('/(app)/auth/login');
          return;
        }

        showToast('회원 정보를 불러오지 못했습니다.');
      } finally {
        setIsProfileLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  useEffect(() => {
    const loadStudyStats = async () => {
      try {
        setIsStudyStatsLoading(true);
        const result = await getStudyTimeStatistics();
        setStudyStats(result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearAuthSession();
          router.replace('/(app)/auth/login');
          return;
        }

        showToast('학습 시간 통계를 불러오지 못했습니다.');
      } finally {
        setIsStudyStatsLoading(false);
      }
    };

    void loadStudyStats();
  }, [router]);

  useEffect(() => {
    const loadAccuracy = async () => {
      try {
        const result = await getProblemAccuracy();
        setAccuracy(result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearAuthSession();
          router.replace('/(app)/auth/login');
          return;
        }
        // 정답률은 핵심 흐름이 아니므로 조용히 실패 처리
      }
    };

    void loadAccuracy();
  }, [router]);

  useEffect(() => {
    const loadTrend = async () => {
      try {
        const result = await getProblemAccuracyTrend();
        setAccuracyTrend(result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearAuthSession();
          router.replace('/(app)/auth/login');
          return;
        }
        // 성장 그래프도 핵심 흐름이 아니므로 조용히 실패 처리
      }
    };

    void loadTrend();
  }, [router]);

  const maxDailyMinutes =
    studyStats && studyStats.dailyStudyTimes.length > 0
      ? Math.max(...studyStats.dailyStudyTimes.map((d) => d.studyTimeMinutes), 1)
      : 1;

  const weeklyGoalMinutes = 420; // TODO: 주간 학습시간 목표 API 확인 필요
  const weeklyProgressPercent = studyStats
    ? Math.min(100, Math.round((studyStats.weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100))
    : 0;
  const todayGoalMinutes = 60; // TODO: 일일 학습시간 목표 API 확인 필요
  const todayProgressPercent = studyStats
    ? Math.min(100, Math.round((studyStats.todayStudyTimeMinutes / todayGoalMinutes) * 100))
    : 0;

  const trendPoints: TrendPoint[] =
    accuracyTrend?.dailyAccuracies.map((d) => ({
      label: d.dayLabel,
      val: d.accuracyRate,
    })) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="border-b border-border bg-bg px-4 pb-3 pt-2">
        <Text className="font-regular text-xs text-text-brown">Lv.1 일본어 고수 꿈나무 🌱</Text>
        <Text className="font-semiBold mb-2.5 text-xl text-btn-dark">
          {isProfileLoading ? '불러오는 중...' : `${profile?.name ?? '-'} 님`}
        </Text>
        <View className="flex-row gap-x-2">
          {tabs.map((t, i) => (
            <Pressable
              key={i}
              className="rounded-sm border border-border px-4 py-1.5"
              style={{ backgroundColor: activeTab === i ? '#2A2018' : '#fff' }}
              onPress={() => setActiveTab(i)}
            >
              <Text className="text-xs" style={{ color: activeTab === i ? '#fff' : '#A09080' }}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-3.5"
        showsVerticalScrollIndicator={false}
      >
        {/* 막대 그래프 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#B8D4F0] opacity-80" />
          <View className="w-full rounded-sm border border-border bg-white p-4 pt-5">
            <Text className="mb-3 font-regular text-xs text-text-brown">
              이번 주 학습 시간 (분)
            </Text>
            {isStudyStatsLoading ? (
              <Text className="text-xs text-text-brown">불러오는 중...</Text>
            ) : (
              <View className="flex-row items-end gap-x-1.5" style={{ height: 80 }}>
                {(studyStats?.dailyStudyTimes ?? []).map((d, i) => {
                  const isWeekend = d.dayOfWeek === 'SAT' || d.dayOfWeek === 'SUN';
                  const barHeight = Math.max(4, (d.studyTimeMinutes / maxDailyMinutes) * 60);
                  return (
                    <View key={`${d.dayOfWeek}-${i}`} className="flex-1 items-center">
                      <Text
                        className="mb-1 text-center font-regular"
                        style={{ fontSize: 9, color: isWeekend ? TEXT3 : TEXT }}
                      >
                        {d.studyTimeMinutes}분
                      </Text>
                      <View
                        style={{
                          width: '100%',
                          height: barHeight,
                          backgroundColor: isWeekend ? '#E0D8C8' : ACCENT,
                          borderRadius: 2,
                        }}
                      />
                      <Text
                        className="mt-1 text-center font-regular"
                        style={{ fontSize: 9, color: TEXT3 }}
                      >
                        {d.dayLabel}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* 스탯 2개 */}
        <View className="flex-row gap-x-3">
          <View className="relative flex-1 items-center pt-2">
            <View className="absolute right-3 top-0 z-10 h-[11px] w-6 rounded-sm bg-[#FFE566] opacity-80" />
            <View className="w-full rounded-sm bg-[#FEF3C7] p-3">
              <Text className="font-regular text-xs text-text-brown">오늘 학습 시간</Text>
              <Text className="font-semiBold text-2xl text-btn-dark">
                {isStudyStatsLoading ? '-' : `${studyStats?.todayStudyTimeMinutes ?? 0}분`}
              </Text>
              <View className="mt-2 h-0.5 rounded-full bg-black/10">
                <View
                  className="h-0.5 rounded-full bg-[#D97706]"
                  style={{ width: `${todayProgressPercent}%` as `${number}%` }}
                />
              </View>
            </View>
          </View>
          <View className="relative flex-1 items-center pt-2">
            <View className="absolute left-3 top-0 z-10 h-[11px] w-6 rounded-sm bg-[#B8E8C0] opacity-80" />
            <View className="w-full rounded-sm bg-[#D1FAE5] p-3">
              <Text className="font-regular text-xs text-text-brown">이번 주 학습</Text>
              <Text className="font-semiBold text-2xl text-btn-dark">
                {isStudyStatsLoading ? '-' : `${studyStats?.weeklyStudyTimeMinutes ?? 0}분`}
              </Text>
              <View className="mt-2 h-0.5 rounded-full bg-black/10">
                <View
                  className="h-0.5 rounded-full bg-[#059669]"
                  style={{ width: `${weeklyProgressPercent}%` as `${number}%` }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 평균 정답률 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#B8E8C0] opacity-80" />
          <View className="w-full rounded-sm border border-border bg-white p-4 pt-5">
            <Text className="mb-1.5 font-regular text-xs text-text-brown">평균 정답률</Text>
            <Text className="font-semiBold text-4xl text-btn-dark">
              {accuracy ? `${accuracy.accuracyRate}%` : '-'}
            </Text>
            <View className="mt-2.5 h-0.5 rounded-full bg-border">
              <View
                className="h-0.5 rounded-full bg-[#6B7280]"
                style={{ width: `${accuracy?.accuracyRate ?? 0}%` as `${number}%` }}
              />
            </View>
            <Text className="mt-2 font-regular text-xs text-text-brown">
              {accuracy
                ? `${accuracy.correctSubmissionCount}/${accuracy.totalSubmissionCount}문제 정답`
                : ''}
            </Text>
          </View>
        </View>

        {/* 꺾은선 그래프 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#FFE566] opacity-80" />
          <View className="w-full rounded-sm border border-border bg-white p-4 pt-5">
            <Text className="mb-3 font-regular text-xs text-text-brown">
              {isProfileLoading ? '성장 그래프' : `${profile?.name ?? '-'} 님의 성장 그래프`}
            </Text>
            <LineChart data={trendPoints} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
