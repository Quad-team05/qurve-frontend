import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Level = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

const units = [
  { unit: 'UNIT 1', status: '학습중', pct: 0.6, ac: '#D97706' },
  { unit: 'UNIT 2', status: '학습전', pct: 0, ac: '#C8C0B0' },
];

const levels: Level[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

export default function VocabListPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<Level>('N5');
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="단어장" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-3"
        showsVerticalScrollIndicator={false}
      >
        {/* N5 드롭다운 */}
        <Text className="font-regular text-xs text-text-brown">단어 학습하기</Text>
        <Pressable
          className="flex-row items-center justify-between rounded-sm border border-border bg-white px-4 py-3"
          onPress={() => setModalVisible(true)}
        >
          <Text className="font-semiBold text-base text-btn-dark">{selectedLevel}</Text>
          <Text className="font-regular text-sm text-text-brown">∨</Text>
        </Pressable>

        {/* UNIT 목록 */}
        {units.map((u, i) => (
          <Pressable
            key={i}
            className="rounded-sm border border-border bg-white p-4"
            onPress={() => router.push('/(app)/learning/vocab/study')}
          >
            <Text className="font-semiBold mb-1.5 text-base text-btn-dark">{u.unit}</Text>
            <View className="mb-2.5 flex-row items-center justify-between">
              <Text className="font-regular text-xs" style={{ color: u.ac }}>
                {u.status}
              </Text>
              <Text className="font-regular text-xs text-text-brown">단어보기 →</Text>
            </View>
            <View className="h-0.5 rounded-full bg-border">
              <View
                className="h-0.5 rounded-full"
                style={{ width: `${u.pct * 100}%`, backgroundColor: u.ac }}
              />
            </View>
          </Pressable>
        ))}

        {/* 챌린지 단어 */}
        <Text className="mt-2 font-regular text-xs text-text-brown">챌린지 단어</Text>
        <Pressable
          className="rounded-sm border border-border bg-white p-4"
          onPress={() => router.push('/(app)/mypage/challenge')}
        >
          <Text className="font-semiBold mb-1 text-base text-btn-dark">나의 챌린지</Text>
          <Text className="mb-2 font-regular text-xs text-text-brown">목표: 매일 단어 20개</Text>
          <Text className="self-end font-regular text-xs text-text-brown">단어보기 →</Text>
        </Pressable>

        {/* 북마크한 단어 */}
        <Text className="mt-2 font-regular text-xs text-text-brown">북마크한 단어</Text>
        <Pressable
          className="rounded-sm border border-border bg-white p-4"
          onPress={() => router.push('/(app)/learning/vocab/bookmarked')}
        >
          <Text className="font-semiBold mb-2 text-base text-btn-dark">북마크</Text>
          <Text className="self-end font-regular text-xs text-text-brown">보러가기 →</Text>
        </Pressable>
      </ScrollView>

      {/* 급수 선택 모달 */}
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
            {levels.map((lv) => (
              <Pressable
                key={lv}
                className="flex-row items-center justify-between border-b border-bg-strong py-3"
                onPress={() => {
                  setSelectedLevel(lv);
                  setModalVisible(false);
                }}
              >
                <Text className="font-regular text-base text-btn-dark">{lv}</Text>
                <View
                  className="h-5 w-5 items-center justify-center rounded-full border-2"
                  style={{ borderColor: selectedLevel === lv ? '#2A2018' : '#E0D8C8' }}
                >
                  {selectedLevel === lv && (
                    <View className="h-2.5 w-2.5 rounded-full bg-btn-dark" />
                  )}
                </View>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
