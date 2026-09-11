import Text from '@/components/ui/AppText';
import { getMyProfile, type UserProfile } from '@/lib/api/user';
import { getStudyTimeStatistics, type StudyTimeStatistics } from '@/lib/api/learning';
import {
  getProblemAccuracy,
  getProblemAccuracyTrend,
  type ProblemAccuracy,
  type ProblemAccuracyTrend,
} from '@/lib/api/problem';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}분`;

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  return restMinutes > 0 ? `${hours}시간 ${restMinutes}분` : `${hours}시간`;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studyTimeStats, setStudyTimeStats] = useState<StudyTimeStatistics | null>(null);
  const [problemAccuracy, setProblemAccuracy] = useState<ProblemAccuracy | null>(null);
  const [accuracyTrend, setAccuracyTrend] = useState<ProblemAccuracyTrend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const tabs = ['일별', '월별', '전체'];

  const loadAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasLoadError(false);
      const [profileResult, studyTimeResult, accuracyResult, trendResult] = await Promise.all([
        getMyProfile(),
        getStudyTimeStatistics(),
        getProblemAccuracy(),
        getProblemAccuracyTrend(),
      ]);

      setProfile(profileResult);
      setStudyTimeStats(studyTimeResult);
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
  const maxStudyMinutes = Math.max(60, ...dailyStudyTimes.map((day) => day.studyTimeMinutes));
  const todayStudyMinutes = studyTimeStats?.todayStudyTimeMinutes ?? 0;
  const weeklyStudyMinutes = studyTimeStats?.weeklyStudyTimeMinutes ?? 0;
  const weeklyStudyBarPercent = clampPercent((weeklyStudyMinutes / 300) * 100);
  const averageAccuracy = problemAccuracy?.accuracyRate ?? 0;
  const totalSubmissions = problemAccuracy?.totalSubmissionCount ?? 0;
  const accuracyChartData =
    accuracyTrend?.dailyAccuracies.map((day) => ({
      label: day.dayLabel,
      val: day.accuracyRate,
    })) ?? [];

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

        {/* 막대 그래프 */}
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
