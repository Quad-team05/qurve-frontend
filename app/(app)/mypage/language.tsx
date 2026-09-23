import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ApiError } from '@/lib/api/client';
import {
  getMyProfile,
  updateLearningLanguage,
  type LearningLanguage,
  type UserProfile,
} from '@/lib/api/user';
import { clearAuthSession } from '@/lib/auth/session';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN_LIGHT = '#E1F5EE';
const GREEN_BORDER = '#5DCAA5';
const GREEN_TEXT = '#0F6E56';
function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }
  Alert.alert(message);
}

export default function LanguageSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  const currentLanguage: LearningLanguage = profile?.learningLanguage ?? 'JAPANESE';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const result = await getMyProfile();
        setProfile(result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearAuthSession();
          router.replace('/(app)/auth/login');
          return;
        }
        showToast('회원 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  const handleSwitchLanguage = async () => {
    if (isSwitching) return;

    const nextLanguage: LearningLanguage = currentLanguage === 'JAPANESE' ? 'ENGLISH' : 'JAPANESE';

    try {
      setIsSwitching(true);
      await updateLearningLanguage(nextLanguage);
      showToast(
        nextLanguage === 'ENGLISH' ? '영어 학습으로 전환했어요.' : '일본어 학습으로 전환했어요.',
      );
      router.back();
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : '언어 전환에 실패했습니다.');
    } finally {
      setIsSwitching(false);
    }
  };

  const isJapaneseActive = currentLanguage === 'JAPANESE';

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="학습 언어" />

      <View className="p-4">
        <Text className="mb-3 font-regular text-xs text-text-brown">
          언어를 전환해도 레벨과 기록은 그대로 유지돼요
        </Text>

        {/* 일본어 카드 */}
        <View className="relative mb-3">
          <View className="absolute -top-[5px] left-4 z-10 h-[13px] w-[50px] rounded-[1px] bg-[#FFE566] opacity-85" />
          <View className="rounded-sm border border-border bg-white p-4 pt-5">
            <View className="flex-row items-center gap-x-2.5">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#F9C8D8',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18 }}>🇯🇵</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semiBold text-sm text-btn-dark">일본어</Text>
                <Text className="mt-0.5 font-regular text-xs text-text-brown">
                  {isLoading ? '불러오는 중...' : `Lv.${profile?.currentLevel ?? '-'}`}
                </Text>
              </View>
              {isJapaneseActive && (
                <View
                  style={{
                    backgroundColor: GREEN_LIGHT,
                    borderWidth: 0.5,
                    borderColor: GREEN_BORDER,
                    borderRadius: 10,
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ fontSize: 10, color: GREEN_TEXT, fontWeight: '600' }}>
                    학습 중
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 영어 카드 */}
        <View className="relative mb-4">
          <View className="absolute -top-[5px] left-4 z-10 h-[13px] w-[50px] rounded-[1px] bg-[#B8D4F0] opacity-85" />
          <View className="rounded-sm border border-border bg-white p-4 pt-5">
            <View className="flex-row items-center gap-x-2.5">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#B8D4F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18 }}>🇺🇸</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semiBold text-sm text-btn-dark">영어</Text>
                <Text className="mt-0.5 font-regular text-xs text-text-brown">
                  {isJapaneseActive
                    ? '전환 후 확인할 수 있어요'
                    : `Lv.${profile?.currentLevel ?? '-'}`}
                </Text>
              </View>
              {!isJapaneseActive && (
                <View
                  style={{
                    backgroundColor: GREEN_LIGHT,
                    borderWidth: 0.5,
                    borderColor: GREEN_BORDER,
                    borderRadius: 10,
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ fontSize: 10, color: GREEN_TEXT, fontWeight: '600' }}>
                    학습 중
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <Pressable
          className="items-center rounded-sm bg-btn-dark py-3.5"
          onPress={handleSwitchLanguage}
          disabled={isSwitching}
          style={{ opacity: isSwitching ? 0.6 : 1 }}
        >
          <Text className="font-semiBold text-sm text-white">
            {isSwitching
              ? '전환 중...'
              : isJapaneseActive
                ? '영어로 전환하기'
                : '일본어로 전환하기'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
