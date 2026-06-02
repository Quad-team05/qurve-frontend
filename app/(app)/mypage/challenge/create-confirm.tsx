import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_MID = '#A7F3D0';

const StepBar = ({ step }: { step: number }) => (
  <View className="flex-row px-4 pb-2 pt-3">
    {['목표 선택', '목표 설정', '확인 및 등록'].map((label, i) => (
      <View key={i} className="flex-1 items-center gap-y-1">
        <View
          style={{
            width: '100%',
            height: 3,
            backgroundColor: i < step ? GREEN : '#E0D8C8',
            borderTopLeftRadius: i === 0 ? 2 : 0,
            borderBottomLeftRadius: i === 0 ? 2 : 0,
            borderTopRightRadius: i === 2 ? 2 : 0,
            borderBottomRightRadius: i === 2 ? 2 : 0,
          }}
        />
        <Text style={{ fontSize: 9, color: i < step ? GREEN : '#A09080' }}>{label}</Text>
      </View>
    ))}
  </View>
);

const CheckIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Circle cx={24} cy={24} r={24} fill={GREEN} />
    <Path
      d="M14 24 L21 31 L34 17"
      stroke="white"
      strokeWidth={2.5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function CreateConfirmPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const startDate = String(params.startDate || '');
  const endDate = String(params.endDate || '');
  const minutes = String(params.minutes || '30');
  const days = String(params.days || '0,1,2,3,4');
  const alarmTime = String(params.alarmTime || '오후 08:00');

  useEffect(() => {
    console.log('params received:', { startDate, endDate, minutes, days, alarmTime });
  }, []);

  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
  const selectedDayLabels = days
    .split(',')
    .map((d) => dayLabels[Number(d)])
    .join(', ');

  const parseDate = (str: string) => {
    const match = str.match(/(\d{4})\.(\d{2})\.(\d{2})/);
    if (!match) return new Date();
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  };

  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const diffDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="챌린지 추가" />
      <StepBar step={3} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 완료 카드 */}
        <View
          className="items-center rounded-lg p-7"
          style={{ backgroundColor: GREEN_LIGHT, borderWidth: 1.5, borderColor: GREEN_MID }}
        >
          <CheckIcon />
          <Text className="font-semiBold mb-2 mt-3.5 text-base text-btn-dark">
            챌린지가 성공적으로 등록되었어요!
          </Text>
          <Text className="font-regular text-xs text-text-brown">
            꾸준한 학습으로 목표를 달성해봐요!
          </Text>
        </View>

        {/* 내 챌린지 정보 */}
        <View>
          <Text className="font-semiBold mb-3 text-sm text-btn-dark">내 챌린지 정보</Text>
          <View className="overflow-hidden rounded-sm border border-border bg-white">
            <View className="flex-row items-center gap-x-2.5 border-b border-border px-4 py-3">
              <Text style={{ fontSize: 18 }}>🔥</Text>
              <View className="flex-1">
                <Text className="font-semiBold text-sm text-btn-dark">하루 학습 시간</Text>
                <Text className="font-regular text-xs text-text-brown">
                  매일 일정 시간 학습하기
                </Text>
              </View>
              <Text className="font-semiBold text-sm text-btn-dark">{minutes}분</Text>
            </View>
            <View className="flex-row items-start justify-between border-b border-border px-4 py-3">
              <Text className="font-regular text-xs text-text-brown">챌린지 기간</Text>
              <View className="items-end">
                <Text className="font-regular text-xs text-btn-dark">
                  {startDate} ~ {endDate}
                </Text>
                <Text className="mt-0.5 font-regular text-xs" style={{ color: GREEN }}>
                  총 {diffDays}일
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
              <Text className="font-regular text-xs text-text-brown">반복 요일</Text>
              <Text className="font-regular text-xs text-btn-dark">{selectedDayLabels}</Text>
            </View>
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="font-regular text-xs text-text-brown">알림 시간</Text>
              <Text className="font-regular text-xs text-btn-dark">{alarmTime}</Text>
            </View>
          </View>
        </View>

        {/* AI 학습 코치 */}
        <View
          className="rounded-lg p-4"
          style={{ backgroundColor: GREEN_LIGHT, borderWidth: 1.5, borderColor: GREEN_MID }}
        >
          <Text className="font-semiBold mb-1.5 text-sm" style={{ color: GREEN }}>
            🤖 AI 학습 코치
          </Text>
          <Text className="mb-1 font-regular text-xs text-btn-dark">꾸준함이 실력을 만듭니다!</Text>
          <Text className="font-regular text-xs text-text-brown">
            {diffDays}일 동안 무리하지 않고 작은 목표부터 시작해보세요 🌱
          </Text>
        </View>

        <Pressable
          style={{
            backgroundColor: GREEN,
            borderRadius: 8,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          onPress={() => router.push('/(app)/mypage/challenge')}
        >
          <Text className="font-semiBold text-sm text-white">챌린지 시작하기</Text>
        </Pressable>

        <Pressable
          className="items-center rounded-sm border border-border bg-white py-3.5"
          onPress={() => router.push('/(app)/mypage/challenge')}
        >
          <Text className="font-regular text-sm text-btn-dark">내 챌린지로 이동</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
