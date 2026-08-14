import Text from '@/components/ui/AppText';
import { getMyProfile, type UserProfile } from '@/lib/api/user';
import { ApiError } from '@/lib/api/client';
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

const LineChart = () => {
  const data = [
    { label: '월', val: 52 },
    { label: '화', val: 45 },
    { label: '수', val: 60 },
    { label: '목', val: 52 },
    { label: '금', val: 58 },
    { label: '토', val: 64 },
    { label: '일', val: 75 },
  ];

  const w = W;
  const h = 120;
  const pt = 20; // paddingTop
  const pb = 20; // paddingBottom
  const pl = 10; // paddingLeft
  const pr = 10; // paddingRight
  const innerH = h - pt - pb;
  const innerW = w - pl - pr;
  const min = 30;
  const max = 85;

  const gx = (i: number) => pl + (i / 6) * innerW;
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
            textAnchor={i === 6 ? 'end' : 'middle'}
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
            <View className="flex-row items-end gap-x-1.5" style={{ height: 80 }}>
              {[
                ['월', 55],
                ['화', 70],
                ['수', 45],
                ['목', 80],
                ['금', 60],
                ['토', 20],
                ['일', 10],
              ].map(([d, h], i) => (
                <View key={String(d)} className="flex-1 items-center">
                  <Text
                    className="mb-1 text-center font-regular"
                    style={{ fontSize: 9, color: i < 5 ? TEXT : TEXT3 }}
                  >
                    {h}분
                  </Text>
                  <View
                    style={{
                      width: '100%',
                      height: Number(h) * 0.6,
                      backgroundColor: i < 5 ? ACCENT : '#E0D8C8',
                      borderRadius: 2,
                    }}
                  />
                  <Text
                    className="mt-1 text-center font-regular"
                    style={{ fontSize: 9, color: TEXT3 }}
                  >
                    {d}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 스탯 2개 */}
        <View className="flex-row gap-x-3">
          <View className="relative flex-1 items-center pt-2">
            <View className="absolute right-3 top-0 z-10 h-[11px] w-6 rounded-sm bg-[#FFE566] opacity-80" />
            <View className="w-full rounded-sm bg-[#FEF3C7] p-3">
              <Text className="font-regular text-xs text-text-brown">오늘 학습 시간</Text>
              <Text className="font-semiBold text-2xl text-btn-dark">20분</Text>
              <View className="mt-2 h-0.5 rounded-full bg-black/10">
                <View className="h-0.5 w-1/3 rounded-full bg-[#D97706]" />
              </View>
            </View>
          </View>
          <View className="relative flex-1 items-center pt-2">
            <View className="absolute left-3 top-0 z-10 h-[11px] w-6 rounded-sm bg-[#B8E8C0] opacity-80" />
            <View className="w-full rounded-sm bg-[#D1FAE5] p-3">
              <Text className="font-regular text-xs text-text-brown">이번 주 학습</Text>
              <Text className="font-semiBold text-2xl text-btn-dark">180분</Text>
              <View className="mt-2 h-0.5 rounded-full bg-black/10">
                <View className="h-0.5 w-[72%] rounded-full bg-[#059669]" />
              </View>
            </View>
          </View>
        </View>

        {/* 평균 정답률 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#B8E8C0] opacity-80" />
          <View className="w-full rounded-sm border border-border bg-white p-4 pt-5">
            <Text className="mb-1.5 font-regular text-xs text-text-brown">
              평균 정답률 · 상위 23%
            </Text>
            <Text className="font-semiBold text-4xl text-btn-dark">58%</Text>
            <View className="mt-2.5 h-0.5 rounded-full bg-border">
              <View className="h-0.5 w-[58%] rounded-full bg-[#6B7280]" />
            </View>
            <Text className="mt-2 font-regular text-xs text-text-brown">
              잘하고 있어요! 꾸준히! ✨
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
            <LineChart />
          </View>
        </View>

        {/* 목표 달성 현황 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#F9C8D8] opacity-80" />
          <View className="w-full rounded-sm border border-border bg-white p-4 pt-5">
            <Text className="mb-1.5 font-regular text-xs text-text-brown">목표 달성 현황</Text>
            <View className="flex-row items-center justify-between">
              <Text className="font-semiBold text-sm text-btn-dark">전체 목표 달성률</Text>
              <Text className="font-semiBold text-2xl text-btn-dark">58%</Text>
            </View>
            <View className="mt-2.5 h-0.5 rounded-full bg-border">
              <View className="h-0.5 w-[58%] rounded-full bg-[#6B7280]" />
            </View>
            <Text className="mt-2 font-regular text-xs text-text-brown">누적 학습 164일</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
