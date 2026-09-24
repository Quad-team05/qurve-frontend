import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ApiError } from '@/lib/api/client';
import {
  addProblemBookmark,
  getBookmarkedProblems,
  removeProblemBookmark,
} from '@/lib/api/problem';
import {
  completeWrongNoteReview,
  getWrongNoteSolution,
  type WrongNoteSolution,
} from '@/lib/api/wrongnote';
import { clearAuthSession } from '@/lib/auth/session';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const questionCardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }
  Alert.alert(message);
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function mapSubTypeToLabel(subType?: string) {
  switch (subType) {
    case 'CONTEXT_VOCABULARY':
      return '문맥 어휘';
    case 'KANJI_READING':
      return '한자 읽기';
    case 'USAGE':
      return '용법';
    case 'GRAMMAR_PATTERN':
      return '문형';
    case 'READING_COMPREHENSION':
      return '독해';
    default:
      return subType || '문제';
  }
}

function mapQuestionFormatToLabel(questionFormat?: string) {
  return questionFormat === 'MULTIPLE_CHOICE' ? '객관식' : questionFormat || '문제';
}

function renderRichText(value: string | null, className: string) {
  const normalizedText = value?.trim();
  if (!normalizedText) return null;

  const underlinePattern = /<u>(.*?)<\/u>/g;
  const segments: { text: string; underlined: boolean }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = underlinePattern.exec(normalizedText);

  while (match) {
    if (match.index > lastIndex) {
      segments.push({ text: normalizedText.slice(lastIndex, match.index), underlined: false });
    }
    segments.push({ text: match[1], underlined: true });
    lastIndex = match.index + match[0].length;
    match = underlinePattern.exec(normalizedText);
  }

  if (segments.length === 0) return <Text className={className}>{normalizedText}</Text>;

  if (lastIndex < normalizedText.length) {
    segments.push({ text: normalizedText.slice(lastIndex), underlined: false });
  }

  return (
    <Text className={className}>
      {segments.map((segment, index) => (
        <Text key={`${segment.text}-${index}`} className={segment.underlined ? 'underline' : ''}>
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

export default function WrongNoteDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ problemId?: string; wrongSubmissionId?: string }>();
  const problemId = Number(getSingleParam(params.problemId));
  const wrongSubmissionId = Number(getSingleParam(params.wrongSubmissionId));
  const [solution, setSolution] = useState<WrongNoteSolution | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarkSubmitting, setIsBookmarkSubmitting] = useState(false);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUnauthorized = useCallback(async () => {
    await clearAuthSession();
    router.replace('/(app)/auth/login');
  }, [router]);

  const loadDetail = useCallback(async () => {
    if (!Number.isInteger(problemId) || problemId <= 0) {
      setErrorMessage('문제 정보를 확인할 수 없습니다.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const [detail, bookmarks] = await Promise.all([
        getWrongNoteSolution(
          problemId,
          Number.isInteger(wrongSubmissionId) && wrongSubmissionId > 0
            ? wrongSubmissionId
            : undefined,
        ),
        getBookmarkedProblems(),
      ]);
      setSolution(detail);
      setIsBookmarked(bookmarks.some((problem) => problem.problemId === problemId));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await handleUnauthorized();
        return;
      }
      setErrorMessage(
        error instanceof ApiError ? error.message : '오답 문제를 불러오지 못했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized, problemId, wrongSubmissionId]);

  useFocusEffect(
    useCallback(() => {
      void loadDetail();
    }, [loadDetail]),
  );

  const handleToggleBookmark = async () => {
    if (isBookmarkSubmitting) return;

    try {
      setIsBookmarkSubmitting(true);
      if (isBookmarked) await removeProblemBookmark(problemId);
      else await addProblemBookmark(problemId);

      setIsBookmarked((previous) => !previous);
      showToast(isBookmarked ? '북마크를 해제했어요.' : '문제를 북마크했어요.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await handleUnauthorized();
        return;
      }
      if (error instanceof ApiError && error.code === 'DUPLICATE_PROBLEM_BOOKMARK') {
        setIsBookmarked(true);
        return;
      }
      if (error instanceof ApiError && error.code === 'PROBLEM_BOOKMARK_NOT_FOUND') {
        setIsBookmarked(false);
        return;
      }
      showToast(error instanceof ApiError ? error.message : '북마크 처리에 실패했습니다.');
    } finally {
      setIsBookmarkSubmitting(false);
    }
  };

  const handleCompleteReview = async () => {
    if (!solution || isReviewSubmitting) return;
    if (solution.reviewed) {
      router.back();
      return;
    }

    try {
      setIsReviewSubmitting(true);
      await completeWrongNoteReview([solution.problemId]);
      showToast('오답 복습을 완료했어요.');
      router.back();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await handleUnauthorized();
        return;
      }
      showToast(error instanceof ApiError ? error.message : '복습 완료 처리에 실패했습니다.');
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="문제보기" />

      {isLoading ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-sm text-text-brown">오답 문제를 불러오는 중...</Text>
        </View>
      ) : errorMessage || !solution ? (
        <View className="flex-1 px-4 pt-6">
          <View className="rounded-sm border border-border bg-white p-4">
            <Text className="text-sm text-[#DC2626]">
              {errorMessage || '오답 문제를 찾을 수 없습니다.'}
            </Text>
            <Pressable
              className="mt-3 self-start rounded-sm bg-btn-dark px-4 py-2"
              onPress={() => void loadDetail()}
            >
              <Text className="text-xs font-semibold text-white">다시 시도</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="flex-1 px-4 pt-3">
          <View className="mb-4 flex-row gap-2">
            <View className="rounded-sm border border-border bg-white px-4 py-2">
              <Text className="text-xs font-semibold text-text-brown">
                {mapQuestionFormatToLabel(solution.questionFormat)}
              </Text>
            </View>
            <View className="rounded-sm border border-border bg-white px-4 py-2">
              <Text className="text-xs font-semibold text-text-brown">
                {mapSubTypeToLabel(solution.subType)}
              </Text>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-5"
            showsVerticalScrollIndicator={false}
          >
            <View className="mx-auto h-[10px] w-[50px] rounded-[1px] bg-[#F9C8D8]" />
            <View
              className="mb-4 rounded-sm border border-border bg-white px-4 pb-5 pt-5"
              style={questionCardShadowStyle}
            >
              <Text className="font-bold text-sm text-[#A09080]">오답 문제</Text>
              {renderRichText(solution.questionText, 'mt-2 font-regular text-lg text-black')}
              {renderRichText(solution.passageText, 'mb-6 mt-5 font-regular text-lg text-black')}

              <View className="mt-5">
                {solution.choices.map((choice) => {
                  const isCorrect = choice.choiceNumber === solution.answerChoiceNumber;
                  const isSelected = choice.choiceNumber === solution.selectedChoiceNumber;
                  const choiceStyle = isCorrect
                    ? 'border-[#34A56F] bg-[#ECF8F1]'
                    : isSelected
                      ? 'border-[#E56A6A] bg-[#FFF0F0]'
                      : 'border-border bg-white';

                  return (
                    <View
                      key={choice.choiceNumber}
                      className={`mb-3 rounded-sm border px-[14px] py-4 ${choiceStyle}`}
                    >
                      <View className="flex-row items-center justify-between gap-3">
                        <Text className="flex-1 text-sm font-semibold text-[#2A2018]">
                          {choice.choiceNumber}. {choice.choiceText}
                        </Text>
                        {isCorrect ? (
                          <Text className="text-xs font-semibold text-[#059669]">정답</Text>
                        ) : isSelected ? (
                          <Text className="text-xs font-semibold text-[#DC2626]">내가 선택</Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>

              <View className="mb-4 mt-2 h-px border-t border-dashed border-border" />
              <Text className="text-xs font-semibold text-text-brown">정답 해설</Text>
              <Text className="mt-2 text-sm leading-6 text-[#2A2018]">
                {solution.explanation || '등록된 해설이 없습니다.'}
              </Text>
              {solution.koreanTranslation ? (
                <>
                  <Text className="mt-5 text-xs font-semibold text-text-brown">한국어 해석</Text>
                  <Text className="mt-2 text-sm leading-6 text-[#2A2018]">
                    {solution.koreanTranslation}
                  </Text>
                </>
              ) : null}
            </View>

            <Pressable
              className="self-end rounded-xl border border-border bg-white px-5 py-2"
              disabled={isBookmarkSubmitting}
              onPress={() => void handleToggleBookmark()}
            >
              <Text className="text-sm font-semibold text-[#2A2018]">
                {isBookmarked ? '북마크 해제 ★' : '북마크 ☆'}
              </Text>
            </Pressable>
          </ScrollView>

          <View className="pb-[18px] pt-3">
            <View className="mb-5 h-px w-full border-t border-dashed border-border" />
            <Pressable
              className="h-[43px] items-center justify-center rounded-xl bg-btn-dark px-6 py-3"
              disabled={isReviewSubmitting}
              onPress={() => void handleCompleteReview()}
            >
              <Text className="font-bold text-sm text-white">
                {solution.reviewed ? '목록으로' : isReviewSubmitting ? '처리 중...' : '복습 완료'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
