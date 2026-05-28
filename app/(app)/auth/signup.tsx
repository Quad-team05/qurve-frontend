import TopBar from '@/components/ui/TopBar';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const cardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function SignUpPage() {
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const allChecked = useMemo(
    () => agreements.terms && agreements.privacy && agreements.marketing,
    [agreements],
  );

  const requiredChecked = useMemo(() => agreements.terms && agreements.privacy, [agreements]);

  const toggleAll = () => {
    const nextValue = !allChecked;
    setAgreements({
      terms: nextValue,
      privacy: nextValue,
      marketing: nextValue,
    });
  };

  const toggleOne = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getCheckStyle = (checked: boolean) =>
    checked ? 'bg-btn-dark border-btn-dark' : 'bg-white border-border';

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="회원가입" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="relative w-full border border-border bg-white px-4 pb-4 pt-5"
          style={cardShadowStyle}
        >
          <View className="absolute -top-[5px] left-[14px] z-10 h-[13px] w-[50px] rounded-[1px] bg-[#FFE566]" />
          <Text className="mb-1 text-xs font-medium text-[#A09080]">아이디</Text>
          <TextInput
            placeholder="아이디 입력"
            placeholderTextColor="#C0B8B0"
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />

          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">비밀번호</Text>
          <TextInput
            placeholder="영문,숫자,특수문자 포함 8자 이상"
            placeholderTextColor="#C0B8B0"
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />
          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">비밀번호 확인</Text>
          <TextInput
            placeholder="비밀번호 재입력"
            placeholderTextColor="#C0B8B0"
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />
          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">이름</Text>
          <TextInput
            placeholder="이름을 입력해주세요"
            placeholderTextColor="#C0B8B0"
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />
          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">닉네임</Text>
          <TextInput
            placeholder="닉네임을 입력해주세요"
            placeholderTextColor="#C0B8B0"
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />

          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">이메일</Text>
          <View className="flex-row gap-2">
            <TextInput
              placeholder="이메일을 입력해주세요"
              placeholderTextColor="#C0B8B0"
              className="h-[52px] flex-1 rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />
            <Pressable className="ml-[10px] h-[52px] w-[64px] items-center justify-center rounded-sm border border-border bg-btn-dark">
              <Text className="text-sm font-semibold text-white">인증</Text>
            </Pressable>
          </View>

          <Text className="mb-1 pt-4 text-xs font-medium text-[#A09080]">인증번호</Text>
          <View className="flex-row gap-2">
            <TextInput
              placeholder="인증번호를 입력해주세요"
              placeholderTextColor="#C0B8B0"
              className="h-[52px] flex-1 rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
            />
            <Pressable className="ml-[10px] h-[52px] w-[64px] items-center justify-center rounded-sm border border-border bg-btn-dark">
              <Text className="text-sm font-semibold text-white">확인</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-4 rounded-sm border border-border bg-bg p-3">
          <Pressable className="flex-row items-center" onPress={toggleAll}>
            <View
              className={`mr-2 h-5 w-5 items-center justify-center rounded-[4px] border ${getCheckStyle(allChecked)}`}
            >
              {allChecked ? <Text className="text-[11px] text-white">✓</Text> : null}
            </View>
            <Text className="text-sm font-semibold text-btn-dark">약관 전체 동의</Text>
          </Pressable>

          <View className="my-3 h-px bg-border" />

          <View className="gap-3">
            <View className="flex-row items-center">
              <Pressable className="mr-2 flex-row items-center" onPress={() => toggleOne('terms')}>
                <View
                  className={`h-5 w-5 items-center justify-center rounded-[4px] border ${getCheckStyle(agreements.terms)}`}
                >
                  {agreements.terms ? <Text className="text-[11px] text-white">✓</Text> : null}
                </View>
              </Pressable>
              <Text className="flex-1 text-sm text-[#6B655D]">[필수] 이용약관 동의</Text>
              <Pressable onPress={() => router.push('/(app)/auth/terms')}>
                <Text className="text-xs text-[#8C877D] underline">보기</Text>
              </Pressable>
            </View>

            <View className="flex-row items-center">
              <Pressable
                className="mr-2 flex-row items-center"
                onPress={() => toggleOne('privacy')}
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded-[4px] border ${getCheckStyle(agreements.privacy)}`}
                >
                  {agreements.privacy ? <Text className="text-[11px] text-white">✓</Text> : null}
                </View>
              </Pressable>
              <Text className="flex-1 text-sm text-[#6B655D]">
                [필수] 개인정보 수집 및 이용 동의
              </Text>
              <Pressable onPress={() => router.push('/(app)/auth/terms')}>
                <Text className="text-xs text-[#8C877D] underline">보기</Text>
              </Pressable>
            </View>

            <View className="flex-row items-center">
              <Pressable
                className="mr-2 flex-row items-center"
                onPress={() => toggleOne('marketing')}
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded-[4px] border ${getCheckStyle(agreements.marketing)}`}
                >
                  {agreements.marketing ? <Text className="text-[11px] text-white">✓</Text> : null}
                </View>
              </Pressable>
              <Text className="flex-1 text-sm text-[#6B655D]">[선택] 마케팅 정보 수신 동의</Text>
            </View>
          </View>
        </View>

        <Pressable
          className={`mt-4 h-[52px] items-center justify-center rounded-lg ${requiredChecked ? 'bg-btn-dark' : 'bg-[#B9B2A7]'}`}
        >
          <Text className="text-base font-semibold text-white">회원가입</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
