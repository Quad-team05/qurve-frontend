import Text from '@/components/ui/AppText';
import TextInput from '@/components/ui/AppTextInput';
import TopBar from '@/components/ui/TopBar';
import { findLoginId } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { router } from 'expo-router';

import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const cardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function FindIdPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [foundLoginId, setFoundLoginId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setErrorMessage('이름과 이메일을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const result = await findLoginId({
        name: trimmedName,
        email: trimmedEmail,
      });

      setFoundLoginId(result.loginId);
      setShowResultModal(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message || '아이디 찾기에 실패했습니다.');
      } else {
        setErrorMessage('아이디 찾기에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="아이디 찾기" />

      <View className="flex-1 px-4 pt-[14px]">
        <View className="relative w-full border border-border bg-white p-4" style={cardShadowStyle}>
          <View className="absolute -top-[5px] left-[14px] z-10 h-[13px] w-[50px] rounded-[1px] bg-[#FFE566]" />
          <Text className="mb-1 text-xs font-medium text-[#A09080]">이름</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="이름을 입력해주세요"
            placeholderTextColor="#C0B8B0"
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />

          <Text className="mb-1 mt-3 text-xs font-medium text-[#A09080]">이메일</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="이메일을 입력해주세요"
            placeholderTextColor="#C0B8B0"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            className="h-[52px] rounded-sm border border-border bg-bg px-3 text-base text-btn-dark"
          />

          {errorMessage ? (
            <Text className="mt-3 text-sm text-[#CC4444]">{errorMessage}</Text>
          ) : null}

          <Pressable
            className={`mt-4 h-[52px] items-center justify-center rounded-lg ${
              isSubmitting ? 'bg-[#B9B2A7]' : 'bg-btn-dark'
            }`}
            disabled={isSubmitting}
            onPress={handleSubmit}
          >
            <Text className="text-base font-semibold text-white">
              {isSubmitting ? '확인 중...' : '아이디 찾기'}
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={showResultModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/35 px-4">
          <View
            className="relative w-full border border-border bg-white px-3 pb-4 pt-6"
            style={cardShadowStyle}
          >
            <View className="absolute -top-[5px] left-1/2 z-10 h-[13px] w-[50px] -translate-x-1/2 rounded-[1px] bg-[#B8E8C0]" />
            <Text className="text-center text-sm text-[#A09080]">회원님의 아이디는</Text>
            <Text className="mb-[6px] mt-[11px] text-center font-bold text-xl text-btn-dark">
              {foundLoginId}
            </Text>
            <Text className="text-center text-sm text-[#A09080]">입니다.</Text>

            <View className="mt-5 flex-row gap-x-3">
              <Pressable
                className="h-[42px] flex-1 items-center justify-center border border-border bg-white"
                onPress={() => setShowResultModal(false)}
              >
                <Text className="text-base font-semibold text-btn-dark">확인</Text>
              </Pressable>
              <Pressable
                className="h-[42px] flex-1 items-center justify-center bg-btn-dark"
                onPress={() => {
                  setShowResultModal(false);
                  router.replace('/(app)/auth/login');
                }}
              >
                <Text className="text-base font-semibold text-white">로그인으로</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
