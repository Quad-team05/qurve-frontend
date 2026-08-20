import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { getTodayLearning, type TodayLearning } from '@/lib/api/learning';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, ToastAndroid, View } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const cardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

export default function TodayProblemsPage() {
  const router = useRouter();
  const [todayLearning, setTodayLearning] = useState<TodayLearning | null>(null);

  useEffect(() => {
    const loadTodayLearning = async () => {
      try {
        const result = await getTodayLearning();
        setTodayLearning(result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearAuthSession();
          router.replace('/(app)/auth/login');
          return;
        }

        showToast('오늘의 학습 정보를 불러오지 못했습니다.');
      }
    };

    void loadTodayLearning();
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="오늘의 학습" />

      <View className="flex-1 px-4 pt-4">
        <Text className="mb-[6px] text-xs text-text-brown">오늘의 학습 주제</Text>
        <View
          className="rounded-sm border border-border bg-white px-4 py-4 pb-4"
          style={cardShadowStyle}
        >
          <Text className="mt-2 text-base text-[#2A2018]">
            • {todayLearning?.category ?? '문자 / 어휘'}
          </Text>
          <Text className="mt-2 text-base text-[#2A2018]">
            • {todayLearning?.title ?? '문맥규정'}
          </Text>

          <View className="my-5 h-px bg-border" />

          <Text className="text-sm font-semibold text-text-brown">
            • 총 {todayLearning?.totalQuestionCount ?? 20}문제
          </Text>
          <Text className="mt-2 text-sm font-semibold text-text-brown">
            • 예상 풀이 시간: {todayLearning?.estimatedMinutes ?? 10}분
          </Text>
        </View>

        <Pressable
          className="mt-4 h-[50px] items-center justify-center rounded-xl bg-btn-dark"
          onPress={() => router.push('/(app)/learning/problems/solve')}
        >
          <Text className="font-bold text-base text-white">시작하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
