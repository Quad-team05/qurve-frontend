import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import {
  CHALLENGE_GOAL_TYPE_ICONS,
  CHALLENGE_GOAL_TYPE_LABELS,
  CHALLENGE_GOAL_TYPE_SETTING_DESCRIPTIONS,
  getChallengeGoalTypes,
  type ChallengeGoalType,
  type ChallengeGoalTypeCode,
} from '@/lib/api/challenge';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';

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

export default function CreateGoalSelectPage() {
  const router = useRouter();
  const [goalTypes, setGoalTypes] = useState<ChallengeGoalType[]>([]);
  const [selectedCode, setSelectedCode] = useState<ChallengeGoalTypeCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadGoalTypes = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const result = await getChallengeGoalTypes();

        if (!mounted) return;

        setGoalTypes(result);
        setSelectedCode(result[0]?.code ?? null);
      } catch {
        if (!mounted) return;

        setErrorMessage('챌린지 목표 유형을 불러오지 못했습니다.');
        showToast('챌린지 목표 유형을 불러오지 못했습니다.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadGoalTypes();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedGoal = goalTypes.find((goal) => goal.code === selectedCode);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="챌린지 추가" />
      <StepBar step={1} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-semiBold mb-1.5 text-xl text-btn-dark">어떤 목표를 세워볼까요?</Text>
        <Text className="mb-6 font-regular text-sm text-text-brown">
          원하는 챌린지 유형을 선택해 보세요.
        </Text>

        {isLoading && (
          <View className="mb-7 rounded-sm border border-border bg-white p-5">
            <Text className="text-center font-regular text-sm text-text-brown">
              목표 유형을 불러오는 중입니다.
            </Text>
          </View>
        )}

        {!isLoading && errorMessage ? (
          <View className="mb-7 rounded-sm border border-border bg-white p-5">
            <Text className="text-center font-regular text-sm text-text-brown">{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && goalTypes.length === 0 && (
          <View className="mb-7 rounded-sm border border-border bg-white p-5">
            <Text className="text-center font-regular text-sm text-text-brown">
              선택할 수 있는 목표 유형이 없습니다.
            </Text>
          </View>
        )}

        <View className="mb-7 flex-row flex-wrap gap-3">
          {goalTypes.map((g) => (
            <Pressable
              key={g.code}
              style={{
                width: '47%',
                backgroundColor: selectedCode === g.code ? GREEN_LIGHT : '#fff',
                borderWidth: 1.5,
                borderColor: selectedCode === g.code ? GREEN : '#E0D8C8',
                borderRadius: 8,
                padding: 16,
                alignItems: 'center',
                gap: 8,
              }}
              onPress={() => setSelectedCode(g.code)}
            >
              <Text style={{ fontSize: 26 }}>{CHALLENGE_GOAL_TYPE_ICONS[g.code] ?? '✓'}</Text>
              <Text className="font-semiBold text-center text-sm text-btn-dark">
                {CHALLENGE_GOAL_TYPE_LABELS[g.code] ?? g.description}
              </Text>
              <Text className="text-center font-regular" style={{ fontSize: 10, color: '#A09080' }}>
                {CHALLENGE_GOAL_TYPE_SETTING_DESCRIPTIONS[g.code] ?? g.description}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 다음 버튼 */}
        <Pressable
          style={{
            backgroundColor: selectedCode ? GREEN : '#C8C0B0',
            borderRadius: 8,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          disabled={!selectedCode}
          onPress={() => {
            if (!selectedCode || !selectedGoal) return;

            router.push({
              pathname: '/(app)/mypage/challenge/create-goal-settings',
              params: {
                goalType: selectedCode,
                goalLabel: CHALLENGE_GOAL_TYPE_LABELS[selectedCode] ?? selectedGoal.description,
                goalDescription:
                  CHALLENGE_GOAL_TYPE_SETTING_DESCRIPTIONS[selectedCode] ??
                  selectedGoal.description,
              },
            });
          }}
        >
          <Text className="font-semiBold text-sm text-white">다음</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
