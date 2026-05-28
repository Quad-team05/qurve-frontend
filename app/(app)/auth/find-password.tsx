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

export default function FindPasswordPage() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="비밀번호 찾기" />

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

          <Text className="mb-1 mt-3 text-xs font-medium text-[#A09080]">인증번호</Text>
          <View className="flex-row gap-2">
            <TextInput
              placeholder="인증번호를 입력해주세요"
              placeholderTextColor="#C0B8B0"
              className="h-[52px] flex-1 rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />
            <Pressable className="ml-[10px] h-[52px] w-[64px] items-center justify-center rounded-sm border border-border bg-bg">
              <Text className="text-sm font-semibold text-[#6B7280]">확인</Text>
            </Pressable>
          </View>

          <Pressable className="mt-4 h-[52px] items-center justify-center rounded-xl bg-btn-dark">
            <Text className="text-base font-semibold text-white">비밀번호 재설정</Text>
          </Pressable>
        </View>

        <View
          className="relative mt-4 w-full border border-border bg-white px-3 pb-5"
          style={cardShadowStyle}
        >
          <View className="absolute -top-[5px] left-1/2 z-10 h-[13px] w-[50px] -translate-x-1/2 rounded-[1px] bg-[#B8D4F0]" />
          <Text className="mb-1 mt-5 text-xs font-medium text-[#A09080]">새 비밀번호</Text>
          <View className="flex-row gap-2">
            <TextInput
              placeholder="영문,숫자,특수문자 포함 8자 이상"
              placeholderTextColor="#C0B8B0"
              className="h-[52px] flex-1 rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />
          </View>
          <Text className="mb-1 mt-3 text-xs font-medium text-[#A09080]">
            영문,숫자,특수문자를 포함해 8자 이상 입력해주세요.
          </Text>

          <Text className="mb-1 mt-3 text-xs font-medium text-[#A09080]">새 비밀번호 확인</Text>
          <View className="flex-row gap-2">
            <TextInput
              placeholder="비밀번호 재입력"
              placeholderTextColor="#C0B8B0"
              className="h-[52px] flex-1 rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />
          </View>

          <View className="mt-5 flex-row">
            <Pressable className="h-[42px] flex-1 items-center justify-center rounded-xl border border-border bg-white">
              <Text className="text-base font-semibold text-btn-dark">취소</Text>
            </Pressable>
            <Pressable
              className="ml-[27px] h-[42px] flex-1 items-center justify-center rounded-xl bg-btn-dark"
              onPress={() => router.push('/(app)/auth/find-password')}
            >
              <Text className="text-base font-semibold text-white">변경</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
