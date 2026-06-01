import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const goals = [
  { icon: '🔥', title: '하루 학습 시간', sub: '매일 일정 시간 학습' },
  { icon: '📘', title: '단어 암기', sub: '매일 단어 암기 목표' },
  { icon: '📝', title: '문장 학습', sub: '매일 문장 학습 목표' },
  { icon: '📖', title: '읽기 학습', sub: '매일 읽기 학습 목표' },
  { icon: '🎧', title: '듣기 학습', sub: '매일 듣기 학습 목표' },
  { icon: '🔄', title: '복습하기', sub: '복습 목표 설정' },
];

export default function CreateGoalSelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(0);

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

        {/* 2x3 그리드 */}
        <View className="mb-3 flex-row flex-wrap gap-3">
          {goals.map((g, i) => (
            <Pressable
              key={i}
              style={{
                width: '47%',
                backgroundColor: selected === i ? GREEN_LIGHT : '#fff',
                borderWidth: 1.5,
                borderColor: selected === i ? GREEN : '#E0D8C8',
                borderRadius: 8,
                padding: 16,
                alignItems: 'center',
                gap: 8,
              }}
              onPress={() => setSelected(i)}
            >
              <Text style={{ fontSize: 26 }}>{g.icon}</Text>
              <Text className="font-semiBold text-center text-sm text-btn-dark">{g.title}</Text>
              <Text className="text-center font-regular" style={{ fontSize: 10, color: '#A09080' }}>
                {g.sub}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 나만의 목표 */}
        <Pressable
          className="mb-7 flex-row items-center gap-x-3 rounded-lg border border-border bg-white p-4"
          onPress={() => setSelected(6)}
          style={{
            borderColor: selected === 6 ? GREEN : '#E0D8C8',
            backgroundColor: selected === 6 ? GREEN_LIGHT : '#fff',
          }}
        >
          <Text style={{ fontSize: 22 }}>📍</Text>
          <View>
            <Text className="font-semiBold text-sm text-btn-dark">나만의 목표</Text>
            <Text className="font-regular text-xs text-text-brown">직접 목표를 설정해 보세요.</Text>
          </View>
        </Pressable>

        {/* 다음 버튼 */}
        <Pressable
          style={{
            backgroundColor: GREEN,
            borderRadius: 8,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          onPress={() => router.push('/(app)/mypage/challenge/create-goal-settings')}
        >
          <Text className="font-semiBold text-sm text-white">다음</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
