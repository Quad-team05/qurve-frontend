import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ApiError } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth/session';
import { buildVocabularyAudioUrl, getVocabWords } from '@/lib/api/vocabulary';
import type { JlptLevel, VocabWord, VocabWordsData } from '@/lib/api/vocabulary';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const levels: JlptLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

type StudyWord = VocabWord & {
  bookmarked: boolean;
  revealed: boolean;
};

function normalizeParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseLevel(value?: string | string[]): JlptLevel {
  const level = normalizeParam(value);

  if (levels.includes(level as JlptLevel)) return level as JlptLevel;

  return 'N5';
}

function parseUnitNumber(value?: string | string[]) {
  const unitNumber = Number(normalizeParam(value));

  if (Number.isFinite(unitNumber) && unitNumber > 0) return unitNumber;

  return 1;
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return '단어 목록을 불러오지 못했습니다.';

  if (error.status === 401 || error.status === 403) {
    return '로그인이 필요합니다. 다시 로그인해주세요.';
  }

  if (error.code === 'INVALID_LEVEL') {
    return '지원하지 않는 JLPT 레벨입니다.';
  }

  if (error.code === 'VOCABULARY_UNIT_NOT_FOUND') {
    return '해당 유닛의 단어를 찾을 수 없습니다.';
  }

  if (error.code === 'USER_NOT_FOUND') {
    return '사용자 정보를 찾을 수 없습니다.';
  }

  return '단어 목록을 불러오지 못했습니다.';
}

function getDisplayMeaning(word: StudyWord) {
  return (
    word.meaningKo || word.koreanMeaning || word.meaningKr || word.meaningKorean || word.meaning
  );
}

