import Text from '@/components/ui/AppText';
import { getMyProfile, type UserProfile } from '@/lib/api/user';
import {
  getMonthlyStudyTimeStatistics,
  getStudyTimeStatistics,
  type MonthlyStudyTimeStatistics,
  type StudyTimeStatistics,
} from '@/lib/api/learning';
import {
  getProblemAccuracy,
  getProblemAccuracyTrend,
  type ProblemAccuracy,
  type ProblemAccuracyTrend,
} from '@/lib/api/problem';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

type MonthOption = {
  key: string;
  label: string;
  fullLabel: string;
};

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}분`;

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  return restMinutes > 0 ? `${hours}시간 ${restMinutes}분` : `${hours}시간`;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseProfileCreatedDate(createdAt?: string) {
  if (!createdAt) return null;

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) return null;

  return createdDate;
}

function formatMonthOption(date: Date): MonthOption {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return {
    key: `${year}-${String(month).padStart(2, '0')}`,
    label: `${month}월`,
    fullLabel: `${year}년 ${month}월`,
  };
}

function formatYearMonthLabel(yearMonth: string) {
  const [year, month] = yearMonth.split('-').map(Number);

  if (!year || !month) return yearMonth;

  return `${month}월`;
}

function formatYearMonthFullLabel(yearMonth: string) {
  const [year, month] = yearMonth.split('-').map(Number);

  if (!year || !month) return yearMonth;

  return `${year}년 ${month}월`;
}

function getRecentMonthOptions(createdAt?: string) {
  const now = new Date();
  const currentMonth = toMonthStart(now);
  const signupMonth = parseProfileCreatedDate(createdAt);
  const minMonth = signupMonth ? toMonthStart(signupMonth) : null;

  return Array.from({ length: 3 }, (_, index) => {
    const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - index, 1);
    return monthDate;
  })
    .filter((monthDate) => !minMonth || monthDate >= minMonth)
    .map(formatMonthOption);
}

const LineChart = ({ data }: { data: { label: string; val: number }[] }) => {
  const w = W;
  const h = 120;
  const pt = 20; // paddingTop
  const pb = 20; // paddingBottom
  const pl = 10; // paddingLeft
  const pr = 10; // paddingRight
  const innerH = h - pt - pb;
  const innerW = w - pl - pr;
  const min = 0;
  const max = 100;

  const gx = (i: number) => pl + (i / Math.max(data.length - 1, 1)) * innerW;
  const gy = (v: number) => pt + (1 - (v - min) / (max - min)) * innerH;

  const pts = data.map((d, i) => ({ x: gx(i), y: gy(d.val), v: d.val, l: d.label }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <Svg width={w} height={h}>
      <Path d={path} fill="none" stroke={PURPLE} strokeWidth={1.5} />
      {pts.map((p, i) => (
        <React.Fragment key={i}>
          <Circle cx={p.x} cy={p.y} r={4} fill="white" stroke={PURPLE} strokeWidth={1.5} />
          <SvgText
            x={p.x}
            y={p.y - 10}
            textAnchor={i === data.length - 1 ? 'end' : 'middle'}
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
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studyTimeStats, setStudyTimeStats] = useState<StudyTimeStatistics | null>(null);
  const [monthlyStudyTimeStats, setMonthlyStudyTimeStats] =
    useState<MonthlyStudyTimeStatistics | null>(null);
  const [problemAccuracy, setProblemAccuracy] = useState<ProblemAccuracy | null>(null);
  const [accuracyTrend, setAccuracyTrend] = useState<ProblemAccuracyTrend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const tabs = ['일별', '월별'];

  const loadAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasLoadError(false);
      const [profileResult, studyTimeResult, monthlyStudyTimeResult, accuracyResult, trendResult] =
        await Promise.all([
          getMyProfile(),
          getStudyTimeStatistics(),
          getMonthlyStudyTimeStatistics(),
          getProblemAccuracy(),
          getProblemAccuracyTrend(),
        ]);

      setProfile(profileResult);
      setStudyTimeStats(studyTimeResult);
      setMonthlyStudyTimeStats(monthlyStudyTimeResult);
      setProblemAccuracy(accuracyResult);
      setAccuracyTrend(trendResult);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }

      setHasLoadError(true);
      showToast('학습 분석 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadAnalysis();
  }, [loadAnalysis]);

  const dailyStudyTimes = studyTimeStats?.dailyStudyTimes ?? [];
  const monthlyOptions = useMemo(() => getRecentMonthOptions(profile?.createdAt), [profile]);
  const monthlyOptionKeys = useMemo(
    () => new Set(monthlyOptions.map((month) => month.key)),
    [monthlyOptions],
  );
  const monthlyStudyTimes = useMemo(
    () =>
      (monthlyStudyTimeStats?.monthlyStudyTimes ?? [])
        .filter((month) => monthlyOptionKeys.has(month.yearMonth))
        .map((month) => ({
          ...month,
          label: formatYearMonthLabel(month.yearMonth),
          fullLabel: formatYearMonthFullLabel(month.yearMonth),
        })),
    [monthlyOptionKeys, monthlyStudyTimeStats],
  );
  const selectedMonth =
    monthlyStudyTimes.find((month) => month.yearMonth === selectedMonthKey) ??
    monthlyStudyTimes[monthlyStudyTimes.length - 1] ??
    null;
  const maxStudyMinutes = Math.max(60, ...dailyStudyTimes.map((day) => day.studyTimeMinutes));
  const maxMonthlyStudyMinutes = Math.max(
    60,
    ...monthlyStudyTimes.map((month) => month.studyTimeMinutes),
  );
  const todayStudyMinutes = studyTimeStats?.todayStudyTimeMinutes ?? 0;
  const weeklyStudyMinutes = studyTimeStats?.weeklyStudyTimeMinutes ?? 0;
  const selectedMonthStudyMinutes = selectedMonth?.studyTimeMinutes ?? 0;
  const monthlyTotalStudyMinutes = monthlyStudyTimes.reduce(
    (total, month) => total + month.studyTimeMinutes,
    0,
  );
  const weeklyStudyBarPercent = clampPercent((weeklyStudyMinutes / 300) * 100);
  const averageAccuracy = problemAccuracy?.accuracyRate ?? 0;
  const totalSubmissions = problemAccuracy?.totalSubmissionCount ?? 0;
  const accuracyChartData =
    accuracyTrend?.dailyAccuracies.map((day) => ({
      label: day.dayLabel,
      val: day.accuracyRate,
    })) ?? [];

  useEffect(() => {
    if (activeTab !== 1 || monthlyStudyTimes.length === 0) return;

    const hasSelectedMonth = monthlyStudyTimes.some(
      (month) => month.yearMonth === selectedMonthKey,
    );

    if (!hasSelectedMonth) {
      setSelectedMonthKey(monthlyStudyTimes[monthlyStudyTimes.length - 1].yearMonth);
    }
  }, [activeTab, monthlyStudyTimes, selectedMonthKey]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="border-b border-border bg-bg px-4 pb-3 pt-2">
        <Text className="font-regular text-xs text-text-brown">Lv.1 일본어 고수 꿈나무 🌱</Text>
        <Text className="font-semiBold mb-2.5 text-xl text-btn-dark">
          {isLoading ? '불러오는 중...' : `${profile?.name ?? '-'} 님`}
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
        {hasLoadError ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-semiBold text-sm text-btn-dark">
              학습 분석 정보를 불러오지 못했어요
            </Text>
            <Text className="mt-1 font-regular text-xs text-text-brown">
              잠시 후 다시 시도해주세요.
            </Text>
            <Pressable
              className="mt-3 self-start rounded-sm bg-btn-dark px-4 py-2"
              onPress={() => void loadAnalysis()}
            >
              <Text className="font-semiBold text-xs text-white">다시 불러오기</Text>
            </Pressable>
          </View>
        ) : null}

        {activeTab === 0 ? (
          <View className="relative items-center pt-2">
            <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#B8D4F0] opacity-80" />
            <View className="w-full rounded-sm border border-border bg-white p-4 pt-5">
              <Text className="mb-3 font-regular text-xs text-text-brown">
                이번 주 학습 시간 (분)
              </Text>
              <View className="flex-row items-end gap-x-1.5" style={{ height: 80 }}>
                {(isLoading ? [] : dailyStudyTimes).map((day) => (
                  <View key={day.dayOfWeek} className="flex-1 items-center">
                    <Text
                      className="mb-1 text-center font-regular"
                      style={{ fontSize: 9, color: day.studyTimeMinutes > 0 ? TEXT : TEXT3 }}
                    >
                      {day.studyTimeMinutes}분
                    </Text>
                    <View
                      style={{
                        width: '100%',
                        height: Math.max(6, (day.studyTimeMinutes / maxStudyMinutes) * 76),
                        backgroundColor: day.studyTimeMinutes > 0 ? ACCENT : '#E0D8C8',
                        borderRadius: 2,
                      }}
                    />
                    <Text
                      className="mt-1 text-center font-regular"
                      style={{ fontSize: 9, color: TEXT3 }}
                    >
                      {day.dayLabel}
                    </Text>
                  </View>
                ))}
                {!isLoading && dailyStudyTimes.length === 0 ? (
                  <View className="flex-1 items-center justify-center">
                    <Text className="font-regular text-xs text-text-brown">
                      이번 주 학습 기록이 아직 없어요.
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : (
          <View className="relative items-center pt-2">
            <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#B8D4F0] opacity-80" />
            <View className="w-full rounded-sm border border-border bg-white p-4 pt-5">
              <Text className="mb-3 font-regular text-xs text-text-brown">월간 학습 시간</Text>
              <View className="mb-4 flex-row gap-x-2">
                {(isLoading ? [] : monthlyStudyTimes.slice().reverse()).map((month) => (
                  <Pressable
                    key={month.yearMonth}
                    className="flex-1 rounded-sm border border-border px-3 py-2"
                    onPress={() => setSelectedMonthKey(month.yearMonth)}
                    style={{
                      backgroundColor: selectedMonth?.yearMonth === month.yearMonth ? TEXT : '#fff',
                    }}
                  >
                    <Text
                      className="text-center font-regular text-xs"
                      style={{
                        color: selectedMonth?.yearMonth === month.yearMonth ? '#fff' : TEXT3,
                      }}
                    >
                      {month.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View className="mb-4 flex-row items-end gap-x-2" style={{ height: 92 }}>
                {(isLoading ? [] : monthlyStudyTimes).map((month) => (
                  <Pressable
                    key={month.yearMonth}
                    className="flex-1 items-center"
                    onPress={() => setSelectedMonthKey(month.yearMonth)}
                  >
                    <Text
                      className="mb-1 text-center font-regular"
                      style={{
                        fontSize: 9,
                        color: month.studyTimeMinutes > 0 ? TEXT : TEXT3,
                      }}
                    >
                      {month.studyTimeMinutes}분
                    </Text>
                    <View
                      style={{
                        width: '100%',
                        height: Math.max(8, (month.studyTimeMinutes / maxMonthlyStudyMinutes) * 72),
                        backgroundColor:
                          selectedMonth?.yearMonth === month.yearMonth ? ACCENT : '#E0D8C8',
                        borderRadius: 2,
                      }}
                    />
                    <Text
                      className="mt-1 text-center font-regular"
                      style={{ fontSize: 9, color: TEXT3 }}
                    >
                      {month.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View className="rounded-sm bg-bg p-4">
                <Text className="font-semiBold text-base text-btn-dark">
                  {selectedMonth?.fullLabel ?? '-'} · {formatMinutes(selectedMonthStudyMinutes)}
                </Text>
                <Text className="mt-1 font-regular text-xs text-text-brown">
                  최근 {monthlyStudyTimes.length}개월 누적 {formatMinutes(monthlyTotalStudyMinutes)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 스탯 2개 */}
        <View className="flex-row gap-x-3">
          <View className="relative flex-1 items-center pt-2">
            <View className="absolute right-3 top-0 z-10 h-[11px] w-6 rounded-sm bg-[#FFE566] opacity-80" />
            <View className="w-full rounded-sm bg-[#FEF3C7] p-3">
              <Text className="font-regular text-xs text-text-brown">오늘 학습 시간</Text>
              <Text className="font-semiBold text-2xl text-btn-dark">
                {isLoading ? '-' : formatMinutes(todayStudyMinutes)}
              </Text>
              <View className="mt-2 h-0.5 rounded-full bg-black/10">
                <View
                  className="h-0.5 rounded-full bg-[#D97706]"
                  style={{
                    width: `${clampPercent((todayStudyMinutes / 60) * 100)}%`,
                  }}
                />
              </View>
            </View>
          </View>
          <View className="relative flex-1 items-center pt-2">
            <View className="absolute left-3 top-0 z-10 h-[11px] w-6 rounded-sm bg-[#B8E8C0] opacity-80" />
            <View className="w-full rounded-sm bg-[#D1FAE5] p-3">
              <Text className="font-regular text-xs text-text-brown">이번 주 학습</Text>
              <Text className="font-semiBold text-2xl text-btn-dark">
                {isLoading ? '-' : formatMinutes(weeklyStudyMinutes)}
              </Text>
              <View className="mt-2 h-0.5 rounded-full bg-black/10">
                <View
                  className="h-0.5 rounded-full bg-[#059669]"
                  style={{ width: `${weeklyStudyBarPercent}%` }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 평균 정답률 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#B8E8C0] opacity-80" />
          <View className="w-full rounded-sm border border-border bg-white p-4 pt-5">
            <Text className="mb-1.5 font-regular text-xs text-text-brown">
              평균 정답률 · 누적 {isLoading ? '-' : totalSubmissions}문제
            </Text>
            <Text className="font-semiBold text-4xl text-btn-dark">
              {isLoading ? '-' : `${averageAccuracy}%`}
            </Text>
            <View className="mt-2.5 h-0.5 rounded-full bg-border">
              <View
                className="h-0.5 rounded-full bg-[#6B7280]"
                style={{ width: `${averageAccuracy}%` }}
              />
            </View>
            <Text className="mt-2 font-regular text-xs text-text-brown">
              {totalSubmissions > 0
                ? '최근 풀이 기준으로 계산했어요.'
                : '문제를 풀면 정답률이 표시돼요.'}
            </Text>
          </View>
        </View>

        {/* 꺾은선 그래프 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#FFE566] opacity-80" />
          <View className="w-full rounded-sm border border-border bg-white p-4 pt-5">
            <Text className="mb-3 font-regular text-xs text-text-brown">
              {isLoading ? '성장 그래프' : `${profile?.name ?? '-'} 님의 성장 그래프`}
            </Text>
            <LineChart
              data={
                accuracyChartData.length > 0
                  ? accuracyChartData
                  : ['월', '화', '수', '목', '금', '토', '일'].map((label) => ({ label, val: 0 }))
              }
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
