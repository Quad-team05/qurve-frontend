import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import {
  BADGE_CATEGORY_ORDER,
  getBadgeCategoryLabel,
  getMyBadges,
  type BadgeItem,
} from '@/lib/api/badge';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

export default function BadgePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('출석');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [achievedCount, setAchievedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        setIsLoading(true);
        const result = await getMyBadges();
        setBadges(result.badges);
        setTotalCount(result.totalCount);
        setAchievedCount(result.achievedCount);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearAuthSession();
          router.replace('/(app)/auth/login');
          return;
        }

        showToast('배지 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadBadges();
  }, [router]);

  const badgeCategories = useMemo(() => {
    const availableCategories = new Set(badges.map((badge) => badge.category));

    return [
      '전체',
      ...BADGE_CATEGORY_ORDER.filter((category) => availableCategories.has(category)).map(
        (category) => getBadgeCategoryLabel(category),
      ),
    ];
  }, [badges]);

  const filteredBadges = useMemo(
    () =>
      selectedCategory === '전체'
        ? badges
        : badges.filter((badge) => getBadgeCategoryLabel(badge.category) === selectedCategory),
    [badges, selectedCategory],
  );

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
              <Text className="ml-1 font-regular text-sm text-text-brown">/ {totalCount}개</Text>
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
          {isLoading ? (
            <View className="w-full py-10">
              <Text className="text-center font-regular text-sm text-text-brown">
                배지 정보를 불러오는 중...
              </Text>
            </View>
          ) : null}
          {filteredBadges.map((badge) => (
            <Pressable
              key={badge.code}
              onPress={() => {
                if (badge.achieved) {
                  setSelectedBadge(badge);
                }
              }}
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
                {badge.emoji}
              </Text>

              {/*배지 텍스트*/}
              <Text
                className={`mt-3 text-center font-bold text-xs ${
                  badge.achieved ? 'text-btn-dark' : 'text-[#B7AE9F]'
                }`}
              >
                {badge.name}
              </Text>
              {badge.achieved ? (
                <View className="mt-1 self-center rounded-full bg-[#059669] px-1 py-[1px]">
                  <Text className="text-[10px] text-white">✓</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
          {!isLoading && filteredBadges.length === 0 ? (
            <View className="w-full py-10">
              <Text className="text-center font-regular text-sm text-text-brown">
                표시할 배지가 없습니다.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/*배지 획득 모달*/}
      <Modal visible={selectedBadge !== null} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 px-12">
          <View className="relative h-[288px] w-full max-w-[281px] rounded-2xl bg-white px-5 pb-7 pt-6">
            <View
              className="absolute h-[13px] w-[50px] rounded-b-sm bg-[#FFE566] opacity-80"
              style={{ left: '50%', top: -6.5, marginLeft: -10 }}
            />
            <Text className="text-center" style={{ fontSize: 60 }}>
              {selectedBadge?.emoji}
            </Text>
            <Text className="font-semiBold mt-4 text-center text-[11px] text-[#059669]">
              MY BADGE
            </Text>
            <Text className="mt-1 text-center font-bold text-lg text-btn-dark">
              {selectedBadge?.name}
            </Text>
            <Text className="mt-1 text-center font-regular text-sm text-text-brown">
              {selectedBadge?.description}
            </Text>

            <Pressable
              className="mt-5 h-11 w-full rounded-lg bg-[#0F9B68] py-3"
              onPress={() => setSelectedBadge(null)}
            >
              <Text className="font-semiBold text-center text-sm text-white">확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
