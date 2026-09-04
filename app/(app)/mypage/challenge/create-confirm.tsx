import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import {
  CHALLENGE_GOAL_TYPE_ICONS,
  CHALLENGE_GOAL_TYPE_LABELS,
  CHALLENGE_GOAL_TYPE_TARGET_UNITS,
  createChallenge,
  type ChallengeGoalTypeCode,
} from '@/lib/api/challenge';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_MID = '#A7F3D0';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

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
  const params = useLocalSearchParams<{
    title?: string;
    goalType?: ChallengeGoalTypeCode;
    goalLabel?: string;
    goalDescription?: string;
    startDate?: string;
    endDate?: string;
    targetValue?: string;
    days?: string;
    alarmTime?: string;
  }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdChallengeId, setCreatedChallengeId] = useState<number | null>(null);

  const title = String(params.title || '');
  const goalType = params.goalType ?? 'STUDY_TIME';
  const goalLabel = params.goalLabel ?? CHALLENGE_GOAL_TYPE_LABELS[goalType];
  const goalDescription = params.goalDescription ?? '매일 목표 달성하기';
  const targetUnit = CHALLENGE_GOAL_TYPE_TARGET_UNITS[goalType];
  const startDate = String(params.startDate || '');
  const endDate = String(params.endDate || '');
  const targetValue = Number(params.targetValue || '0');
  const days = String(params.days || '0,1,2,3,4');
  const alarmTime = String(params.alarmTime || '오후 08:00');

  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
  const selectedDayLabels = days
    .split(',')
    .map((d) => dayLabels[Number(d)])
    .join(', ');

  const parseDate = (str: string) => {
    const match = str.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return new Date();
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  };

  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const diffDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
  const isCreated = createdChallengeId !== null;

  const handleCreate = async () => {
    if (isSubmitting) return;

    if (!title.trim()) {
      showToast('챌린지 제목을 입력해주세요.');
      return;
    }

    if (title.trim().length > 50) {
      showToast('챌린지 제목은 50자 이하로 입력해주세요.');
      return;
    }

    if (!Number.isInteger(targetValue) || targetValue < 1) {
      showToast('목표값은 1 이상의 정수로 입력해주세요.');
      return;
    }

    if (!startDate || !endDate || end.getTime() < start.getTime()) {
      showToast('챌린지 기간을 확인해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createChallenge({
        title: title.trim(),
        goalType,
        targetValue,
        startDate,
        endDate,
      });

      setCreatedChallengeId(result.challengeId);
      showToast('챌린지가 등록되었습니다.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        showToast('로그인이 필요합니다.');
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }

      showToast(error instanceof ApiError ? error.message : '챌린지 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="챌린지 추가" />
      <StepBar step={3} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-4"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="items-center rounded-lg p-7"
          style={{ backgroundColor: GREEN_LIGHT, borderWidth: 1.5, borderColor: GREEN_MID }}
        >
          {isCreated && <CheckIcon />}
          <Text className="font-semiBold mb-2 mt-3.5 text-base text-btn-dark">
            {isCreated ? '챌린지가 성공적으로 등록되었어요!' : '챌린지를 등록할까요?'}
          </Text>
          <Text className="font-regular text-xs text-text-brown">
            {isCreated
              ? '꾸준한 학습으로 목표를 달성해봐요!'
              : '입력한 내용을 한 번 더 확인해주세요.'}
          </Text>
        </View>

        {/* 내 챌린지 정보 */}
        <View>
          <Text className="font-semiBold mb-3 text-sm text-btn-dark">내 챌린지 정보</Text>
          <View className="overflow-hidden rounded-sm border border-border bg-white">
            <View className="flex-row items-center gap-x-2.5 border-b border-border px-4 py-3">
              <Text style={{ fontSize: 18 }}>{CHALLENGE_GOAL_TYPE_ICONS[goalType] ?? '✓'}</Text>
              <View className="flex-1">
                <Text className="font-semiBold text-sm text-btn-dark">{title || goalLabel}</Text>
                <Text className="font-regular text-xs text-text-brown">{goalDescription}</Text>
              </View>
              <Text className="font-semiBold text-sm text-btn-dark">
                {targetValue}
                {targetUnit}
              </Text>
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
            backgroundColor: isSubmitting ? '#C8C0B0' : GREEN,
            borderRadius: 8,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          disabled={isSubmitting}
          onPress={isCreated ? () => router.replace('/(app)/mypage/challenge') : handleCreate}
        >
          <Text className="font-semiBold text-sm text-white">
            {isSubmitting ? '등록 중...' : isCreated ? '내 챌린지로 이동' : '챌린지 등록하기'}
          </Text>
        </Pressable>

        {isCreated && (
          <Pressable
            className="items-center rounded-sm border border-border bg-white py-3.5"
            onPress={() => router.replace('/(tabs)')}
          >
            <Text className="font-regular text-sm text-btn-dark">메인으로 이동</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
