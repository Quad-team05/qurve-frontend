import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

const GREEN = '#059669';

const ProfileIcon = () => (
  <Svg width={56} height={56} viewBox="0 0 56 56">
    <Circle cx={28} cy={28} r={27} fill="white" stroke="#E0D8C8" strokeWidth={1.5} />
    <Circle cx={28} cy={22} r={9} fill="#2A2018" />
    <Path d="M8 48 C8 36 48 36 48 48" fill="#2A2018" />
  </Svg>
);

export default function MyPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="마이페이지" showBackButton={false} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 카드 */}
        <View className="rounded-sm border border-border bg-white p-4">
          <View className="flex-row items-center gap-x-3.5">
            <ProfileIcon />
            <View className="flex-1">
              <Text className="font-semiBold text-base text-btn-dark">선정</Text>
              <Text className="mt-0.5 font-regular text-xs text-text-brown">
                sunjeong2201@gmail.com
              </Text>
              <Pressable
                className="mt-2 self-start rounded-sm border border-border bg-bg px-2.5 py-1"
                onPress={() => router.push('/(app)/mypage/profile-edit')}
              >
                <Text className="font-regular text-xs text-text-brown">정보수정</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 학습 현황 레이블 */}
        <Text className="font-regular text-xs text-text-brown">학습 현황</Text>

        {/* 챌린지 달성률 카드 */}
        <View className="rounded-sm border border-border bg-white p-4">
          <Text className="mb-2 font-regular text-xs text-text-brown">챌린지 달성률</Text>
          <Text className="font-semiBold text-3xl text-btn-dark">32%</Text>
          <View className="mt-3 h-0.5 rounded-full bg-[#EDE8DE]">
            <View className="h-0.5 w-[32%] rounded-full" style={{ backgroundColor: GREEN }} />
          </View>
        </View>

        {/* 메뉴 리스트 */}
        <View className="overflow-hidden rounded-sm border border-border bg-white">
          <Pressable
            className="flex-row items-center justify-between border-b border-border px-4 py-4"
            onPress={() => router.push('/(app)/mypage/challenge')}
          >
            <View className="flex-row items-center gap-x-3">
              <Text style={{ fontSize: 18 }}>🏆</Text>
              <Text className="font-regular text-sm text-btn-dark">챌린지 관리</Text>
            </View>
            <Text className="font-regular text-sm text-text-brown">›</Text>
          </Pressable>

          <Pressable
            className="flex-row items-center justify-between border-b border-border px-4 py-4"
            onPress={() => router.replace('/(app)/auth/login')}
          >
            <View className="flex-row items-center gap-x-3">
              <Text style={{ fontSize: 18 }}>🔒</Text>
              <Text className="font-regular text-sm text-btn-dark">로그아웃</Text>
            </View>
            <Text className="font-regular text-sm text-text-brown">›</Text>
          </Pressable>

          <Pressable
            className="flex-row items-center justify-between px-4 py-4"
            onPress={() => setShowModal(true)}
          >
            <View className="flex-row items-center gap-x-3">
              <Text style={{ fontSize: 18 }}>❌</Text>
              <Text className="font-regular text-sm" style={{ color: '#CC4444' }}>
                회원 탈퇴
              </Text>
            </View>
            <Text className="font-regular text-sm text-text-brown">›</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 탈퇴 확인 팝업 */}
      <Modal visible={showModal} transparent animationType="fade">
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => setShowModal(false)}
        >
          <Pressable
            className="w-[280px] rounded-lg border border-border bg-white p-6"
            onPress={() => {}}
          >
            <Text className="font-semiBold mb-2.5 text-center text-base text-btn-dark">
              탈퇴 하시겠습니까?
            </Text>
            <Text className="mb-5 text-center font-regular text-xs text-text-brown">
              탈퇴 시 저장된 모든 데이터가 삭제되며{'\n'}삭제된 데이터는 복구가 불가합니다.
            </Text>
            <View className="flex-row gap-x-2.5">
              <Pressable
                className="flex-1 items-center rounded-sm border py-3"
                style={{ borderColor: '#CC4444' }}
                onPress={() => router.replace('/(app)/auth/login')}
              >
                <Text className="font-semiBold text-sm" style={{ color: '#CC4444' }}>
                  탈퇴
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-sm bg-btn-dark py-3"
                onPress={() => setShowModal(false)}
              >
                <Text className="font-semiBold text-sm text-white">취소</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
