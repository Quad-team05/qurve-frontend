import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BadgeCategory = '전체' | '출석' | '학습' | '정답률' | '오답노트' | '단어';

type BadgeItem = {
  id: string;
  category: Exclude<BadgeCategory, '전체'>;
  icon: string;
  title: string;
  achieved: boolean;
};

const badgeCategories: BadgeCategory[] = ['전체', '출석', '학습', '정답률', '오답노트', '단어'];

const badges: BadgeItem[] = [
  { id: 'attendance-1', category: '출석', icon: '🐣', title: '첫 발걸음', achieved: true },
  { id: 'attendance-3', category: '출석', icon: '🐥', title: '3일 개근', achieved: true },
  { id: 'attendance-7', category: '출석', icon: '🐔', title: '7일 개근', achieved: true },
  { id: 'attendance-30', category: '출석', icon: '🦅', title: '30일 개근', achieved: false },
  { id: 'attendance-100', category: '출석', icon: '🦁', title: '100일 개근', achieved: false },
  { id: 'attendance-365', category: '출석', icon: '🐉', title: '365일 개근', achieved: false },
];

export default function BadgePage() {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory>('출석');
  const [showNewBadgeModal, setShowNewBadgeModal] = useState(true);

  const filteredBadges =
    selectedCategory === '전체'
      ? badges
      : badges.filter((badge) => badge.category === selectedCategory);

  const achievedCount = badges.filter((badge) => badge.achieved).length;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="나의 배지" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-[18px] pb-8 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/*달성 현황 카드*/}
        <View className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3">
          <Text className="font-regular text-[10px] text-[#059669]">배지 달성 현황</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-end pb-[10px]">
              <Text className="font-bold text-[22px] text-btn-dark">{achievedCount}개</Text>
              <Text className="ml-1 font-regular text-sm text-text-brown">/ 48개</Text>
            </View>
            <Text style={{ fontSize: 28 }}>🏅</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          className="mt-3"
          contentContainerClassName="flex-grow flex-row justify-center gap-x-2"
          showsHorizontalScrollIndicator={false}
        >
          {badgeCategories.map((category) => {
            const isSelected = category === selectedCategory;

            {
              /*카테고리 영역*/
            }
            return (
              <Pressable
                key={category}
                className={`rounded-[14px] border px-[14px] py-[6px] ${
                  isSelected ? 'border-btn-dark bg-btn-dark' : 'border-border bg-white'
                }`}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  className={`font-regular text-xs ${
                    isSelected ? 'text-white' : 'text-text-brown'
                  }`}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/*배지 목록 영역*/}
        <View className="mt-5 flex-row flex-wrap justify-between px-3">
          {filteredBadges.map((badge) => (
            <View
              key={badge.id}
              className={`mb-3 h-[110px] w-[31%] rounded-xl border px-3 py-4 ${
                badge.achieved ? 'border-border bg-white' : 'border-border bg-[#F0EDE8]'
              }`}
            >
              <Text
                className="text-center"
                style={{
                  fontSize: 28,
                  opacity: badge.achieved ? 1 : 0.28,
                }}
              >
                {badge.icon}
              </Text>

              {/*배지 텍스트*/}
              <Text
                className={`mt-3 text-center font-bold text-xs ${
                  badge.achieved ? 'text-btn-dark' : 'text-[#B7AE9F]'
                }`}
              >
                {badge.title}
              </Text>
              {badge.achieved ? (
                <View className="mt-1 self-center rounded-full bg-[#059669] px-1 py-[1px]">
                  <Text className="text-[10px] text-white">✓</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>

      {/*배지 획득 모달*/}
      <Modal visible={showNewBadgeModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 px-12">
          <View className="relative h-[288px] w-full max-w-[281px] rounded-2xl bg-white px-5 pb-7 pt-6">
            <View
              className="absolute h-[13px] w-[50px] rounded-b-sm bg-[#FFE566] opacity-80"
              style={{ left: '50%', top: -6.5, marginLeft: -10 }}
            />
            <Text className="text-center" style={{ fontSize: 60 }}>
              🐔
            </Text>
            <Text className="font-semiBold mt-4 text-center text-[11px] text-[#059669]">
              NEW BADGE!
            </Text>
            <Text className="mt-1 text-center font-bold text-lg text-btn-dark">7일 개근</Text>
            <Text className="mt-1 text-center font-regular text-sm text-text-brown">
              7일 개근 배지를 달성했어요! 🎉
            </Text>

            <Pressable
              className="mt-5 h-11 w-full rounded-lg bg-[#0F9B68] py-3"
              onPress={() => setShowNewBadgeModal(false)}
            >
              <Text className="font-semiBold text-center text-sm text-white">확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
