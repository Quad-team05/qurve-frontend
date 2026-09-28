import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ApiError } from '@/lib/api/client';
import { getBookmarkedProblems, removeProblemBookmark, type Problem } from '@/lib/api/problem';
import { getWrongNotes, type WrongNoteSummary } from '@/lib/api/wrongnote';
import { clearAuthSession } from '@/lib/auth/session';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Calendar, LocaleConfig, type DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

LocaleConfig.locales.ko = {
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const cardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

const calendarTheme = {
  textMonthFontSize: 12,
  textDayHeaderFontSize: 9,
  textDayFontSize: 12,
  textDayFontWeight: '600',
  dayTextColor: '#000000',
  textDisabledColor: '#C8C0B0',
  todayTextColor: '#4B5563',
  'stylesheet.calendar.main': {
    week: {
      marginTop: 10,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
  },
  'stylesheet.calendar.header': {
    header: { display: 'none' },
    dayHeader: {
      marginTop: 0,
      marginBottom: 20,
      width: 32,
      textAlign: 'center',
      fontSize: 11,
      fontWeight: '700',
      color: '#A8A092',
    },
    dayTextAtIndex5: { color: '#7ABDFF' },
    dayTextAtIndex6: { color: '#FF383C' },
  },
} as any;

function toYearMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function changeMonth(yearMonth: string, amount: number) {
  const [year, month] = yearMonth.split('-').map(Number);
  return toYearMonth(new Date(year, month - 1 + amount, 1));
}

function formatDate(value: string | null) {
  return value ? value.replaceAll('-', '.') : '-';
}

type TabType = 'WRONG_NOTE' | 'BOOKMARK';

export default function WrongNoteListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('WRONG_NOTE');

  const [currentMonth, setCurrentMonth] = useState(() => toYearMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [wrongNoteDates, setWrongNoteDates] = useState<string[]>([]);
  const [wrongNotes, setWrongNotes] = useState<WrongNoteSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [bookmarkedProblems, setBookmarkedProblems] = useState<Problem[]>([]);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(true);

  const loadWrongNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const result = await getWrongNotes(currentMonth);
      setWrongNoteDates(result.wrongNoteDates);
      setWrongNotes(result.wrongNotes);
      setSelectedDate((previous) => (previous?.startsWith(result.yearMonth) ? previous : null));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }
      setWrongNoteDates([]);
      setWrongNotes([]);
      setErrorMessage(
        error instanceof ApiError ? error.message : '오답노트를 불러오지 못했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, router]);

  const loadBookmarkedProblems = useCallback(async () => {
    try {
      setIsBookmarkLoading(true);
      const result = await getBookmarkedProblems();
      setBookmarkedProblems(result);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }
      console.error('북마크 문제를 불러오지 못했습니다.', error);
    } finally {
      setIsBookmarkLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      void loadWrongNotes();
    }, [loadWrongNotes]),
  );

  useFocusEffect(
    useCallback(() => {
      void loadBookmarkedProblems();
    }, [loadBookmarkedProblems]),
  );

  const handleRemoveBookmark = async (problemId: number) => {
    try {
      await removeProblemBookmark(problemId);
      setBookmarkedProblems((prev) => prev.filter((p) => p.problemId !== problemId));
    } catch (error) {
      console.error('북마크 해제에 실패했습니다.', error);
    }
  };

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    wrongNoteDates.forEach((date) => {
      marks[date] = {
        customStyles: {
          container: {
            width: 25,
            height: 25,
            borderRadius: 12.5,
            backgroundColor: '#F9C8D8',
            alignItems: 'center',
            justifyContent: 'center',
          },
          text: { color: '#2A2018', fontWeight: '700' },
        },
      };
    });
    if (selectedDate) {
      marks[selectedDate] = {
        customStyles: {
          container: {
            width: 25,
            height: 25,
            borderRadius: 12.5,
            backgroundColor: '#2A2018',
            alignItems: 'center',
            justifyContent: 'center',
          },
          text: { color: '#FFFFFF', fontWeight: '700' },
        },
      };
    }
    return marks;
  }, [selectedDate, wrongNoteDates]);

  const visibleWrongNotes = useMemo(
    () =>
      selectedDate
        ? wrongNotes.filter((item) => item.wrongAnsweredDate === selectedDate)
        : wrongNotes,
    [selectedDate, wrongNotes],
  );

  const moveMonth = (amount: number) => {
    setSelectedDate(null);
    setCurrentMonth((previous) => changeMonth(previous, amount));
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate((previous) => (previous === day.dateString ? null : day.dateString));
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="오답노트" />

      {/* 탭 */}
      <View className="flex-row gap-x-2 px-4 pt-3">
        <Pressable
          className={`flex-1 items-center rounded-sm border py-2.5 ${
            activeTab === 'WRONG_NOTE' ? 'border-btn-dark bg-btn-dark' : 'border-border bg-white'
          }`}
          onPress={() => setActiveTab('WRONG_NOTE')}
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: activeTab === 'WRONG_NOTE' ? '#fff' : '#A09080' }}
          >
            오답노트
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 items-center rounded-sm border py-2.5 ${
            activeTab === 'BOOKMARK' ? 'border-btn-dark bg-btn-dark' : 'border-border bg-white'
          }`}
          onPress={() => setActiveTab('BOOKMARK')}
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: activeTab === 'BOOKMARK' ? '#fff' : '#A09080' }}
          >
            북마크 문제
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'WRONG_NOTE' ? (
          <>
            <View className="mb-3 flex-row items-center justify-between px-1">
              <Pressable hitSlop={12} onPress={() => moveMonth(-1)}>
                <Text className="text-sm font-semibold text-text-brown">←</Text>
              </Pressable>
              <Text className="text-sm font-semibold text-text-brown">
                {currentMonth.replace('-', '.')}
              </Text>
              <Pressable hitSlop={12} onPress={() => moveMonth(1)}>
                <Text className="text-sm font-semibold text-text-brown">→</Text>
              </Pressable>
            </View>

            <View
              className="rounded-sm border border-border bg-white px-2 pb-2 pt-3"
              style={cardShadowStyle}
            >
              <Calendar
                key={currentMonth}
                current={`${currentMonth}-01`}
                firstDay={1}
                markingType="custom"
                hideArrows
                hideExtraDays={false}
                renderHeader={() => null}
                enableSwipeMonths={false}
                markedDates={markedDates}
                onDayPress={handleDayPress}
                theme={calendarTheme}
                style={{ borderRadius: 2, paddingBottom: 2 }}
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <Text className="text-xs text-text-brown">
                {selectedDate ? `${formatDate(selectedDate)} 오답` : '오답노트 목록'}
              </Text>
              {selectedDate ? (
                <Pressable onPress={() => setSelectedDate(null)}>
                  <Text className="text-xs font-semibold text-text-brown">전체 보기</Text>
                </Pressable>
              ) : null}
            </View>

            {isLoading ? (
              <View className="rounded-sm border border-border bg-white p-4">
                <Text className="text-sm text-text-brown">오답노트를 불러오는 중...</Text>
              </View>
            ) : null}
            {!isLoading && errorMessage ? (
              <View className="rounded-sm border border-border bg-white p-4">
                <Text className="text-sm text-[#DC2626]">{errorMessage}</Text>
                <Pressable
                  className="mt-3 self-start rounded-sm bg-btn-dark px-4 py-2"
                  onPress={() => void loadWrongNotes()}
                >
                  <Text className="text-xs font-semibold text-white">다시 시도</Text>
                </Pressable>
              </View>
            ) : null}
            {!isLoading && !errorMessage && visibleWrongNotes.length === 0 ? (
              <View className="rounded-sm border border-border bg-white p-4">
                <Text className="text-sm text-text-brown">
                  {selectedDate
                    ? '선택한 날짜에 저장된 오답이 없어요.'
                    : '이번 달에 저장된 오답이 없어요.'}
                </Text>
              </View>
            ) : null}

            {!isLoading &&
              !errorMessage &&
              visibleWrongNotes.map((item) => (
                <Pressable
                  key={`${item.problemId}-${item.wrongSubmissionId}`}
                  className="mb-4 rounded-sm border border-border bg-white px-4 py-4"
                  style={cardShadowStyle}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/learning/wrong-note/detail',
                      params: {
                        problemId: String(item.problemId),
                        wrongSubmissionId: String(item.wrongSubmissionId),
                      },
                    })
                  }
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <Text className="flex-1 font-bold text-lg text-black">{item.title}</Text>
                    {item.reviewed ? (
                      <Text className="text-xs font-semibold text-[#059669]">복습 완료</Text>
                    ) : null}
                  </View>
                  <Text className="mt-2 text-sm font-semibold text-text-brown">
                    학습일: {formatDate(item.wrongAnsweredDate)}
                  </Text>
                  <Text className="mt-[1px] text-sm font-semibold text-text-brown">
                    복습일: {formatDate(item.reviewedDate)}
                  </Text>
                  <Text className="mt-5 self-end text-sm font-semibold text-text-gray">
                    문제보기 →
                  </Text>
                </Pressable>
              ))}
          </>
        ) : (
          <>
            {isBookmarkLoading ? (
              <View className="rounded-sm border border-border bg-white p-4">
                <Text className="text-sm text-text-brown">북마크 문제를 불러오는 중...</Text>
              </View>
            ) : bookmarkedProblems.length === 0 ? (
              <View className="rounded-sm border border-border bg-white p-4">
                <Text className="text-sm text-text-brown">북마크한 문제가 없어요.</Text>
              </View>
            ) : (
              bookmarkedProblems.map((problem) => (
                <View
                  key={problem.problemId}
                  className="mb-4 rounded-sm border border-border bg-white px-4 py-4"
                  style={cardShadowStyle}
                >
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-xs font-semibold text-text-brown">
                      {problem.level} · {problem.category}
                    </Text>
                    <Pressable onPress={() => handleRemoveBookmark(problem.problemId)} hitSlop={8}>
                      <Text style={{ fontSize: 16, color: '#D97706' }}>🔖</Text>
                    </Pressable>
                  </View>
                  <Text className="text-sm font-semibold text-black">{problem.questionText}</Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
