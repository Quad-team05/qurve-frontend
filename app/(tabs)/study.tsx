import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import {
  CHALLENGE_GOAL_TYPE_TARGET_UNITS,
  getChallengesForMain,
  getMyChallenges,
  normalizeChallengeManagement,
  type ChallengeMain,
} from '@/lib/api/challenge';
import { ApiError } from '@/lib/api/client';
import { getTodayLearning, type TodayLearning } from '@/lib/api/learning';
import { clearAuthSession } from '@/lib/auth/session';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Goal = 'JLPT' | '실생활 일본어';
type JlptLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
type LifeLevel = 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5';
type Level = JlptLevel | LifeLevel;

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

function getProgressBarWidth(progressRate: number) {
  return `${Math.max(0, Math.min(100, progressRate))}%` as `${number}%`;
}

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

function Radio({ selected }: { selected: boolean }) {
  return (
    <View
      className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
        selected ? 'border-btn-dark' : 'border-border'
      }`}
    >
      {selected && <View className="h-2.5 w-2.5 rounded-full bg-btn-dark" />}
    </View>
  );
}

function GoalModal({
  visible,
  currentGoal,
  currentJlptLevel,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  currentGoal: Goal;
  currentJlptLevel: JlptLevel;
  onClose: () => void;
  onConfirm: (goal: Goal, jlptLevel: JlptLevel) => void;
}) {
  const [selectedGoal, setSelectedGoal] = useState<Goal>(currentGoal);
  const [selectedJlptLevel, setSelectedJlptLevel] = useState<JlptLevel>(currentJlptLevel);

  const goals: Goal[] = ['JLPT', '실생활 일본어'];
  const jlptLevels: JlptLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

  useEffect(() => {
    if (!visible) return;
    setSelectedGoal(currentGoal);
    setSelectedJlptLevel(currentJlptLevel);
  }, [visible, currentGoal, currentJlptLevel]);

  const handleGoalChange = (goal: Goal) => {
    setSelectedGoal(goal);
    if (goal === 'JLPT') {
      setSelectedJlptLevel(currentJlptLevel);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable className="flex-1 items-center justify-center bg-black/35" onPress={onClose}>
        <Pressable
          className="w-4/5 rounded-lg border border-border bg-white p-4"
          onPress={() => {}}
        >
          <Text className="mb-2 mt-1 font-regular text-xs text-text-brown">학습 목적 선택</Text>
          {goals.map((g) => (
            <Pressable
              key={g}
              className="flex-row items-center justify-between border-b border-bg-strong py-3"
              onPress={() => handleGoalChange(g)}
            >
              <Text className="font-regular text-base text-btn-dark">{g}</Text>
              <Radio selected={selectedGoal === g} />
            </Pressable>
          ))}

          {selectedGoal === 'JLPT' && (
            <>
              <Text className="mb-2 mt-5 font-regular text-xs text-text-brown">JLPT 급수 선택</Text>
              {jlptLevels.map((l) => (
                <Pressable
                  key={l}
                  className="flex-row items-center justify-between border-b border-bg-strong py-3"
                  onPress={() => setSelectedJlptLevel(l)}
                >
                  <Text className="font-regular text-base text-btn-dark">{l}</Text>
                  <Radio selected={selectedJlptLevel === l} />
                </Pressable>
              ))}
            </>
          )}

          <Pressable
            className="mt-5 items-center rounded-sm bg-btn-dark py-3"
            onPress={() => onConfirm(selectedGoal, selectedJlptLevel)}
          >
            <Text className="font-semoBold text-base text-white">확인</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function StudyPage() {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal>('JLPT');
  const [jlptLevel, setJlptLevel] = useState<JlptLevel>('N3');
  // TODO: 사용자 정보 API 연동 예정 - 레벨테스트 결과값
  const lifeLevel: LifeLevel = 'Level 2';
  const [modalVisible, setModalVisible] = useState(false);
  const [todayLearning, setTodayLearning] = useState<TodayLearning | null>(null);
  const [mainChallenges, setMainChallenges] = useState<ChallengeMain[]>([]);
  const [isChallengeLoading, setIsChallengeLoading] = useState(true);
  const [challengeErrorMessage, setChallengeErrorMessage] = useState('');
  const hasLoadedChallenges = useRef(false);

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

  const loadMainChallenges = useCallback(async () => {
    try {
      if (!hasLoadedChallenges.current) {
        setIsChallengeLoading(true);
      }
      setChallengeErrorMessage('');
      const result = await getChallengesForMain();

      if (result.length > 0) {
        setMainChallenges(result);
      } else {
        const management = normalizeChallengeManagement(await getMyChallenges());
        setMainChallenges(management.completedChallenges.map(toMainChallenge));
      }
      hasLoadedChallenges.current = true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }

      const message =
        error instanceof ApiError ? error.message : '챌린지 정보를 불러오지 못했습니다.';
      setChallengeErrorMessage(message);
      showToast(message);
    } finally {
      setIsChallengeLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      void loadMainChallenges();
    }, [loadMainChallenges]),
  );

  const handleConfirm = (newGoal: Goal, newJlptLevel: JlptLevel) => {
    setGoal(newGoal);
    if (newGoal === 'JLPT') {
      setJlptLevel(newJlptLevel);
    }
    setModalVisible(false);
  };

  const moveTo = (href: Href) => {
    router.push(href);
  };

  const isLife = goal === '실생활 일본어';
  const displayLevel: Level = isLife ? lifeLevel : jlptLevel;
  const nonWordChallenges = mainChallenges.filter(
    (challenge) => challenge.goalType !== 'WORD_COUNT',
  );
  const primaryChallenge =
    nonWordChallenges.find((challenge) => !isChallengeAchieved(challenge)) ?? nonWordChallenges[0];
  const isPrimaryChallengeAchieved = primaryChallenge
    ? isChallengeAchieved(primaryChallenge)
    : false;
  const primaryChallengeUnit = primaryChallenge
    ? CHALLENGE_GOAL_TYPE_TARGET_UNITS[primaryChallenge.goalType]
    : '';
  const wordChallenge = mainChallenges.find((challenge) => challenge.goalType === 'WORD_COUNT');
  const isWordChallengeAchieved = wordChallenge ? isChallengeAchieved(wordChallenge) : false;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="학습하기" showBackButton={false} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-6 gap-y-2.5"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-1.5 font-regular text-xs text-text-brown">
          학습하기 카드를 눌러 학습 목표와 단계를 변경할 수 있어요.
        </Text>

        <View className="flex-row gap-x-2.5">
          <View className="relative flex-1 items-center pt-[8px]">
            <View className="absolute right-4 top-0 z-10 h-[10px] w-[24px] rounded-[1px] bg-[#FFE566]" />
            <Pressable
              className="h-[80px] w-full rounded-sm border border-border bg-white p-4"
              onPress={() => setModalVisible(true)}
            >
              <Text className="mb-1 font-regular text-xs text-text-brown">1. 내 학습 목적</Text>
              <Text className={`font-bold text-btn-dark ${isLife ? 'text-2xl' : 'text-3xl'}`}>
                {goal}
              </Text>
            </Pressable>
          </View>

          <View className="relative flex-1 items-center pt-[8px]">
            <View className="absolute right-4 top-0 z-10 h-[10px] w-[24px] rounded-[1px] bg-[#B8D4F0]" />
            <Pressable
              className="h-[80px] w-full rounded-sm border border-border bg-white p-4"
              onPress={() => setModalVisible(true)}
            >
              <Text className="mb-1 font-regular text-xs text-text-brown">2. 내 학습 단계</Text>
              <Text className="font-bold text-3xl text-btn-dark">{displayLevel}</Text>
            </Pressable>
          </View>
        </View>

        {primaryChallenge || isChallengeLoading || challengeErrorMessage ? (
          <View className="relative items-center pt-[8px]">
            <View className="absolute top-0 z-10 h-[10px] w-[50px] rounded-[1px] bg-[#B8E8C0]" />
            <Pressable
              className="w-full rounded-sm border border-border bg-white p-4"
              onPress={() => moveTo('/(app)/mypage/challenge')}
            >
              <Text className="mb-1 font-regular text-xs text-text-brown">나의 챌린지</Text>
              <Text className="font-bold text-lg text-btn-dark">
                {isChallengeLoading && mainChallenges.length === 0
                  ? '불러오는 중...'
                  : challengeErrorMessage
                    ? '챌린지 정보를 확인해주세요'
                    : primaryChallenge
                      ? isPrimaryChallengeAchieved
                        ? '오늘의 챌린지를 이미 달성했어요'
                        : primaryChallenge.title
                      : '진행 중인 챌린지가 없어요'}
              </Text>
              {primaryChallenge && !isChallengeLoading && !challengeErrorMessage && (
                <>
                  <View className="mt-2 flex-row items-center justify-between">
                    <Text className="font-regular text-xs text-text-brown">목표 달성률</Text>
                    <Text className="font-regular text-xs text-text-brown">
                      {primaryChallenge.progressRate}%
                    </Text>
                  </View>
                  <View className="mt-1.5 h-0.5 rounded-full bg-black/10">
                    <View
                      className="h-0.5 rounded-full bg-[#059669]"
                      style={{ width: getProgressBarWidth(primaryChallenge.progressRate) }}
                    />
                  </View>
                  {isPrimaryChallengeAchieved ? (
                    <Text className="mt-1.5 font-regular text-xs text-text-brown">
                      {primaryChallenge.title}
                    </Text>
                  ) : (
                    <Text className="mt-1.5 font-regular text-xs text-text-brown">
                      {primaryChallenge.currentValue}/{primaryChallenge.targetValue}
                      {primaryChallengeUnit}
                    </Text>
                  )}
                </>
              )}
              <Text className="mt-2 self-end font-bold text-sm text-text-brown">챌린지 설정 →</Text>
            </Pressable>
          </View>
        ) : null}

        {wordChallenge && !isChallengeLoading && !challengeErrorMessage ? (
          <View className="relative items-center pt-[8px]">
            <View className="absolute top-0 z-10 h-[10px] w-[50px] rounded-[1px] bg-[#C7E8FF]" />
            <Pressable
              className="w-full rounded-sm border border-border bg-white p-4"
              onPress={() => {
                if (isWordChallengeAchieved) {
                  moveTo('/(app)/mypage/challenge');
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
              <Text className="mb-1 font-regular text-xs text-text-brown">챌린지 단어 학습</Text>
              <Text className="font-bold text-lg text-btn-dark">
                {isWordChallengeAchieved
                  ? '오늘의 단어 챌린지를 이미 달성했어요'
                  : wordChallenge.title}
              </Text>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="font-regular text-xs text-text-brown">
                  {wordChallenge.currentValue}/{wordChallenge.targetValue}개
                </Text>
                <Text className="font-regular text-xs text-text-brown">
                  {wordChallenge.progressRate}%
                </Text>
              </View>
              <View className="mt-1.5 h-0.5 rounded-full bg-black/10">
                <View
                  className="h-0.5 rounded-full bg-[#2563EB]"
                  style={{ width: getProgressBarWidth(wordChallenge.progressRate) }}
                />
              </View>
              <Text className="mt-2 self-end font-bold text-sm text-text-brown">
                {isWordChallengeAchieved ? '챌린지 보기 →' : '학습하기 →'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View className="relative items-center pt-[8px]">
          <View className="absolute top-0 z-10 h-[10px] w-[50px] rounded-[1px] bg-[#F9C8D8]" />
          <Pressable
            className="w-full rounded-sm border border-border bg-white p-4"
            onPress={() => moveTo('/(app)/learning/problems/today')}
          >
            <Text className="mb-1 font-regular text-xs text-text-brown">오늘의 학습</Text>
            <Text className="font-bold text-lg text-btn-dark">
              {todayLearning
                ? `${todayLearning.category} · ${todayLearning.title}`
                : '문자/어휘 · 문맥규정'}
            </Text>
            <Text className="mt-0.5 font-regular text-xs text-text-brown">
              총 {todayLearning?.totalQuestionCount ?? 20}문제 · 예상{' '}
              {todayLearning?.estimatedMinutes ?? 10}분
            </Text>
            <Text className="mt-2 self-end font-bold text-sm text-text-brown">학습하기 →</Text>
          </Pressable>
        </View>

        <View className="flex-row gap-x-2.5">
          <Pressable
            className="flex-1 rounded-sm bg-[#EAE2FF] p-3"
            onPress={() => moveTo('/(app)/learning/wrong-note/list')}
          >
            <Text className="mb-1 font-regular text-xs text-[#8B5EA9]">오답노트</Text>
            <Text className="font-bold text-3xl text-[#6F3E93]">7개</Text>
            <Text className="mt-0.5 font-regular text-xs text-[#A67ABD]">북마크 문제</Text>
          </Pressable>

          <Pressable
            className="flex-1 rounded-sm bg-[#FFF9E9] p-3"
            onPress={() => moveTo('/(app)/learning/vocab/list')}
          >
            <Text className="mb-1 font-regular text-xs text-[#B9932D]">단어장</Text>
            <Text className="font-bold text-3xl text-[#967411]">{jlptLevel}</Text>
            <Text className="mt-0.5 font-regular text-xs text-[#C4A657]">UNIT 1 학습중</Text>
          </Pressable>
        </View>

        <View className="relative items-center pt-[8px]">
          <Pressable
            className="w-full rounded-sm bg-[#EEF8F4] p-4"
            onPress={() => moveTo('/(app)/learning/vocab/bookmarked')}
          >
            <Text className="mb-1 font-regular text-xs text-[#3A8F6A]">나의 단어장</Text>
            <Text className="font-bold text-3xl text-btn-dark">북마크 12개</Text>
            <View className="mt-2 h-1 rounded-full bg-[#BFDCCD]">
              <View className="h-1 w-2/5 rounded-full bg-[#059669]" />
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <GoalModal
        visible={modalVisible}
        currentGoal={goal}
        currentJlptLevel={jlptLevel}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirm}
      />
    </SafeAreaView>
  );
}
