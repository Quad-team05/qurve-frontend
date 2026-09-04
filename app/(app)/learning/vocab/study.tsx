import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ApiError } from '@/lib/api/client';
import { getMyChallenges, normalizeChallengeManagement } from '@/lib/api/challenge';
import {
  completeChallengeWords,
  completeVocabUnit,
  getChallengeWords,
  getVocabWords,
  startVocabUnit,
} from '@/lib/api/vocabulary';
import type { JlptLevel, VocabWord, VocabWordsData } from '@/lib/api/vocabulary';
import { clearAuthSession } from '@/lib/auth/session';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const levels: JlptLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

type StudyWord = VocabWord & {
  bookmarked: boolean;
  revealed: boolean;
};

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

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

function isTruthyParam(value?: string | string[]) {
  return normalizeParam(value) === 'true';
}

function getErrorMessage(error: unknown, isChallengeMode = false) {
  if (!(error instanceof ApiError)) return '단어 목록을 불러오지 못했습니다.';

  if (error.status === 401 || error.status === 403) {
    return '로그인이 필요합니다. 다시 로그인해주세요.';
  }

  if (isChallengeMode && error.code === 'CHALLENGE_NOT_FOUND') {
    return '진행 중인 단어 암기 챌린지가 없습니다.';
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

function getRemainingDays(endDate: string) {
  const [year, month, day] = endDate.split('-').map(Number);
  const end = new Date(year, month - 1, day);
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  return Math.max(0, Math.ceil((endOnly.getTime() - todayOnly.getTime()) / 86400000));
}

export default function VocabStudyPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    level?: string | string[];
    unitNumber?: string | string[];
    unitName?: string | string[];
    challenge?: string | string[];
  }>();
  const isChallengeMode = useMemo(() => isTruthyParam(params.challenge), [params.challenge]);
  const level = useMemo(() => parseLevel(params.level), [params.level]);
  const unitNumber = useMemo(() => parseUnitNumber(params.unitNumber), [params.unitNumber]);
  const unitName =
    normalizeParam(params.unitName) || (isChallengeMode ? '챌린지 단어' : `UNIT ${unitNumber}`);
  const [wordsData, setWordsData] = useState<VocabWordsData | null>(null);
  const [words, setWords] = useState<StudyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchWords = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const nextWordsData = isChallengeMode
          ? await (async () => {
              const challengeWords = await getChallengeWords();

              return {
                level,
                unitNumber: 0,
                totalCount: challengeWords.length,
                words: challengeWords,
              };
            })()
          : await (async () => {
              await startVocabUnit(level, unitNumber);
              return getVocabWords(level, unitNumber);
            })();

        if (!mounted) return;

        const sortedWords = nextWordsData.words
          .slice()
          .sort((a, b) => a.orderNumber - b.orderNumber);

        setWordsData(nextWordsData);
        setWords(
          sortedWords.map((word, index) => ({
            ...word,
            orderNumber: word.orderNumber || index + 1,
            bookmarked: false,
            revealed: false,
          })),
        );
      } catch (error) {
        if (!mounted) return;

        setWordsData(null);
        setWords([]);
        setErrorMessage(getErrorMessage(error, isChallengeMode));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchWords();

    return () => {
      mounted = false;
    };
  }, [isChallengeMode, level, unitNumber]);

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

  const handleComplete = async () => {
    if (isCompleting) return;

    try {
      setIsCompleting(true);
      if (isChallengeMode) {
        const result = await completeChallengeWords(words.map((word) => word.wordId));
        const management = normalizeChallengeManagement(await getMyChallenges());
        const wordChallenge = [
          ...management.activeChallenges,
          ...management.completedChallenges,
          ...(management.failedChallenges ?? []),
        ].find((challenge) => challenge.goalType === 'WORD_COUNT');
        const remainingDays = wordChallenge ? getRemainingDays(wordChallenge.endDate) : null;
        const remainingText =
          remainingDays === null
            ? ''
            : remainingDays === 0
              ? '오늘이 마지막 날이에요.'
              : `${remainingDays}일 남았어요.`;
        const learnedText =
          result.newlyLearnedWordCount > 0
            ? `${result.newlyLearnedWordCount}개 단어 학습이 반영되었습니다.`
            : '오늘의 챌린지를 이미 달성했어요.';

        showToast([learnedText, remainingText].filter(Boolean).join(' '));
        router.back();
        return;
      }

      await completeVocabUnit(level, unitNumber);
      showToast('단어 학습을 완료했습니다.');
      router.back();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        showToast('로그인이 필요합니다.');
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }

      showToast(error instanceof ApiError ? error.message : '단어 학습 완료 처리에 실패했습니다.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title={isChallengeMode ? '챌린지 단어 학습' : '단어 학습하기'} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-1 font-regular text-xs text-text-brown">
          {isChallengeMode ? unitName : `${level} / ${unitName}`}
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

        {!isLoading &&
          !errorMessage &&
          words.map((word) => (
            <View key={word.wordId} className="mb-2.5 rounded-sm border border-border bg-white p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-regular text-xs text-text-brown">{word.orderNumber}</Text>
                <Pressable onPress={() => toggleBookmark(word.wordId)}>
                  <Text style={{ fontSize: 18, color: word.bookmarked ? '#D97706' : '#C8C0B0' }}>
                    🔖
                  </Text>
                </Pressable>
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
          <Pressable
            className="rounded-sm bg-btn-dark px-7 py-3"
            disabled={isCompleting || isLoading || !!errorMessage || words.length === 0}
            onPress={handleComplete}
            style={{
              opacity: isCompleting || isLoading || errorMessage || words.length === 0 ? 0.6 : 1,
            }}
          >
            <Text className="font-semiBold text-sm text-white">
              {isCompleting ? '완료 처리 중...' : '학습완료'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
