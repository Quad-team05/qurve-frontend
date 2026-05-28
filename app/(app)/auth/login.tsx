import GoogleIcon from '@/assets/icons/google.svg';
import KakaoIcon from '@/assets/icons/kakao.svg';
import NaverIcon from '@/assets/icons/naver.svg';
import Text from '@/components/ui/AppText';
import TextInput from '@/components/ui/AppTextInput';
import { Pressable, View } from 'react-native';

export default function LoginPage() {
  return (
    <View className="flex-1 bg-bg px-5 py-9">
      <View className="mb-6 flex-row items-center justify-between rounded-sm"></View>

      <Text className="text-[11px] font-medium text-[#A09080]">함께 만드는 성장곡선</Text>
      <Text className="mt-[7px] text-[40px] font-extrabold text-btn-dark">Qurve</Text>
      <View className="ml-[12px] mt-3 h-[10px] w-[50px] rounded-[1px] bg-[#FFE566]" />

      <View className="w-full rounded-sm border border-border bg-white px-4 py-4">
        <Text className="text-base text-xs text-[#A09080]">아이디</Text>
        <TextInput
          placeholder="아이디를 입력해주세요"
          placeholderTextColor="#C0B8B0"
          className="mt-1 w-full rounded-sm border border-border bg-bg px-3 py-4 text-base text-btn-dark"
        />

        <Text className="mb-1 mt-2 text-xs text-[#A09080]">비밀번호</Text>
        <TextInput
          placeholder="비밀번호를 입력해주세요"
          placeholderTextColor="#C0B8B0"
          secureTextEntry
          className="mt-1 w-full rounded-sm border border-border bg-bg px-3 py-4 text-base text-btn-dark"
        />

        <Pressable className="mt-4 w-full items-center justify-center rounded-lg bg-btn-dark">
          <Text className="py-4 text-base font-semibold text-white">로그인</Text>
        </Pressable>
      </View>

      <View className="mt-4 flex-row items-center justify-center gap-6">
        <Pressable>
          <Text className="font-bold text-sm text-[#A09080]">아이디 찾기</Text>
        </Pressable>
        <Pressable>
          <Text className="font-bold text-sm text-[#A09080]">비밀번호 찾기</Text>
        </Pressable>
        <Pressable>
          <Text className="font-bold text-sm text-[#A09080]">회원가입</Text>
        </Pressable>
      </View>

      <View className="mt-9 flex-row items-center">
        <View className="h-px flex-1 bg-border" />
        <Text className="mx-3 text-[10px] font-semibold text-[#A09080]">또는</Text>
        <View className="h-px flex-1 bg-border" />
      </View>
      <Text className="mt-3 text-center text-sm font-semibold text-[#A09080]">소셜 로그인</Text>

      <View className="ml-[301px] h-[10px] w-[50px] rounded-[1px] bg-[#B8D4F0]" />
      <View className="border border-border bg-white px-[70px] py-4">
        <View className="flex-row items-center justify-center gap-11">
          <Pressable className="h-[36px] w-[36px] items-center justify-center rounded-sm border border-border bg-white">
            <KakaoIcon width={32} height={32} />
          </Pressable>
          <Pressable className="h-[36px] w-[36px] items-center justify-center rounded-sm border border-border bg-white">
            <NaverIcon width={32} height={32} />
          </Pressable>
          <Pressable className="h-[36px] w-[36px] items-center justify-center rounded-sm border border-border bg-white">
            <GoogleIcon width={32} height={32} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
