import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import {
  getChallengesForMain,
  getMyChallenges,
  normalizeChallengeManagement,
  type ChallengeMain,
} from '@/lib/api/challenge';
import { ApiError } from '@/lib/api/client';
import { getVocabUnits } from '@/lib/api/vocabulary';
import type { JlptLevel, VocabUnit, VocabUnitStatus } from '@/lib/api/vocabulary';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const levels: JlptLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

const statusStyleMap: Record<VocabUnitStatus, { color: string; progress: number }> = {
  BEFORE: { color: '#C8C0B0', progress: 0 },
  IN_PROGRESS: { color: '#D97706', progress: 0.5 },
  COMPLETED: { color: '#059669', progress: 1 },
};

function isChallengeAchieved(challenge: ChallengeMain) {
  return challenge.progressRate >= 100 || challenge.currentValue >= challenge.targetValue;
}

function toMainChallenge(challenge: {
  challengeId: number;
  title: string;
  goalType: ChallengeMain['goalType'];
  targetValue: number;
  currentValue: number;
  progressRate?: number;
}): ChallengeMain {
  const progressRate =
    typeof challenge.progressRate === 'number'
      ? challenge.progressRate
      : challenge.targetValue > 0
        ? Math.round((challenge.currentValue / challenge.targetValue) * 100)
        : 0;

  return {
    challengeId: challenge.challengeId,
    title: challenge.title,
    goalType: challenge.goalType,
    targetValue: challenge.targetValue,
    currentValue: challenge.currentValue,
    completedDays: challenge.currentValue,
    progressRate: Math.max(0, Math.min(100, progressRate)),
  };
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return '단어 유닛 목록을 불러오지 못했습니다.';

  if (error.status === 401 || error.status === 403) {
    return '로그인이 필요합니다. 다시 로그인해주세요.';
  }

  if (error.code === 'INVALID_LEVEL') {
    return '지원하지 않는 JLPT 레벨입니다.';
  }

  if (error.code === 'USER_NOT_FOUND') {
    return '사용자 정보를 찾을 수 없습니다.';
  }

  return '단어 유닛 목록을 불러오지 못했습니다.';
}

