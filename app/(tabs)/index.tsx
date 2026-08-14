import Text from '@/components/ui/AppText';
import { getMyProfile, type UserProfile } from '@/lib/api/user';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession, consumeNeedsLevelTest } from '@/lib/auth/session';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

export default function HomeScreen() {
  const router = useRouter();
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const redirectToLevelTestIfNeeded = async () => {
      const needsLevelTest = await consumeNeedsLevelTest();

      if (!mounted || !needsLevelTest) return;

      router.replace('/(app)/level/test-survey');
    };

    redirectToLevelTestIfNeeded();

    return () => {
      mounted = false;
    };
  }, [router]);

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
      {/* 헤더 */}
      <View className="border-b border-border bg-bg px-4 pb-3 pt-2">
        <Text className="font-regular text-xs text-text-brown">good morning</Text>
        <Text className="font-semiBold text-2xl text-btn-dark">
          {isProfileLoading ? '불러오는 중...' : `${profile?.name ?? '-'} 님 😊`}
        </Text>
        <Text className="font-regular text-xs text-text-brown">오늘의 학습이 남아있어요</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 출석 도장 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#B8D4F0] opacity-80" />
          <View className="w-full rounded-sm border border-border bg-white p-4 pt-5">
            <Text className="mb-2 font-regular text-xs text-text-brown">출석 도장 · 연속 7일</Text>
            <View className="flex-row gap-x-1.5">
              {days.map((d, i) => (
                <View
                  key={i}
                  className="h-8 flex-1 items-center justify-center rounded-sm"
                  style={{ backgroundColor: i < 5 ? '#2A2018' : '#EDE8DE' }}
                >
                  <Text
                    style={{ fontSize: 10, color: i < 5 ? '#fff' : '#A09080', fontWeight: '500' }}
                  >
                    {d}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 오늘의 표현 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#F9C8D8] opacity-80" />
          <Pressable
            className="w-full rounded-sm border border-border bg-white p-4 pt-5"
            onPress={() => router.push('/(app)/learning/problems/today')}
          >
            <Text className="mb-1 font-regular text-xs text-text-brown">오늘의 표현</Text>
            <Text className="font-regular text-2xl text-btn-dark">はじめまして。</Text>
            <Text className="mt-1 font-regular text-sm text-text-brown">처음 뵙겠습니다</Text>
            <Text className="font-semiBold mt-2 self-end text-sm text-text-brown">
              학습하러 가기 →
            </Text>
          </Pressable>
        </View>

        {/* 스탯 2개 */}
        <View className="flex-row gap-x-3">
          <View className="relative flex-1 items-center pt-2">
            <View className="absolute right-3 top-0 z-10 h-[11px] w-6 rounded-sm bg-[#FFE566] opacity-80" />
            <View className="w-full rounded-sm bg-[#FEF3C7] p-3">
              <Text className="font-regular text-xs text-text-brown">오늘 학습</Text>
              <Text className="font-semiBold text-2xl text-btn-dark">20분</Text>
              <Text className="font-regular text-xs text-[#D97706]">목표 60분</Text>
              <View className="mt-2 h-0.5 rounded-full bg-black/10">
                <View className="h-0.5 w-1/3 rounded-full bg-[#D97706]" />
              </View>
            </View>
          </View>
          <View className="relative flex-1 items-center pt-2">
            <View className="absolute left-3 top-0 z-10 h-[11px] w-6 rounded-sm bg-[#B8E8C0] opacity-80" />
            <View className="w-full rounded-sm bg-[#D1FAE5] p-3">
              <Text className="font-regular text-xs text-text-brown">정답률</Text>
              <Text className="font-semiBold text-2xl text-btn-dark">58%</Text>
              <Text className="font-regular text-xs text-[#059669]">상위 23%</Text>
              <View className="mt-2 h-0.5 rounded-full bg-black/10">
                <View className="h-0.5 w-[58%] rounded-full bg-[#059669]" />
              </View>
            </View>
          </View>
        </View>

        {/* 나의 챌린지 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#B8E8C0] opacity-80" />
          <Pressable
            className="w-full rounded-sm border border-border bg-white p-4 pt-5"
            onPress={() => router.push('/(app)/mypage/challenge')}
          >
            <Text className="mb-1 font-regular text-xs text-text-brown">나의 챌린지</Text>
            <Text className="font-semiBold text-lg text-btn-dark">매일 단어 20개</Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="font-regular text-xs text-text-brown">목표 달성률</Text>
              <Text className="font-regular text-xs text-text-brown">50%</Text>
            </View>
            <View className="mt-1.5 h-0.5 rounded-full bg-black/10">
              <View className="h-0.5 w-1/2 rounded-full bg-[#6B7280]" />
            </View>
          </Pressable>
        </View>

        {/* 오늘의 학습 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#FFE566] opacity-80" />
          <Pressable
            className="w-full rounded-sm border border-border bg-white p-4 pt-5"
            onPress={() => router.push('/(app)/learning/problems/today')}
          >
            <Text className="mb-1 font-regular text-xs text-text-brown">오늘의 학습</Text>
            <Text className="font-semiBold text-lg text-btn-dark">문자/어휘 · 문맥규정</Text>
            <Text className="mt-0.5 font-regular text-xs text-text-brown">
              총 20문제 · 예상 10분
            </Text>
            <Text className="font-semiBold mt-2 self-end text-sm text-text-brown">
              학습하러 가기 →
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
