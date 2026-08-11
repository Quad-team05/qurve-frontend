import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_MID = '#A7F3D0';
const BORDER = '#E0D8C8';
const TEXT = '#2A2018';
const TEXT3 = '#A09080';

const allBadges = [
  { icon: '🐣', name: '첫 발걸음', cat: '출석', done: true },
  { icon: '🐥', name: '3일 개근', cat: '출석', done: true },
  { icon: '🐓', name: '7일 개근', cat: '출석', done: true },
  { icon: '🦅', name: '30일 개근', cat: '출석', done: false },
  { icon: '🦁', name: '100일 개근', cat: '출석', done: false },
  { icon: '🐉', name: '365일 개근', cat: '출석', done: false },
  { icon: '🌱', name: '첫 학습', cat: '학습', done: true },
  { icon: '🌿', name: '새싹 학습자', cat: '학습', done: true },
  { icon: '🌳', name: '성실한 학습자', cat: '학습', done: false },
  { icon: '🌲', name: '학습 고수', cat: '학습', done: false },
  { icon: '🎄', name: '학습 전설', cat: '학습', done: false },
  { icon: '🎯', name: '첫 정답', cat: '정답률', done: true },
  { icon: '🎪', name: '절반은 맞춰', cat: '정답률', done: true },
  { icon: '🎓', name: '우등생', cat: '정답률', done: false },
  { icon: '👑', name: '만점왕', cat: '정답률', done: false },
  { icon: '💥', name: '연속 만점', cat: '정답률', done: false },
  { icon: '🔍', name: '첫 복습', cat: '오답노트', done: true },
  { icon: '🔎', name: '복습 습관', cat: '오답노트', done: false },
  { icon: '🦾', name: '오답 극복', cat: '오답노트', done: false },
  { icon: '🧩', name: '오답 마스터', cat: '오답노트', done: false },
  { icon: '🌰', name: '단어 입문', cat: '단어', done: true },
  { icon: '🍀', name: '단어 수집가', cat: '단어', done: true },
  { icon: '🌺', name: '단어 마스터', cat: '단어', done: false },
  { icon: '🌸', name: '단어 박사', cat: '단어', done: false },
  { icon: '🌻', name: '단어 전설', cat: '단어', done: false },
  { icon: '🔖', name: '북마크 시작', cat: '단어', done: true },
  { icon: '📌', name: '북마크 수집가', cat: '단어', done: false },
  { icon: '🏁', name: '첫 도전', cat: '챌린지', done: true },
  { icon: '🥉', name: '도전 완료', cat: '챌린지', done: true },
  { icon: '🥈', name: '도전 중급', cat: '챌린지', done: false },
  { icon: '🥇', name: '도전 고수', cat: '챌린지', done: false },
  { icon: '🏆', name: '챌린지 왕', cat: '챌린지', done: false },
  { icon: '🎖️', name: '챌린지 전설', cat: '챌린지', done: false },
  { icon: '⏰', name: '첫 1시간', cat: '학습시간', done: true },
  { icon: '🕙', name: '10시간 돌파', cat: '학습시간', done: false },
  { icon: '🕔', name: '50시간 돌파', cat: '학습시간', done: false },
  { icon: '🕐', name: '100시간 돌파', cat: '학습시간', done: false },
  { icon: '⌚', name: '500시간 돌파', cat: '학습시간', done: false },
  { icon: '🚀', name: '첫 레벨업', cat: '급수', done: true },
  { icon: '🌱', name: 'N5 마스터', cat: '급수', done: false },
  { icon: '🌿', name: 'N4 마스터', cat: '급수', done: false },
  { icon: '🌳', name: 'N3 마스터', cat: '급수', done: false },
  { icon: '🌲', name: 'N2 마스터', cat: '급수', done: false },
  { icon: '🎋', name: 'N1 마스터', cat: '급수', done: false },
  { icon: '🎌', name: 'JLPT 정복자', cat: '급수', done: false },
  { icon: '💬', name: 'AI 첫 대화', cat: 'AI', done: true },
  { icon: '🗣️', name: 'AI 단골', cat: 'AI', done: false },
  { icon: '🤝', name: 'AI 친구', cat: 'AI', done: false },
];

