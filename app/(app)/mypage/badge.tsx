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

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_MID = '#A7F3D0';
const BORDER = '#E0D8C8';
const TEXT = '#2A2018';
const TEXT3 = '#A09080';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

export default function BadgePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
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

  const categories = useMemo(() => {
    const availableCategories = new Set(badges.map((badge) => badge.category));

    return [
      '전체',
      ...BADGE_CATEGORY_ORDER.filter((category) => availableCategories.has(category)).map(
        (category) => getBadgeCategoryLabel(category),
      ),
    ];
  }, [badges]);

  const filtered = useMemo(
    () =>
      activeTab === 0
        ? badges
        : badges.filter((badge) => getBadgeCategoryLabel(badge.category) === categories[activeTab]),
    [activeTab, badges, categories],
  );

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
              {achievedCount}개{' '}
              <Text className="font-regular text-sm text-text-brown">/ {totalCount}개</Text>
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
        {isLoading ? (
          <View style={{ paddingVertical: 40 }}>
            <Text className="text-center font-regular text-sm text-text-brown">
              배지 정보를 불러오는 중...
            </Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {filtered.map((b, i) => (
            <Pressable
              key={b.code}
              onPress={() => b.achieved && setSelectedBadge(b)}
              style={{
                width: '30%',
                backgroundColor: b.achieved ? '#fff' : '#F0EDE8',
                borderWidth: 0.5,
                borderColor: b.achieved ? BORDER : '#E8E4DE',
                borderRadius: 8,
                padding: 14,
                alignItems: 'center',
                gap: 6,
                opacity: b.achieved ? 1 : 0.5,
              }}
            >
              <Text style={{ fontSize: 28 }}>{b.emoji}</Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: b.achieved ? TEXT : TEXT3,
                  textAlign: 'center',
                  lineHeight: 14,
                }}
              >
                {b.name}
              </Text>
              {b.achieved && (
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
        {!isLoading && filtered.length === 0 ? (
          <View style={{ paddingVertical: 40 }}>
            <Text className="text-center font-regular text-sm text-text-brown">
              표시할 배지가 없습니다.
            </Text>
          </View>
        ) : null}
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
              <Text style={{ fontSize: 56, marginBottom: 12 }}>{selectedBadge?.emoji}</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: GREEN,
                  marginBottom: 6,
                  letterSpacing: 1,
                }}
              >
                MY BADGE
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 8 }}>
                {selectedBadge?.name}
              </Text>
              <Text style={{ fontSize: 12, color: TEXT3, marginBottom: 24 }}>
                {selectedBadge?.description}
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
