import TopBar from '@/components/ui/TopBar';
import { router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const cardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function FindIdPage() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="아이디 찾기" />

      <View className="flex-1 px-4 pt-[14px]">
        <View className="relative w-full border border-border bg-white p-4" style={cardShadowStyle}>
          <View className="absolute -top-[5px] left-[14px] z-10 h-[13px] w-[50px] rounded-[1px] bg-[#FFE566]" />
          <Text className="mb-1 text-xs font-medium text-[#A09080]">이름</Text>
          <TextInput
            placeholder="이름을 입력해주세요"
            placeholderTextColor="#C0B8B0"
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />

          <Text className="mb-1 mt-3 text-xs font-medium text-[#A09080]">이메일</Text>
          <View className="flex-row gap-2">
            <TextInput
              placeholder="이메일을 입력해주세요"
              placeholderTextColor="#C0B8B0"
              className="h-[52px] flex-1 rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />
            <Pressable className="ml-[10px] h-[52px] w-[64px] items-center justify-center rounded-sm border border-border bg-bg">
              <Text className="text-sm font-semibold text-[#6B7280]">인증</Text>
            </Pressable>
          </View>

          <Pressable className="mt-4 h-[52px] items-center justify-center rounded-lg bg-btn-dark">
            <Text className="text-base font-semibold text-white">아이디 찾기</Text>
          </Pressable>
        </View>

        <View
          className="relative mt-4 w-full border border-border bg-white px-3 pb-4 pt-6"
          style={cardShadowStyle}
        >
          <View className="absolute -top-[5px] left-1/2 z-10 h-[13px] w-[50px] -translate-x-1/2 rounded-[1px] bg-[#B8E8C0]" />
          <Text className="text-center text-sm text-[#A09080]">회원님의 아이디는</Text>
          <Text className="mb-[6px] mt-[11px] text-center text-xl font-bold text-btn-dark">
            ham4246
          </Text>
          <Text className="text-center text-sm text-[#A09080]">입니다.</Text>

          <View className="mt-5 flex-row">
            <Pressable className="h-[42px] flex-1 items-center justify-center border border-border bg-white">
              <Text className="text-base font-semibold text-btn-dark">확인</Text>
            </Pressable>
            <Pressable
              className="ml-[27px] h-[42px] flex-1 items-center justify-center bg-btn-dark"
              onPress={() => router.push('/(app)/auth/find-password')}
            >
              <Text className="text-base font-semibold text-white">비밀번호 찾기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
