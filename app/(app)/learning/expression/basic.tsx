import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ApiError } from '@/lib/api/client';
import {
  downloadBasicExpressionAudio,
  getBasicExpressions,
  type BasicExpression,
} from '@/lib/api/expression';
import { getMyProfile } from '@/lib/api/user';
import { clearAuthSession } from '@/lib/auth/session';
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

function getAudioErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return '표현 발음을 재생하지 못했습니다.';
  if (error.message === 'AUTH_AUDIO_ERROR') return '음성 재생을 위해 다시 로그인해주세요.';
  if (!error.message.startsWith('AUDIO_STATUS_')) return '표현 발음을 재생하지 못했습니다.';

  const status = error.message.replace('AUDIO_STATUS_', '');
  return status === '502'
    ? '서버에서 음성 생성에 실패했습니다. 잠시 후 다시 시도해주세요.'
    : `음성 파일 요청에 실패했습니다. (${status})`;
}

export default function BasicExpressionPage() {
  const router = useRouter();
  const [expressions, setExpressions] = useState<BasicExpression[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [playingExpressionId, setPlayingExpressionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const audioPlayer = useAudioPlayer(null);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  useEffect(() => {
    if (audioStatus.didJustFinish) setPlayingExpressionId(null);
  }, [audioStatus.didJustFinish]);

  useEffect(() => {
    let mounted = true;

    const loadExpressions = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const profile = await getMyProfile();
        if (!mounted) return;

        if (profile.learningLanguage === 'ENGLISH') {
          router.replace('/(tabs)');
          return;
        }

        const result = await getBasicExpressions();
        if (!mounted) return;

        setExpressions(result);
        setSelectedCategory(result[0]?.category ?? '');
      } catch (error) {
        if (!mounted) return;

        if (error instanceof ApiError && error.status === 401) {
          await clearAuthSession();
          router.replace('/(app)/auth/login');
          return;
        }

        setErrorMessage(
          error instanceof ApiError ? error.message : '초급 표현을 불러오지 못했습니다.',
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadExpressions();

    return () => {
      mounted = false;
    };
  }, [router]);

  const categories = useMemo(
    () => Array.from(new Set(expressions.map((expression) => expression.category))),
    [expressions],
  );
  const visibleExpressions = useMemo(
    () => expressions.filter((expression) => expression.category === selectedCategory),
    [expressions, selectedCategory],
  );

  const playAudio = async (expressionId: number) => {
    try {
      if (playingExpressionId === expressionId && audioStatus.playing) {
        audioPlayer.pause();
        setPlayingExpressionId(null);
        return;
      }

      setPlayingExpressionId(expressionId);
      const audioUri = await downloadBasicExpressionAudio(expressionId);
      audioPlayer.replace({ uri: audioUri });
      audioPlayer.play();
    } catch (error) {
      setPlayingExpressionId(null);
      showToast(getAudioErrorMessage(error));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="초급 표현" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-3 font-regular text-xs text-text-brown">카테고리별 기본 표현</Text>

        <Pressable
          className="mb-4 min-h-[48px] flex-row items-center justify-between rounded-sm border border-border bg-white px-4 py-3"
          onPress={() => router.push('/(app)/learning/expression/kana' as Href)}
        >
          <View>
            <Text className="font-semiBold text-sm text-btn-dark">히라가나 · 가타카나</Text>
            <Text className="mt-0.5 font-regular text-xs text-text-brown">일본어 문자표</Text>
          </View>
          <Text className="font-semiBold text-sm text-text-brown">보기 →</Text>
        </Pressable>

        {categories.length > 0 ? (
          <ScrollView
            horizontal
            className="mb-4"
            contentContainerClassName="gap-x-2"
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category) => {
              const isSelected = category === selectedCategory;

              return (
                <Pressable
                  key={category}
                  className={`min-h-[42px] items-center justify-center rounded-sm border px-4 py-2 ${
                    isSelected ? 'border-btn-dark bg-btn-dark' : 'border-border bg-white'
                  }`}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    className={`font-semiBold text-sm ${
                      isSelected ? 'text-white' : 'text-text-brown'
                    }`}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {isLoading ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-text-brown">표현을 불러오는 중...</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-[#DC2626]">{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && visibleExpressions.length === 0 ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-text-brown">표시할 표현이 없습니다.</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage
          ? visibleExpressions.map((expression, index) => (
              <View
                key={expression.expressionId}
                className="mb-2.5 rounded-sm border border-border bg-white p-4"
              >
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="font-regular text-xs text-text-brown">{index + 1}</Text>
                  <Pressable
                    accessibilityLabel={`${expression.kanji} 발음 듣기`}
                    className="h-9 w-9 items-center justify-center"
                    hitSlop={8}
                    onPress={() => void playAudio(expression.expressionId)}
                  >
                    <Ionicons
                      name={
                        playingExpressionId === expression.expressionId && audioStatus.playing
                          ? 'pause-circle-outline'
                          : 'volume-high-outline'
                      }
                      size={23}
                      color="#6F7486"
                    />
                  </Pressable>
                </View>

                <Text className="text-center font-regular text-2xl text-btn-dark">
                  {expression.kanji}
                </Text>
                {expression.hiragana && expression.hiragana !== expression.kanji ? (
                  <Text className="mt-1 text-center font-regular text-sm text-text-brown">
                    {expression.hiragana}
                  </Text>
                ) : null}
                <Text className="mt-1 text-center font-regular text-xs text-[#A09080]">
                  {expression.romaji}
                </Text>

                <View className="mt-3 rounded-sm border border-border bg-bg px-3 py-2.5">
                  <Text className="text-center font-regular text-sm text-btn-dark">
                    {expression.translation}
                  </Text>
                </View>
              </View>
            ))
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}
