import Text from '@/components/ui/AppText';
import { ApiError } from '@/lib/api/client';
import { updateLearningLanguage, type LearningLanguage } from '@/lib/api/user';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function LevelLanguageSelectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async (language: LearningLanguage) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await updateLearningLanguage(language);
      router.replace('/(app)/level/test-survey');
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : '언어 선택에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="font-semiBold mb-1 text-xl text-btn-dark">
          어떤 언어를 배우고 싶으세요?
        </Text>
        <Text className="mb-8 font-regular text-sm text-text-brown">
          선택한 언어로 레벨 테스트가 진행돼요
        </Text>

        <View className="w-full gap-y-3">
          <Pressable
            className="flex-row items-center rounded-sm border border-border bg-white p-5"
            style={{ borderColor: BORDER }}
            onPress={() => handleSelect('JAPANESE')}
            disabled={isSubmitting}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#F9C8D8',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 22 }}>🇯🇵</Text>
            </View>
            <View>
              <Text className="font-semiBold text-base text-btn-dark">일본어</Text>
              <Text className="mt-0.5 font-regular text-xs text-text-brown">JLPT 레벨 테스트</Text>
            </View>
          </Pressable>

          <Pressable
            className="flex-row items-center rounded-sm border border-border bg-white p-5"
            style={{ borderColor: BORDER }}
            onPress={() => handleSelect('ENGLISH')}
            disabled={isSubmitting}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#B8D4F0',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 22 }}>🇺🇸</Text>
            </View>
            <View>
              <Text className="font-semiBold text-base text-btn-dark">영어</Text>
              <Text className="mt-0.5 font-regular text-xs text-text-brown">TOEIC 레벨 테스트</Text>
            </View>
          </Pressable>
        </View>

        {isSubmitting && (
          <Text className="mt-6 font-regular text-xs text-text-brown">처리 중...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
