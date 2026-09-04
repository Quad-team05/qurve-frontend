import Text from '@/components/ui/AppText';
import ConfirmModal from '@/components/ui/ConfirmModal';
import TopBar from '@/components/ui/TopBar';
import {
  CHALLENGE_GOAL_TYPE_LABELS,
  CHALLENGE_GOAL_TYPE_TARGET_UNITS,
  deleteChallenge,
  getMyChallenges,
  normalizeChallengeManagement,
  type ChallengeManagement,
  type ChallengeManage,
  type ChallengeStatus,
} from '@/lib/api/challenge';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

function getStatusLabel(status: ChallengeStatus) {
  if (status === 'ACTIVE') return '진행 중';
  if (status === 'COMPLETED') return '완료';
  return '실패';
}

function getProgressRate(challenge: ChallengeManage) {
  if (typeof challenge.progressRate === 'number') {
    return Math.max(0, Math.min(100, challenge.progressRate));
  }

  if (challenge.targetValue <= 0) return 0;

  return Math.max(
    0,
    Math.min(100, Math.round((challenge.currentValue / challenge.targetValue) * 100)),
  );
}

export default function ChallengePage() {
  const router = useRouter();
  const [management, setManagement] = useState<ChallengeManagement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDeleteChallenge, setPendingDeleteChallenge] = useState<ChallengeManage | null>(
    null,
  );
  const [deletingChallengeId, setDeletingChallengeId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const activeChallenges = management?.activeChallenges ?? [];
  const completedChallenges = management?.completedChallenges ?? [];
  const failedChallenges = management?.failedChallenges ?? [];
  const challenges = [...activeChallenges, ...completedChallenges, ...failedChallenges];
  const averageProgress = management?.totalProgressRate ?? 0;

  const loadChallenges = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const result = await getMyChallenges();
      setManagement(normalizeChallengeManagement(result));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        showToast('로그인이 필요합니다.');
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }

      const message =
        error instanceof ApiError ? error.message : '챌린지 목록을 불러오지 못했습니다.';
      setManagement(null);
      setErrorMessage(message);
      showToast(message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      void loadChallenges();
    }, [loadChallenges]),
  );

  const handleDelete = (challenge: ChallengeManage) => {
    setPendingDeleteChallenge(challenge);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteChallenge) return;

    try {
      setDeletingChallengeId(pendingDeleteChallenge.challengeId);
      await deleteChallenge(pendingDeleteChallenge.challengeId);
      showToast('챌린지가 삭제되었습니다.');
      setPendingDeleteChallenge(null);
      await loadChallenges();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        showToast('로그인이 필요합니다.');
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }

      showToast(error instanceof ApiError ? error.message : '챌린지 삭제에 실패했습니다.');
    } finally {
      setDeletingChallengeId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="챌린지 관리" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-regular text-xs text-text-brown">총 달성 현황</Text>
        <View className="rounded-sm border border-border bg-white p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-x-2.5">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FEF3C7]">
                <Text style={{ fontSize: 20 }}>🔥</Text>
              </View>
              <View>
                <Text className="font-semiBold text-xl text-btn-dark">
                  {management?.activeChallengeCount ?? activeChallenges.length}개
                </Text>
                <Text className="font-regular text-xs text-text-brown">
                  연속 {management?.streakDays ?? 0}일 학습
                </Text>
              </View>
            </View>
            <Text className="font-semiBold text-3xl text-btn-dark">{averageProgress}%</Text>
          </View>
          <View className="mb-3 h-1 rounded-full bg-[#EDE8DE]">
            <View
              className="h-1 rounded-full"
              style={{ backgroundColor: GREEN, width: `${averageProgress}%` }}
            />
          </View>
          <View className="flex-row gap-x-2.5">
            <View className="flex-1 items-center rounded-sm border border-border bg-bg py-3">
              <Text className="font-semiBold text-xl text-btn-dark">
                {management?.activeChallengeCount ?? activeChallenges.length}개
              </Text>
              <Text className="mt-0.5 font-regular text-xs text-text-brown">진행중</Text>
            </View>
            <View className="flex-1 items-center rounded-sm border border-border bg-bg py-3">
              <Text className="font-semiBold text-xl text-btn-dark">
                {management?.completedChallengeCount ?? completedChallenges.length}개
              </Text>
              <Text className="mt-0.5 font-regular text-xs text-text-brown">완료</Text>
            </View>
            <View className="flex-1 items-center rounded-sm border border-border bg-bg py-3">
              <Text className="font-semiBold text-xl text-btn-dark">
                {failedChallenges.length}개
              </Text>
              <Text className="mt-0.5 font-regular text-xs text-text-brown">실패</Text>
            </View>
          </View>
        </View>

        <Text className="font-regular text-xs text-text-brown">내 챌린지</Text>
        {isLoading && (
          <View className="rounded-sm border border-border bg-white p-5">
            <Text className="text-center font-regular text-sm text-text-brown">
              챌린지를 불러오는 중입니다.
            </Text>
          </View>
        )}

        {!isLoading && errorMessage ? (
          <View className="rounded-sm border border-border bg-white p-5">
            <Text className="text-center font-regular text-sm text-text-brown">{errorMessage}</Text>
            <Pressable
              className="mt-3 items-center rounded-sm bg-btn-dark py-3"
              onPress={loadChallenges}
            >
              <Text className="font-semiBold text-sm text-white">다시 시도</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !errorMessage && challenges.length === 0 && (
          <View className="rounded-sm border border-border bg-white p-5">
            <Text className="text-center font-regular text-sm text-text-brown">
              아직 등록된 챌린지가 없습니다.
            </Text>
          </View>
        )}

        {!isLoading &&
          !errorMessage &&
          challenges.map((challenge) => {
            const progressRate = getProgressRate(challenge);
            const statusLabel = getStatusLabel(challenge.status);
            const targetUnit = CHALLENGE_GOAL_TYPE_TARGET_UNITS[challenge.goalType] ?? '';
            const statusColor =
              challenge.status === 'ACTIVE'
                ? GREEN
                : challenge.status === 'COMPLETED'
                  ? '#2563EB'
                  : '#DC2626';

            return (
              <View
                key={challenge.challengeId}
                className="rounded-sm border border-border bg-white p-4"
              >
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="font-semiBold text-sm text-btn-dark">{challenge.title}</Text>
                  <Text className="font-regular text-xs" style={{ color: statusColor }}>
                    {statusLabel}
                  </Text>
                </View>
                <Text className="mb-2 font-regular text-xs text-text-brown">
                  {CHALLENGE_GOAL_TYPE_LABELS[challenge.goalType] ?? challenge.goalType}
                </Text>
                <View className="mb-1.5 h-0.5 rounded-full bg-[#EDE8DE]">
                  <View
                    className="h-0.5 rounded-full"
                    style={{ backgroundColor: statusColor, width: `${progressRate}%` }}
                  />
                </View>
                <Text className="font-regular text-xs text-text-brown">
                  {challenge.currentValue}/{challenge.targetValue}
                  {targetUnit} · {challenge.startDate} ~ {challenge.endDate}
                </Text>
                <View className="mt-3 flex-row gap-x-2">
                  <Pressable
                    className="flex-1 items-center rounded-sm border border-border py-2.5"
                    disabled={challenge.status !== 'ACTIVE'}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/mypage/challenge/edit',
                        params: {
                          challengeId: String(challenge.challengeId),
                          title: challenge.title,
                          goalType: challenge.goalType,
                          targetValue: String(challenge.targetValue),
                          startDate: challenge.startDate,
                          endDate: challenge.endDate,
                        },
                      })
                    }
                    style={{ opacity: challenge.status === 'ACTIVE' ? 1 : 0.45 }}
                  >
                    <Text className="font-semiBold text-xs text-btn-dark">수정</Text>
                  </Pressable>
                  <Pressable
                    className="flex-1 items-center rounded-sm border border-[#F4C7C7] py-2.5"
                    disabled={deletingChallengeId === challenge.challengeId}
                    onPress={() => handleDelete(challenge)}
                  >
                    <Text className="font-semiBold text-xs text-[#DC2626]">
                      {deletingChallengeId === challenge.challengeId ? '삭제 중...' : '삭제'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

        {/* 챌린지 추가 버튼 */}
        <Pressable
          className="items-center rounded-sm border border-border bg-white py-4"
          onPress={() => router.push('/(app)/mypage/challenge/create-goal-select')}
        >
          <Text className="font-regular text-sm text-text-brown">+ 챌린지 추가</Text>
        </Pressable>
      </ScrollView>
      <ConfirmModal
        visible={pendingDeleteChallenge !== null}
        title="챌린지 삭제"
        message="이 챌린지와 진행도 정보를 삭제할까요?"
        confirmLabel="삭제"
        destructive
        loading={deletingChallengeId !== null}
        onCancel={() => {
          if (deletingChallengeId !== null) return;
          setPendingDeleteChallenge(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </SafeAreaView>
  );
}
