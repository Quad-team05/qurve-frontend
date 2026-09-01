import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { getTodayLearning, type TodayLearning } from '@/lib/api/learning';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

        <View className="relative items-center pt-[8px]">
          <View className="absolute top-0 z-10 h-[10px] w-[50px] rounded-[1px] bg-[#B8E8C0]" />
          <Pressable
            className="w-full rounded-sm border border-border bg-white p-4"
            onPress={() => moveTo('/(app)/mypage/challenge')}
          >
            <Text className="mb-1 font-regular text-xs text-text-brown">나의 챌린지</Text>
            <Text className="font-bold text-lg text-btn-dark">매일 단어 20개</Text>
            <Text className="mt-2 self-end font-bold text-sm text-text-brown">학습하기 →</Text>
          </Pressable>
        </View>

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