export default function VocabStudyPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    level?: string | string[];
    unitNumber?: string | string[];
    unitName?: string | string[];
  }>();
  const level = useMemo(() => parseLevel(params.level), [params.level]);
  const unitNumber = useMemo(() => parseUnitNumber(params.unitNumber), [params.unitNumber]);
  const unitName = normalizeParam(params.unitName) || `UNIT ${unitNumber}`;
  const [wordsData, setWordsData] = useState<VocabWordsData | null>(null);
  const [words, setWords] = useState<StudyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [playingWordId, setPlayingWordId] = useState<number | null>(null);
  const [audioErrorMessage, setAudioErrorMessage] = useState('');
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchWords = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const nextWordsData = await getVocabWords(level, unitNumber);

        if (!mounted) return;

        setWordsData(nextWordsData);
        setWords(
          nextWordsData.words
            .slice()
            .sort((a, b) => a.orderNumber - b.orderNumber)
            .map((word) => ({
              ...word,
              bookmarked: false,
              revealed: false,
            })),
        );
      } catch (error) {
        if (!mounted) return;

        setWordsData(null);
        setWords([]);
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchWords();

    return () => {
      mounted = false;
    };
  }, [level, unitNumber]);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const toggleReveal = (wordId: number) => {
    setWords((prev) =>
      prev.map((word) => (word.wordId === wordId ? { ...word, revealed: !word.revealed } : word)),
    );
  };

  const toggleBookmark = (wordId: number) => {
    setWords((prev) =>
      prev.map((word) =>
        word.wordId === wordId ? { ...word, bookmarked: !word.bookmarked } : word,
      ),
    );
  };

  const stopAudio = async () => {
    if (!soundRef.current) return;

    await soundRef.current.unloadAsync();
    soundRef.current = null;
    setPlayingWordId(null);
  };

  const downloadAudio = async (word: StudyWord, accessToken: string) => {
    const audioUrl = buildVocabularyAudioUrl(word.audioPath ?? '');
    const fileUri = `${FileSystem.cacheDirectory}vocab-audio-${word.wordId}.mp3`;
    const result = await FileSystem.downloadAsync(audioUrl, fileUri, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.status === 401 || result.status === 403) {
      throw new Error('AUTH_AUDIO_ERROR');
    }

    if (result.status < 200 || result.status >= 300) {
      throw new Error(`AUDIO_STATUS_${result.status}`);
    }

    return result.uri;
  };

  const playWordAudio = async (word: StudyWord) => {
    if (!word.audioPath) {
      setAudioErrorMessage('재생할 음성이 없습니다.');
      return;
    }

    try {
      if (playingWordId === word.wordId) {
        await stopAudio();
        return;
      }

      await stopAudio();
      setAudioErrorMessage('');
      setPlayingWordId(word.wordId);
      const accessToken = await getAccessToken();

      if (!accessToken) {
        setPlayingWordId(null);
        setAudioErrorMessage('로그인이 필요합니다. 다시 로그인해주세요.');
        return;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });

      const audioFileUri = await downloadAudio(word, accessToken);
      const { sound } = await Audio.Sound.createAsync({ uri: audioFileUri }, { shouldPlay: true });

      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || !status.didJustFinish) return;

        sound.unloadAsync();
        if (soundRef.current === sound) soundRef.current = null;
        setPlayingWordId(null);
      });
    } catch (error) {
      soundRef.current = null;
      setPlayingWordId(null);

      if (error instanceof Error && error.message === 'AUTH_AUDIO_ERROR') {
        setAudioErrorMessage('음성 재생 권한이 없습니다. 다시 로그인해주세요.');
        return;
      }

      if (error instanceof Error && error.message.startsWith('AUDIO_STATUS_')) {
        const status = error.message.replace('AUDIO_STATUS_', '');

        if (status === '502') {
          setAudioErrorMessage('서버에서 음성 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
          return;
        }

        setAudioErrorMessage(`음성 파일 요청에 실패했습니다. (${status})`);
        return;
      }

      setAudioErrorMessage('음성을 재생할 수 없습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="단어 학습하기" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-1 font-regular text-xs text-text-brown">
          {level} / {unitName}
        </Text>
        <Text className="mb-3 font-regular text-xs text-text-brown">
          총 {wordsData?.totalCount ?? words.length}개 단어
        </Text>

        {isLoading ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-text-brown">단어를 불러오는 중...</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-[#DC2626]">{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && words.length === 0 ? (
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="font-regular text-sm text-text-brown">표시할 단어가 없습니다.</Text>
          </View>
        ) : null}

        {audioErrorMessage ? (
          <View className="mb-3 rounded-sm border border-border bg-white p-3">
            <Text className="font-regular text-xs text-[#DC2626]">{audioErrorMessage}</Text>
          </View>
        ) : null}

        {!isLoading &&
          !errorMessage &&
          words.map((word) => (
            <View key={word.wordId} className="mb-2.5 rounded-sm border border-border bg-white p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-regular text-xs text-text-brown">{word.orderNumber}</Text>
                <View className="flex-row items-center gap-3">
                  <Pressable
                    className="h-8 w-8 items-center justify-center rounded-full border border-border bg-bg"
                    onPress={() => playWordAudio(word)}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: playingWordId === word.wordId ? '#2A2018' : '#A09080',
                      }}
                    >
                      {playingWordId === word.wordId ? '■' : '▶'}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => toggleBookmark(word.wordId)}>
                    <Text style={{ fontSize: 18, color: word.bookmarked ? '#D97706' : '#C8C0B0' }}>
                      🔖
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Text className="mb-1 text-center font-regular text-4xl text-btn-dark">
                {word.expression}
              </Text>

              <Text className="mb-3 text-center font-regular text-sm text-text-brown">
                {word.reading}
              </Text>

              <Pressable
                className="rounded-sm border border-border bg-bg py-2"
                onPress={() => toggleReveal(word.wordId)}
              >
                <Text
                  className="text-center font-regular text-sm"
                  style={{ color: word.revealed ? '#2A2018' : '#A09080' }}
                >
                  {word.revealed ? getDisplayMeaning(word) : '뜻 보기'}
                </Text>
              </Pressable>
            </View>
          ))}

        <View className="mt-2 flex-row items-center justify-between border-t border-dashed border-border pt-4">
          <Text className="text-2xl text-text-brown">↓</Text>
          <Pressable className="rounded-sm bg-btn-dark px-7 py-3" onPress={() => router.back()}>
            <Text className="font-semiBold text-sm text-white">학습완료</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