export default function VocabListPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<JlptLevel>('N5');
  const [modalVisible, setModalVisible] = useState(false);
  const [units, setUnits] = useState<VocabUnit[]>([]);
  const [wordChallenge, setWordChallenge] = useState<ChallengeMain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUnits = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const nextUnits = await getVocabUnits(selectedLevel);

      setUnits(nextUnits);
    } catch (error) {
      setUnits([]);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [selectedLevel]);

  useFocusEffect(
    useCallback(() => {
      void fetchUnits();
    }, [fetchUnits]),
  );

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const fetchWordChallenge = async () => {
        try {
          const nextChallenges = await getChallengesForMain();
          const nextWordChallenge =
            nextChallenges.find((challenge) => challenge.goalType === 'WORD_COUNT') ?? null;

          if (!mounted) return;

          if (nextWordChallenge) {
            setWordChallenge(nextWordChallenge);
            return;
          }

          const management = normalizeChallengeManagement(await getMyChallenges());

          if (!mounted) return;

          setWordChallenge(
            management.completedChallenges
              .map(toMainChallenge)
              .find((challenge) => challenge.goalType === 'WORD_COUNT') ?? null,
          );
        } catch {
          if (mounted) setWordChallenge(null);
        }
      };

      void fetchWordChallenge();

      return () => {
        mounted = false;
      };
    }, []),
  );

  const moveToStudy = (unit: VocabUnit) => {
    router.push({
      pathname: '/(app)/learning/vocab/study',
      params: {
        level: unit.level,
        unitNumber: String(unit.unitNumber),
        unitName: unit.unitName,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="단어장" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-y-3 p-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-regular text-xs text-text-brown">단어 학습하기</Text>
        <Pressable
          className="flex-row items-center justify-between rounded-sm border border-border bg-white px-4 py-3"
          onPress={() => setModalVisible(true)}
        >
          <Text className="font-semiBold text-base text-btn-dark">{selectedLevel}</Text>
          <Text className="font-regular text-sm text-text-brown">∨</Text>
        </Pressable>

        {isLoading ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-text-brown">단어 유닛을 불러오는 중...</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-[#DC2626]">{errorMessage}</Text>
            <Pressable
              className="mt-3 self-start rounded-sm bg-btn-dark px-4 py-2"
              onPress={() => void fetchUnits()}
            >
              <Text className="font-semiBold text-xs text-white">다시 시도</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !errorMessage && units.length === 0 ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-text-brown">
              등록된 단어 유닛이 없습니다.
            </Text>
          </View>
        ) : null}

        {!isLoading &&
          !errorMessage &&
          units.map((unit) => {
            const statusStyle = statusStyleMap[unit.status] ?? statusStyleMap.BEFORE;

            return (
              <Pressable
                key={`${unit.level}-${unit.unitNumber}`}
                className="rounded-sm border border-border bg-white p-4"
                onPress={() => moveToStudy(unit)}
              >
                <Text className="font-semiBold mb-1.5 text-base text-btn-dark">
                  {unit.unitName}
                </Text>
                <View className="mb-2.5 flex-row items-center justify-between">
                  <Text className="font-regular text-xs" style={{ color: statusStyle.color }}>
                    {unit.statusText}
                  </Text>
                  <Text className="font-regular text-xs text-text-brown">단어보기 →</Text>
                </View>
                <View className="h-0.5 rounded-full bg-border">
                  <View
                    className="h-0.5 rounded-full"
                    style={{
                      width: `${statusStyle.progress * 100}%`,
                      backgroundColor: statusStyle.color,
                    }}
                  />
                </View>
              </Pressable>
            );
          })}

        {wordChallenge ? (
          <>
            <Text className="mt-2 font-regular text-xs text-text-brown">챌린지 단어</Text>
            <Pressable
              className="rounded-sm border border-border bg-white p-4"
              onPress={() => {
                if (isChallengeAchieved(wordChallenge)) {
                  router.push('/(app)/mypage/challenge');
                  return;
                }

                router.push({
                  pathname: '/(app)/learning/vocab/study',
                  params: {
                    challenge: 'true',
                    unitName: '챌린지 단어',
                  },
                });
              }}
            >
              <Text className="font-semiBold mb-1 text-base text-btn-dark">
                {isChallengeAchieved(wordChallenge)
                  ? '오늘의 단어 챌린지를 이미 달성했어요'
                  : wordChallenge.title}
              </Text>
              <Text className="mb-2 font-regular text-xs text-text-brown">
                목표 {wordChallenge.targetValue}개 · 현재 {wordChallenge.currentValue}개
              </Text>
              <Text className="self-end font-regular text-xs text-text-brown">
                {isChallengeAchieved(wordChallenge) ? '챌린지 보기 →' : '단어보기 →'}
              </Text>
            </Pressable>
          </>
        ) : null}

        <Text className="mt-2 font-regular text-xs text-text-brown">북마크한 단어</Text>
        <Pressable
          className="rounded-sm border border-border bg-white p-4"
          onPress={() => router.push('/(app)/learning/vocab/bookmarked')}
        >
          <Text className="font-semiBold mb-2 text-base text-btn-dark">북마크</Text>
          <Text className="self-end font-regular text-xs text-text-brown">보러가기 →</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          className="flex-1 items-center justify-center bg-black/35"
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            className="w-4/5 rounded-lg border border-border bg-white p-4"
            onPress={() => {}}
          >
            <Text className="font-semiBold mb-3 text-base text-btn-dark">급수 선택</Text>
            {levels.map((level) => (
              <Pressable
                key={level}
                className="flex-row items-center justify-between border-b border-bg-strong py-3"
                onPress={() => {
                  setSelectedLevel(level);
                  setModalVisible(false);
                }}
              >
                <Text className="font-regular text-base text-btn-dark">{level}</Text>
                <View
                  className="h-5 w-5 items-center justify-center rounded-full border-2"
                  style={{ borderColor: selectedLevel === level ? '#2A2018' : '#E0D8C8' }}
                >
                  {selectedLevel === level ? (
                    <View className="h-2.5 w-2.5 rounded-full bg-btn-dark" />
                  ) : null}
                </View>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