const categories = [
  '전체',
  '출석',
  '학습',
  '정답률',
  '오답노트',
  '단어',
  '챌린지',
  '학습시간',
  '급수',
  'AI',
];

export default function BadgePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState<(typeof allBadges)[0] | null>(null);

  const filtered =
    activeTab === 0 ? allBadges : allBadges.filter((b) => b.cat === categories[activeTab]);
  const doneCnt = allBadges.filter((b) => b.done).length;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="나의 배지" />

      {/* 달성 현황 카드 */}
      <View className="px-4 pt-3">
        <View
          style={{
            backgroundColor: GREEN_LIGHT,
            borderWidth: 1,
            borderColor: GREEN_MID,
            borderRadius: 8,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text
              className="font-regular text-xs"
              style={{ color: GREEN, fontStyle: 'italic', marginBottom: 4 }}
            >
              배지 달성 현황
            </Text>
            <Text className="font-semiBold text-btn-dark" style={{ fontSize: 22 }}>
              {doneCnt}개 <Text className="font-regular text-sm text-text-brown">/ 48개</Text>
            </Text>
          </View>
          <Text style={{ fontSize: 32 }}>🏅</Text>
        </View>
      </View>

      {/* 카테고리 탭 */}
      <View style={{ height: 48 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 8,
            alignItems: 'center',
          }}
        >
          {categories.map((cat, i) => (
            <Pressable
              key={i}
              onPress={() => setActiveTab(i)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 5,
                borderRadius: 16,
                height: 28,
                backgroundColor: activeTab === i ? '#2A2018' : '#fff',
                borderWidth: 0.5,
                borderColor: activeTab === i ? '#2A2018' : BORDER,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: activeTab === i ? '#fff' : TEXT3,
                  fontWeight: activeTab === i ? '600' : '400',
                }}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 배지 그리드 */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {filtered.map((b, i) => (
            <Pressable
              key={i}
              onPress={() => b.done && setSelectedBadge(b)}
              style={{
                width: '30%',
                backgroundColor: b.done ? '#fff' : '#F0EDE8',
                borderWidth: 0.5,
                borderColor: b.done ? BORDER : '#E8E4DE',
                borderRadius: 8,
                padding: 14,
                alignItems: 'center',
                gap: 6,
                opacity: b.done ? 1 : 0.5,
              }}
            >
              <Text style={{ fontSize: 28 }}>{b.icon}</Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: b.done ? TEXT : TEXT3,
                  textAlign: 'center',
                  lineHeight: 14,
                }}
              >
                {b.name}
              </Text>
              {b.done && (
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: GREEN,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 9, color: '#fff' }}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* 배지 달성 팝업 */}
      <Modal visible={selectedBadge !== null} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => setSelectedBadge(null)}
        >
          <View style={{ position: 'relative', alignItems: 'center' }}>
            <View
              style={{
                position: 'absolute',
                top: -8,
                width: 50,
                height: 13,
                backgroundColor: '#FFE566',
                opacity: 0.8,
                borderRadius: 2,
                zIndex: 1,
              }}
            />
            <Pressable
              style={{
                width: 280,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 28,
                paddingTop: 36,
                alignItems: 'center',
                borderWidth: 0.5,
                borderColor: BORDER,
              }}
              onPress={() => {}}
            >
              <Text style={{ fontSize: 56, marginBottom: 12 }}>{selectedBadge?.icon}</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: GREEN,
                  marginBottom: 6,
                  letterSpacing: 1,
                }}
              >
                NEW BADGE!
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 8 }}>
                {selectedBadge?.name}
              </Text>
              <Text style={{ fontSize: 12, color: TEXT3, marginBottom: 24 }}>
                {selectedBadge?.name} 배지를 달성했어요! 🎉
              </Text>
              <Pressable
                style={{
                  backgroundColor: GREEN,
                  borderRadius: 8,
                  paddingVertical: 12,
                  width: '100%',
                  alignItems: 'center',
                }}
                onPress={() => setSelectedBadge(null)}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>확인</Text>
              </Pressable>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
